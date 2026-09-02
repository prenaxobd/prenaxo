'use client';

import { Heart, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';

export default function ProductActions({ product, productId, disabled }) {
  const cartProduct = product || { id: productId };
  const [quantity, setQuantity] = useState(1); const [message, setMessage] = useState(''); const cart = useCart();
  async function add() { const result = await cart.add(cartProduct, quantity); setMessage(result.ok ? 'Added to cart' : result.error || 'Unable to add item'); }
  async function buyNow() { const result = await cart.add(cartProduct, quantity); if (result.ok) window.location.assign('/checkout'); else setMessage(result.error || 'Unable to add item'); }
  async function wishlist() { const response = await fetch('/api/wishlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId:cartProduct.id})}); const data = await response.json(); setMessage(response.ok ? (data.saved ? 'Saved to wishlist' : 'Removed from wishlist') : data.error || 'Please sign in'); }
  return <><div className="qty"><button onClick={() => setQuantity(value => Math.max(1,value - 1))}>-</button><span>{quantity}</span><button onClick={() => setQuantity(value => Math.min(cartProduct.stock || value + 1,value + 1))}>+</button></div><div style={{display:'flex',gap:12,flexWrap:'wrap'}}><button className="btn" disabled={disabled} onClick={add}><ShoppingBag size={17}/> Add to cart</button><button className="btn" disabled={disabled} style={{background:'var(--ink)'}} onClick={buyNow}>Buy now</button><button className="btn" style={{background:'white',color:'var(--ink)',border:'1px solid var(--line)'}} onClick={wishlist}><Heart size={17}/> Wishlist</button></div>{message && <p role="status" style={{color:'var(--green-dark)',fontWeight:700}}>{message}</p>}</>;
}
