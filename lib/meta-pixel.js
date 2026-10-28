import { getProductVariantPrice } from './product-pricing';

export const META_PIXEL_ID = '1485362603491782';

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function createMetaCommerceParameters(items = [], totalValue) {
  const contents = items
    .map((item) => {
      const product = item.product || item;
      const id = item.productId || product.id;
      const quantity = Number(item.quantity);
      const unitPrice = item.unitPrice === undefined
        ? Number(getProductVariantPrice(item.variant || product.variant, product))
        : Number(item.unitPrice);

      if (!id || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
        return null;
      }

      return {
        id: String(id),
        quantity,
        item_price: roundMoney(unitPrice),
      };
    })
    .filter(Boolean);

  const value = Number.isFinite(Number(totalValue))
    ? Number(totalValue)
    : contents.reduce((sum, item) => sum + item.item_price * item.quantity, 0);

  return {
    ...(contents.length
      ? {
          content_ids: [...new Set(contents.map((item) => item.id))],
          contents,
        }
      : {}),
    currency: 'BDT',
    value: roundMoney(value),
  };
}

export function initializeMetaPixel() {
  if (typeof window === 'undefined') return false;

  if (window.location.pathname === '/order-success') {
    const url = new URL(window.location.href);
    if (url.searchParams.has('order')) {
      url.searchParams.delete('order');
      window.history.replaceState(
        window.history.state,
        '',
        `${url.pathname}${url.search}${url.hash}`
      );
    }
  }

  if (!window.fbq) {
    const fbq = function (...args) {
      if (fbq.callMethod) {
        fbq.callMethod.apply(fbq, args);
      } else {
        fbq.queue.push(args);
      }
    };
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;
  }

  if (!window.__prenaxoMetaPixelInitialized) {
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    window.__prenaxoMetaPixelInitialized = true;
  }

  if (!window.__prenaxoMetaPixelScriptRequested) {
    window.__prenaxoMetaPixelScriptRequested = true;
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);
  }

  return true;
}

export function trackMetaEvent(eventName, parameters = {}) {
  if (!initializeMetaPixel()) return false;
  window.fbq('track', eventName, parameters);
  return true;
}

export function trackMetaPurchaseOnce(orderNumber, parameters) {
  if (typeof window === 'undefined' || !orderNumber) return false;

  const key = `prenaxo:meta:purchase:${orderNumber}`;
  if (!window.__prenaxoMetaPurchases) {
    window.__prenaxoMetaPurchases = new Set();
  }

  let alreadyTracked = window.__prenaxoMetaPurchases.has(key);
  try {
    alreadyTracked = alreadyTracked || window.localStorage.getItem(key) === '1';
  } catch {
    // Keep an in-memory guard when browser storage is unavailable.
  }

  if (alreadyTracked) return false;

  window.__prenaxoMetaPurchases.add(key);
  try {
    window.localStorage.setItem(key, '1');
  } catch {
    // The in-memory guard still prevents duplicate events during this page session.
  }

  return trackMetaEvent('Purchase', parameters);
}
