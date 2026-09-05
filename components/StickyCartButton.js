'use client';

import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';

export default function StickyCartButton() {
  const cart = useCart();

  const count = cart?.count || 0;

  if (cart?.isOpen) return null;

  return (
    <button
      type="button"
      className="sticky-cart-button"
      onClick={() => cart?.open()}
      aria-label="Open shopping cart"
    >
      <ShoppingCart size={25} />

      {count > 0 && (
        <span className="sticky-cart-count">
          {count}
        </span>
      )}
    </button>
  );
}