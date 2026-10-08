'use client';
import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { bn } from '@/lib/i18n';
import { useCart } from '@/components/cart/CartProvider';
import { useAccountRequired } from '@/components/auth/AccountRequiredProvider';

export default function AddToCartButton({ product, productId, quantity = 1 }) {
  const [state, setState] = useState('idle');
  const cart = useCart();
  const { requireAccount } = useAccountRequired();

  async function addToCart() {
    setState('loading');
    try {
      if (!(await requireAccount())) {
        setState('idle');
        return;
      }

      const result = await cart.add(product || { id: productId }, quantity);
      setState(result.ok ? 'added' : 'error');
      if (result.ok && typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'AddToCart');
      }
    } catch {
      setState('error');
    }
  }
  return <button className="btn" onClick={addToCart} disabled={state === 'loading'} aria-label={bn.actions.addToCart}><ShoppingBag size={17}/>{state === 'added' ? 'কার্টে যোগ হয়েছে' : state === 'error' ? 'আবার চেষ্টা করুন' : state === 'loading' ? 'যোগ করা হচ্ছে...' : bn.actions.addToCart}</button>;
}