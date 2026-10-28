import { describe, expect, it } from 'vitest';
import {
  createMetaCommerceParameters,
  trackMetaPurchaseOnce,
} from './meta-pixel';

describe('createMetaCommerceParameters', () => {
  it('uses catalog product IDs and actual variant prices', () => {
    expect(createMetaCommerceParameters([
      {
        productId: 'product-1',
        quantity: 2,
        product: { regularPrice: 900, salePrice: 800 },
        variant: { name: '500 GM', regularPrice: 600, salePrice: 500 },
      },
      {
        product: { id: 'product-2', regularPrice: 250 },
        quantity: 1,
      },
    ])).toEqual({
      content_ids: ['product-1', 'product-2'],
      contents: [
        { id: 'product-1', quantity: 2, item_price: 500 },
        { id: 'product-2', quantity: 1, item_price: 250 },
      ],
      currency: 'BDT',
      value: 1250,
    });
  });

  it('uses the server total when provided and omits invalid cart entries', () => {
    expect(createMetaCommerceParameters([
      { productId: 'product-1', quantity: 1, unitPrice: 19.995 },
      { productId: '', quantity: 1, unitPrice: 20 },
      { productId: 'product-2', quantity: 0, unitPrice: 20 },
    ], 25.555)).toEqual({
      content_ids: ['product-1'],
      contents: [{ id: 'product-1', quantity: 1, item_price: 20 }],
      currency: 'BDT',
      value: 25.56,
    });
  });

  it('deduplicates purchases without putting the order number in event data', () => {
    const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    const events = [];
    const values = new Map();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        location: { pathname: '/shop', href: 'https://prenaxo.com/shop' },
        fbq: (...args) => events.push(args),
        localStorage: {
          getItem: (key) => values.get(key) || null,
          setItem: (key, value) => values.set(key, value),
        },
      },
    });
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: {
        createElement: () => ({}),
        head: { appendChild: () => {} },
      },
    });

    try {
      const eventData = { currency: 'BDT', value: 100 };
      expect(trackMetaPurchaseOnce('order-123', eventData)).toBe(true);
      expect(trackMetaPurchaseOnce('order-123', eventData)).toBe(false);
      expect(events.filter(([, name]) => name === 'Purchase')).toHaveLength(1);
      expect(JSON.stringify(events)).not.toContain('order-123');
    } finally {
      if (originalWindow) {
        Object.defineProperty(globalThis, 'window', originalWindow);
      } else {
        delete globalThis.window;
      }

      if (originalDocument) {
        Object.defineProperty(globalThis, 'document', originalDocument);
      } else {
        delete globalThis.document;
      }
    }
  });
});
