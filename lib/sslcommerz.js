import { randomBytes } from 'node:crypto';

export const SSL_COMMERZ_CHANNELS = [
  'bkash',
  'dbblmobilebanking',
  'abbank',
  'ibbl',
  'mtbl',
  'city',
  'bankasia',
  'upay',
  'tapnpay',
];

export function isSslCommerzConfigured() {
  try {
    getConfig();
    getSiteUrl();
    return true;
  } catch {
    return false;
  }
}

export function assertSslCommerzReady() {
  getConfig();
  getSiteUrl();
}

function getConfig() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const mode = (process.env.SSLCOMMERZ_MODE || 'sandbox').trim().toLowerCase();

  if (!storeId || !storePassword) {
    throw new Error('Online payments are not configured.');
  }
  if (!['sandbox', 'live'].includes(mode)) {
    throw new Error('Invalid SSLCommerz mode.');
  }

  const host = mode === 'live' ? 'https://securepay.sslcommerz.com' : 'https://sandbox.sslcommerz.com';
  return { storeId, storePassword, host };
}

function getSiteUrl() {
  const configuredUrl = process.env.NEXTAUTH_URL?.trim();
  if (!configuredUrl) throw new Error('The public site URL is not configured.');

  const siteUrl = new URL(configuredUrl);
  if (siteUrl.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
    throw new Error('Online payments require an HTTPS site URL.');
  }
  return siteUrl.origin;
}

export function createMerchantTransactionId() {
  return `PNX${Date.now()}${randomBytes(5).toString('hex').toUpperCase()}`;
}

export async function createSslCommerzSession({ attempt, order, paymentMethod }) {
  const { storeId, storePassword, host } = getConfig();
  const siteUrl = getSiteUrl();
  const address = order.shippingAddress && typeof order.shippingAddress === 'object'
    ? order.shippingAddress
    : {};
  const params = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: Number(attempt.amount).toFixed(2),
    currency: 'BDT',
    tran_id: attempt.merchantTransactionId,
    success_url: `${siteUrl}/api/payments/sslcommerz/return?result=success`,
    fail_url: `${siteUrl}/api/payments/sslcommerz/return?result=failed`,
    cancel_url: `${siteUrl}/api/payments/sslcommerz/return?result=cancelled`,
    ipn_url: `${siteUrl}/api/payments/sslcommerz/ipn`,
    cus_name: String(order.customerName || 'Customer').slice(0, 50),
    cus_email: String(order.customerEmail || 'customer@prenaxo.com').slice(0, 50),
    cus_add1: String(address.address || 'Bangladesh').slice(0, 50),
    cus_city: String(address.city || address.district || 'Dhaka').slice(0, 50),
    cus_state: String(address.district || address.city || 'Dhaka').slice(0, 50),
    cus_postcode: '0000',
    cus_country: 'Bangladesh',
    cus_phone: String(order.customerPhone || '0000000000').slice(0, 20),
    shipping_method: 'NO',
    product_name: 'Prenaxo order',
    product_category: 'Fashion',
    product_profile: 'physical-goods',
    value_a: order.orderNumber,
  });

  const channel = paymentMethod.gatewayChannel?.trim().toLowerCase();
  if (channel) {
    if (!SSL_COMMERZ_CHANNELS.includes(channel)) {
      throw new Error('This SSLCommerz channel is not supported by the current integration.');
    }
    params.set('multi_card_name', channel);
  }

  const response = await fetch(`${host}/gwprocess/v4/api.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.status !== 'SUCCESS' || !result.GatewayPageURL || !result.sessionkey) {
    throw new Error('The payment provider could not start checkout.');
  }

  const gatewayUrl = new URL(result.GatewayPageURL);
  if (![new URL(host).hostname].includes(gatewayUrl.hostname) || gatewayUrl.protocol !== 'https:') {
    throw new Error('The payment provider returned an invalid checkout URL.');
  }

  return { redirectUrl: gatewayUrl.toString(), sessionKey: result.sessionkey };
}

export async function validateSslCommerzTransaction(validationId) {
  const { storeId, storePassword, host } = getConfig();
  const validationUrl = new URL(`${host}/validator/api/validationserverAPI.php`);
  validationUrl.search = new URLSearchParams({
    val_id: validationId,
    store_id: storeId,
    store_passwd: storePassword,
    format: 'json',
  }).toString();

  const response = await fetch(validationUrl, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('The payment provider validation request failed.');
  return response.json();
}

export async function querySslCommerzTransaction(merchantTransactionId) {
  const { storeId, storePassword, host } = getConfig();
  const queryUrl = new URL(`${host}/validator/api/merchantTransIDvalidationAPI.php`);
  queryUrl.search = new URLSearchParams({
    tran_id: merchantTransactionId,
    store_id: storeId,
    store_passwd: storePassword,
    format: 'json',
  }).toString();

  const response = await fetch(queryUrl, {
    cache: 'no-store',
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('The payment provider status query failed.');
  return response.json();
}
