'use client';
import OptimizedImage from '@/components/OptimizedImage';

import './CheckoutView.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoaderCircle } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { mergeGuestCart } from '@/components/cart/guest-cart';

export default function CheckoutView() {
  const router = useRouter();
  const { ready: cartReady, clearCart } = useCart();
  const [authState, setAuthState] = useState('loading');
  const [cart, setCart] = useState(null);
  const [delivery, setDelivery] = useState(null);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState('');

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    city: '',
    area: '',
    notes: '',
    paymentMethod: 'COD',
    paymentTransactionId: '',
    couponCode: '',
  });

  useEffect(() => {
    if (!cartReady) return undefined;

    let cancelled = false;
    const savedCoupon =
      localStorage.getItem('khatibazar-coupon');

    async function loadPaymentOptions() {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetch('/api/payment-methods', {
          cache: 'no-store',
          signal: controller.signal,
        });
        const paymentData = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            paymentData.error || 'Unable to load payment methods.'
          );
        }

        const methods = Array.isArray(paymentData) ? paymentData : [];
        if (cancelled) return;

        setPaymentOptions(methods);
        setPaymentError(
          methods.length ? '' : 'No payment method is currently available.'
        );

        const selectedMethod =
          methods.find((method) => method.id === 'COD') || methods[0];
        if (selectedMethod) {
          setForm((current) => ({
            ...current,
            paymentMethod: selectedMethod.id,
          }));
        }
      } catch (err) {
        if (cancelled) return;
        setPaymentOptions([]);
        setPaymentError(
          err.name === 'AbortError'
            ? 'Payment methods took too long to load.'
            : err.message || 'Unable to load payment methods.'
        );
      } finally {
        window.clearTimeout(timeoutId);
        if (!cancelled) setPaymentLoading(false);
      }
    }

    async function loadCheckoutData() {
      try {
        setError('');
        setPaymentError('');

        const authResponse = await fetch('/api/auth/me', {
          cache: 'no-store',
        });
        const authData = await authResponse.json().catch(() => ({}));

        if (!authResponse.ok) {
          throw new Error('Unable to verify your session.');
        }

        if (!authData.user) {
          setAuthState('unauthenticated');
          setPaymentLoading(false);
          return;
        }

        setAuthState('authenticated');

        let localCart = { items: [] };

        try {
          const stored =
            JSON.parse(
              localStorage.getItem(
                'khatibazar-cart'
              ) || '{"items":[]}'
            );

          localCart = stored || { items: [] };
        } catch {
          localCart = { items: [] };
        }

        const [cartResponse, deliveryResponse] = await Promise.all([
          fetch('/api/cart'),
          fetch('/api/delivery'),
        ]);

        const cartData =
          await cartResponse.json().catch(() => ({ items: [] }));

        const deliveryData =
          await deliveryResponse.json();

        let cartFromServer =
          cartResponse.ok && cartData
            ? cartData
            : { items: [] };

        // A guest cart is stored locally first. Persist it before checkout so
        // the order API and the checkout view use the same source of truth.
        if (cartResponse.ok && !(cartFromServer.items || []).length && localCart.items?.length) {
          await mergeGuestCart(localCart.items);

          const refreshedCartResponse = await fetch('/api/cart');
          if (refreshedCartResponse.ok) {
            cartFromServer = await refreshedCartResponse.json();
            localStorage.removeItem('khatibazar-cart');
          }
        }

        const fallbackCart =
          (cartFromServer.items || []).length > 0
            ? cartFromServer
            : localCart;

        if (!deliveryResponse.ok) {
          throw new Error(
            deliveryData.error ||
              'Unable to load delivery options.'
          );
        }

        setCart(fallbackCart);
        setDelivery(deliveryData);

        const firstZone =
          deliveryData.zones?.[0];

        if (firstZone) {
          setForm((current) => ({
            ...current,

            city: firstZone.division,

            area: firstZone.district,

            ...(savedCoupon
              ? {
                  couponCode:
                    savedCoupon,
                }
              : {}),
          }));
        } else {
          setForm((current) => ({
            ...current,

            ...(savedCoupon
              ? {
                  couponCode:
                    savedCoupon,
                }
              : {}),
          }));
        }

        void loadPaymentOptions();
      } catch (err) {
        setPaymentLoading(false);
        setAuthState((current) =>
          current === 'loading' ? 'error' : current
        );
        setError(
          err.message ||
            'Unable to load your checkout.'
        );
      }
    }

    loadCheckoutData();
    return () => {
      cancelled = true;
    };
  }, [cartReady]);

  const items = cart?.items || [];

  const zones = delivery?.zones || [];

  const selectedZone = zones.find(
    (zone) =>
      zone.division === form.city &&
      zone.district === form.area
  );

  const subtotal = items.reduce(
    (sum, item) => {
      const price = Number(
        item.product.salePrice ||
          item.product.regularPrice
      );

      return (
        sum +
        price * item.quantity
      );
    },
    0
  );

  const shipping =
    subtotal >=
    (delivery?.threshold ?? 2000)
      ? 0
      : Number(
          selectedZone?.charge || 0
        );

  const total =
    Math.max(0, subtotal - couponDiscount) + shipping;

  async function applyCoupon() {
    const code = form.couponCode.trim().toUpperCase();
    setCouponMessage('');

    if (!code) {
      setCouponDiscount(0);
      setCouponMessage('Enter a coupon code first.');
      return;
    }

    setCouponLoading(true);

    try {
      const response = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await response.json();

      if (!response.ok) {
        setCouponDiscount(0);
        throw new Error(data.error || 'This coupon is not valid.');
      }

      update('couponCode', data.code);
      setCouponDiscount(Number(data.discount || 0));
      setCouponMessage(`Coupon applied. You saved ৳${Number(data.discount || 0).toLocaleString('en-BD')}.`);
      localStorage.setItem('khatibazar-coupon', data.code);
    } catch (couponError) {
      setCouponMessage(couponError.message);
    } finally {
      setCouponLoading(false);
    }
  }

  const selectedPayment =
    paymentOptions.find(
      (method) =>
        method.id ===
        form.paymentMethod
    );

  const requiresTransactionId = Boolean(selectedPayment?.requiresTransactionId);

  function update(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (!items.length) {
      setError(
        'Your cart is empty.'
      );
      return;
    }

    if (!form.paymentMethod) {
      setError(
        'Please select a payment method.'
      );
      return;
    }

    if (paymentLoading) {
      setError(
        'Please wait for payment methods to load.'
      );
      return;
    }

    if (!paymentOptions.length) {
      setError(
        'No payment method is currently available.'
      );
      return;
    }

    if (
      requiresTransactionId &&
      !form.paymentTransactionId.trim()
    ) {
      setError(
        `Please enter your ${
          selectedPayment?.name ||
          'payment'
        } transaction ID.`
      );
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        '/api/orders',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            customerName:
              form.customerName,

            customerPhone:
              form.customerPhone,

            paymentMethod:
              form.paymentMethod,

            paymentTransactionId:
              requiresTransactionId
                ? form.paymentTransactionId.trim()
                : '',

            orderNote:
              form.notes.trim(),

            couponCode:
              form.couponCode || '',

            shippingAddress: {
              address: form.address,

              city: form.city,

              district: form.area,

              notes: form.notes,
            },
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (data.orderNumber) {
          setError(`${data.error || 'Online checkout is still pending.'} Order number: ${data.orderNumber}.`);
          return;
        }
        throw new Error(
          data.error ||
            'Unable to place order.'
        );
      }

      if ((selectedPayment?.type === 'COD' || data.paymentStatus === 'PAID') && typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', { currency: 'BDT' });
      }

      localStorage.removeItem(
        'khatibazar-coupon'
      );
      clearCart();

      if (data.paymentRedirectUrl) {
        const gatewayUrl = new URL(data.paymentRedirectUrl);
        const approvedGatewayHosts = new Set(['sandbox.sslcommerz.com', 'securepay.sslcommerz.com']);
        if (gatewayUrl.protocol !== 'https:' || !approvedGatewayHosts.has(gatewayUrl.hostname)) {
          throw new Error('The payment provider returned an invalid checkout link. Contact support with your order number.');
        }
        const { paymentRedirectUrl, ...confirmation } = data;
        try {
          sessionStorage.setItem('prenaxo-order-confirmation', JSON.stringify(confirmation));
        } catch {}
        window.location.assign(gatewayUrl.toString());
        return;
      }

      try {
        sessionStorage.setItem(
          'prenaxo-order-confirmation',
          JSON.stringify(data)
        );
      } catch {}

      router.push(`/order-success?order=${data.orderNumber}`);
    } catch (err) {
      setError(
        err.message ||
          'Unable to place order.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (authState === 'unauthenticated') {
    return (
      <main className="container checkout-page">
        <div className="checkout-empty">
          <h1>
            Sign in to continue
          </h1>

          <p>{error}</p>

          <Link
            href="/login?next=/checkout"
            className="btn"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (authState === 'error') {
    return (
      <main className="container checkout-page">
        <div className="checkout-empty">
          <h1>Unable to verify your session</h1>
          <p>{error || 'Please try again.'}</p>
          <Link href="/login?next=/checkout" className="btn">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  if (!cart && error) {
    return (
      <main className="container checkout-page">
        <div className="checkout-empty">
          <h1>Unable to load checkout</h1>
          <p>{error}</p>
          <Link href="/cart" className="btn">
            Return to cart
          </Link>
        </div>
      </main>
    );
  }

  if (!cart) {
    return (
      <main className="container checkout-page">
        <div className="checkout-loading">
          <span className="checkout-spinner" />

          <div>
            <h1>
              Preparing checkout
            </h1>

            <p className="muted">
              {error ||
                'Loading your order…'}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="container checkout-page">
        <div className="checkout-empty">
          <span className="checkout-empty-icon">
            🛒
          </span>

          <h1>
            Your cart is empty
          </h1>

          <p>
            Add some products to your
            cart before proceeding to
            checkout.
          </p>

          <Link
            href="/shop"
            className="btn"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container checkout-page">
      <div className="checkout-progress" aria-label="Checkout steps">
        {[
          'Shopping Cart',
          'Checkout',
          'Payment',
          'Order Complete',
        ].map((label, index) => (
          <div
            key={label}
            className={`checkout-progress-step ${
              index === 1 ? 'active' : ''
            } ${index < 1 ? 'done' : ''}`}
          >
            <span>{index + 1}</span>
            <small>{label}</small>
          </div>
        ))}
      </div>

      <div className="checkout-title">
        <div>
          <span className="checkout-eyebrow">
            Secure checkout
          </span>

          <h1>Checkout</h1>

          <p>
            Complete your details to
            place your order.
          </p>
        </div>

        <Link
          href="/cart"
          className="checkout-back"
        >
          ← Back to cart
        </Link>
      </div>

      <div className="checkout-layout">
        <form
          className="checkout-form"
          onSubmit={submit}
        >
          {/* CONTACT INFORMATION */}

          <section className="checkout-section">
            <div className="section-heading">
              <span className="section-number">
                01
              </span>

              <div>
                <h2>
                  Contact information
                </h2>

                <p>
                  We will use this
                  information for your
                  order.
                </p>
              </div>
            </div>

            <div className="checkout-grid">
              <label className="checkout-field">
                <span>
                  Full name
                </span>

                <input
                  required
                  type="text"
                  placeholder="Enter your full name"
                  value={
                    form.customerName
                  }
                  onChange={(e) =>
                    update(
                      'customerName',
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="checkout-field">
                <span>
                  Phone number
                </span>

                <input
                  required
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={
                    form.customerPhone
                  }
                  onChange={(e) =>
                    update(
                      'customerPhone',
                      e.target.value
                    )
                  }
                />
              </label>
            </div>
          </section>

          {/* SHIPPING ADDRESS */}

          <section className="checkout-section">
            <div className="section-heading">
              <span className="section-number">
                02
              </span>

              <div>
                <h2>
                  Shipping address
                </h2>

                <p>
                  Enter the address where
                  you want your order
                  delivered.
                </p>
              </div>
            </div>

            <label className="checkout-field">
              <span>
                Full address
              </span>

              <input
                required
                placeholder="House, road, village or area"
                value={form.address}
                onChange={(e) =>
                  update(
                    'address',
                    e.target.value
                  )
                }
              />
            </label>

            <div className="checkout-grid">
              <label className="checkout-field">
                <span>
                  Division
                </span>

                <select
                  required
                  value={form.city}
                  onChange={(e) => {
                    const division =
                      e.target.value;

                    const firstDistrict =
                      zones.find(
                        (zone) =>
                          zone.division ===
                          division
                      )?.district || '';

                    setForm((current) => ({
                      ...current,

                      city: division,

                      area:
                        firstDistrict,
                    }));
                  }}
                >
                  {Array.from(
                    new Set(
                      zones.map(
                        (zone) =>
                          zone.division
                      )
                    )
                  ).map((division) => (
                    <option
                      key={division}
                      value={division}
                    >
                      {division}
                    </option>
                  ))}
                </select>
              </label>

              <label className="checkout-field">
                <span>
                  City / Area
                </span>

                <select
                  required
                  value={form.area}
                  onChange={(e) =>
                    update(
                      'area',
                      e.target.value
                    )
                  }
                >
                  {zones
                    .filter(
                      (zone) =>
                        zone.division ===
                        form.city
                    )
                    .map((zone) => (
                      <option
                        key={
                          zone.district
                        }
                        value={
                          zone.district
                        }
                      >
                        {zone.district}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          </section>

          {/* SHIPPING */}

          <section className="checkout-section">
            <div className="section-heading">
              <span className="section-number">
                03
              </span>

              <div>
                <h2>
                  Shipping option
                </h2>

                <p>
                  Delivery cost is
                  calculated based on
                  your location.
                </p>
              </div>
            </div>

            <label className="shipping-option selected">
              <span className="shipping-radio">
                <input
                  type="radio"
                  checked
                  readOnly
                />

                <span />
              </span>

              <span className="shipping-info">
                <strong>
                  Standard delivery
                </strong>

                <small>
                  {selectedZone?.district ||
                    'Select a delivery area'}
                </small>
              </span>

              <strong className="shipping-price">
                {shipping
                  ? `৳${shipping.toLocaleString()}`
                  : 'Free'}
              </strong>
            </label>

            <p className="shipping-note">
              Free delivery on orders
              over ৳
              {Number(
                delivery?.threshold ??
                  2000
              ).toLocaleString()}
              .
            </p>
          </section>

          {/* PAYMENT */}

          <section className="checkout-section">
            <div className="section-heading">
              <span className="section-number">
                04
              </span>

              <div>
                <h2>
                  Payment options
                </h2>

                <p>
                  Select your preferred
                  payment method.
                </p>
              </div>
            </div>

            {paymentLoading ? (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background:
                    '#f8fafc',
                  color:
                    'var(--muted)',
                }}
              >
                Loading payment
                methods...
              </div>
            ) : null}

            {!paymentLoading &&
            paymentOptions.length === 0 ? (
              <div
                className="checkout-error"
                role="alert"
              >
                {paymentError ||
                  'No payment method is currently available.'}
              </div>
            ) : null}

            {!paymentLoading &&
            paymentOptions.length > 0 ? (
              <div className="payment-options">
                {paymentOptions.map(
                  (option) => {
                    const selected =
                      form.paymentMethod ===
                      option.id;

                    const isManualPayment = ['BANK_TRANSFER', 'MANUAL_WALLET'].includes(option.type);
                    const isCashOnDelivery = option.type === 'COD';
                    const isGateway = option.type === 'GATEWAY';

                    return (
                      <label
                        key={option.id}
                        className={`payment-option ${
                          selected
                            ? 'selected'
                            : ''
                        }`}
                      >
                        <div className="payment-option-head">
                          <span className="payment-radio">
                            <input
                              type="radio"
                              name="payment"
                              checked={
                                selected
                              }
                              onChange={() => {
                                update(
                                  'paymentMethod',
                                  option.id
                                );

                                update(
                                  'paymentTransactionId',
                                  ''
                                );
                              }}
                            />

                            <span />
                          </span>

                          {option.logoUrl ? (
                            <OptimizedImage className="payment-logo" src={option.logoUrl} alt="" width={92} height={48} sizes="92px" />
                          ) : null}

                          <span className="payment-name">
                            <strong>
                              {option.title ||
                                option.name}
                            </strong>

                            <small>
                              {option.short ||
                                option.code}
                            </small>
                          </span>
                        </div>

                        {selected ? (
                          <div className="payment-details">
                            {option.detail ? (
                              <p>
                                {
                                  option.detail
                                }
                              </p>
                            ) : null}

                            {isManualPayment ? (
                              <div className="mobile-payment-box">
                                {option.accountNumber ? (
                                  <div><span>Account number</span><strong>{option.accountNumber}</strong></div>
                                ) : null}
                                {option.accountName ? (
                                  <div><span>Account name</span><strong>{option.accountName}</strong></div>
                                ) : null}
                                {option.bankName ? (
                                  <div><span>Bank</span><strong>{option.bankName}</strong></div>
                                ) : null}
                                {option.branchName ? (
                                  <div><span>Branch</span><strong>{option.branchName}</strong></div>
                                ) : null}
                                {option.routingNumber ? (
                                  <div><span>Routing number</span><strong>{option.routingNumber}</strong></div>
                                ) : null}
                                {option.instructions ? <p>{option.instructions}</p> : null}
                                {option.requiresTransactionId ? <label className="checkout-field payment-reference-field">
                                  <span>{option.name || option.title} transaction ID / transfer reference</span>
                                  <input required type="text" maxLength={150} placeholder="Enter your transfer reference" value={form.paymentTransactionId} onChange={(event) => update('paymentTransactionId', event.target.value)} />
                                  <small>Your payment remains under review until our team confirms the transfer.</small>
                                </label> : null}
                              </div>
                            ) : null}

                            {isGateway ? (
                              <div className="gateway-payment-box">
                                <p>Continue to SSLCommerz secure checkout. Available channels depend on your merchant account.</p>
                                <div className="gateway-wallet-logos" aria-label="Supported mobile banking brands">
                                  <OptimizedImage src="https://res.cloudinary.com/ethp0qrs/image/upload/v1790904746/bkash-logo-horizontal-bangla-mobile-banking-app-icon-free-png.png" alt="bKash" width={112} height={46} sizes="112px" />
                                  <OptimizedImage src="https://res.cloudinary.com/ethp0qrs/image/upload/v1790904660/Nagad-Logo.wine.png" alt="Nagad" width={78} height={46} sizes="78px" />
                                  <OptimizedImage src="https://res.cloudinary.com/ethp0qrs/image/upload/v1790905387/rocket-color-logo-mobile-banking-icon-free-png.png" alt="Rocket" width={78} height={46} sizes="78px" />
                                </div>
                              </div>
                            ) : null}

                            {isCashOnDelivery && option.instructions ? (
                              <p>{option.instructions}</p>
                            ) : null}

                            {!['BANK_TRANSFER', 'MANUAL_WALLET', 'GATEWAY', 'COD'].includes(option.type) ? (
                              <p>This payment method is not configured for checkout.</p>
                            ) : null}

                          </div>
                        ) : null}
                      </label>
                    );
                  }
                )}
              </div>
            ) : null}
          </section>

          {/* ORDER NOTE */}

          <section className="checkout-section checkout-note-section">
            <div className="section-heading">
              <span className="section-number">
                05
              </span>

              <div>
                <h2>
                  Additional information
                </h2>

                <p>
                  Add delivery instructions
                  or an order note.
                </p>
              </div>
            </div>

            <label className="checkout-field">
              <span>
                Order note
                <em>Optional</em>
              </span>

              <textarea
                rows="4"
                placeholder="Special delivery instructions..."
                value={form.notes}
                onChange={(e) =>
                  update(
                    'notes',
                    e.target.value
                  )
                }
              />
            </label>
          </section>

          {error && (
            <div
              className="checkout-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="checkout-submit-area">
            <p className="checkout-terms">
              By placing your order, you
              agree to our{' '}
              <Link href="/terms">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy">
                Privacy Policy
              </Link>
              .
            </p>

            <button
              className="btn place-order"
              disabled={
                loading ||
                paymentLoading ||
                !paymentOptions.length
              }
            >
              {loading
                ? <><LoaderCircle size={17} aria-hidden="true" style={{ animation: 'route-loading-spin .75s linear infinite' }} /> Confirming your order…</>
                : `Place order · ৳${total.toLocaleString()}`}
            </button>
          </div>
        </form>

        <OrderSummary
          items={items}
          subtotal={subtotal}
          shipping={shipping}
          couponCode={form.couponCode}
          couponDiscount={couponDiscount}
          couponMessage={couponMessage}
          couponLoading={couponLoading}
          updateCoupon={(value) => {
            update('couponCode', value);
            setCouponDiscount(0);
            setCouponMessage('');
          }}
          applyCoupon={applyCoupon}
          total={total}
        />
      </div>
    </main>
  );
}

function OrderSummary({
  items,
  subtotal,
  shipping,
  couponCode,
  couponDiscount,
  couponMessage,
  couponLoading,
  updateCoupon,
  applyCoupon,
  total,
}) {
  return (
    <aside className="checkout-summary">
      <div className="checkout-summary-head">
        <div>
          <span className="summary-label">
            Your order
          </span>

          <h2>
            Order summary
          </h2>
        </div>

        <span className="summary-count">
          {items.reduce(
            (sum, item) =>
              sum + item.quantity,
            0
          )}{' '}
          items
        </span>
      </div>

      <div className="checkout-products checkout-products-table">
        <div className="checkout-products-head" aria-hidden="true">
          <span>Product</span>
          <span>Qty</span>
          <span>Price</span>
        </div>
        {items.map((item) => {
          const price = Number(
            item.variant?.price ||
              item.product.salePrice ||
              item.product.regularPrice
          );

          const itemTotal =
            price * item.quantity;

          return (
            <div
              className="checkout-product"
              key={item.id}
            >
              <div className="checkout-thumb">
                {item.product.images?.[0]
                  ?.url ? (
                  <OptimizedImage
                    src={
                      item.product
                        .images[0].url
                    }
                    alt={
                      item.product.name
                    }
                  />
                ) : (
                  <div className="no-product-image">
                    No image
                  </div>
                )}

                <b>
                  {item.quantity}
                </b>
              </div>

              <div className="checkout-product-info">
                <strong>
                  {item.product.name}
                </strong>

                <span>
                  ৳
                  {price.toLocaleString()}{' '}
                  each
                </span>
              </div>

              <strong className="checkout-product-total">
                ৳
                {itemTotal.toLocaleString()}
              </strong>
            </div>
          );
        })}
      </div>

      <div className="coupon-box">
        <span className="coupon-title">
          Have a coupon?
        </span>

        <div className="coupon-row">
          <input
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(event) => updateCoupon(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                applyCoupon();
              }
            }}
          />

          <button
            type="button"
            onClick={applyCoupon}
            disabled={couponLoading || !couponCode.trim()}
          >
            {couponLoading ? 'Checking…' : 'Apply'}
          </button>
        </div>
        {couponMessage && (
          <p className={`coupon-message ${couponDiscount ? 'is-success' : 'is-error'}`} role="status">
            {couponMessage}
          </p>
        )}
      </div>

      <div className="summary-calculation">
        <div className="summary-line">
          <span>
            Subtotal
          </span>

          <strong>
            ৳
            {subtotal.toLocaleString()}
          </strong>
        </div>

        {couponDiscount > 0 && <div className="summary-line">
          <span>Discount</span>
          <strong className="coupon-discount">-৳{couponDiscount.toLocaleString('en-BD')}</strong>
        </div>}

        <div className="summary-line">
          <span>
            Shipping
          </span>

          <strong>
            {shipping
              ? `৳${shipping.toLocaleString()}`
              : 'Free'}
          </strong>
        </div>
      </div>

      <div className="summary-total">
        <div>
          <span>Total</span>

          <small>
            Including applicable
            delivery charge
          </small>
        </div>

        <strong>
          ৳
          {total.toLocaleString()}
        </strong>
      </div>

      <Link
        href="/cart"
        className="summary-edit"
      >
        ← Edit cart
      </Link>
    </aside>
  );
}