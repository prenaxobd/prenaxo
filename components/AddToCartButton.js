'use client';
import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { bn } from '@/lib/i18n';
import { useCart } from '@/components/cart/CartProvider';

export default function AddToCartButton({ product, productId, quantity = 1 }) {
  const [state, setState] = useState('idle');
  const cart = useCart();
  async function addToCart() {
    setState('loading');
    const result = await cart.add(product || { id: productId }, quantity);
    setState(result.ok ? 'added' : 'error');
  }
  return <button className="btn" onClick={addToCart} disabled={state === 'loading'} aria-label={bn.actions.addToCart}><ShoppingBag size={17}/>{state === 'added' ? 'কার্টে যোগ হয়েছে' : state === 'error' ? 'আবার চেষ্টা করুন' : state === 'loading' ? 'যোগ করা হচ্ছে...' : bn.actions.addToCart}</button>;
}