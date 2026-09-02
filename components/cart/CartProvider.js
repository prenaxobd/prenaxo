'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { bn } from '@/lib/i18n';

const CartContext = createContext(null);

function localCart() { try { return JSON.parse(localStorage.getItem('khatibazar-cart') || '{"items":[]}'); } catch { return { items: [] }; } }
function saveLocal(cart) { localStorage.setItem('khatibazar-cart', JSON.stringify(cart)); }

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { const stored = localCart(); setCart(stored); setReady(true); fetch('/api/cart').then(async response => { if (!response.ok) return; const serverCart = await response.json(); for (const item of stored.items) await fetch('/api/cart', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({productId:item.productId,quantity:item.quantity}) }).catch(() => {}); const refreshed = stored.items.length ? await fetch('/api/cart') : null; setCart(refreshed?.ok ? await refreshed.json() : serverCart); localStorage.removeItem('khatibazar-cart'); }).catch(() => {}); }, []);
  useEffect(() => { if (ready && !cart.id) saveLocal(cart); }, [cart, ready]);
  useEffect(() => { const close = event => event.key === 'Escape' && setOpen(false); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  async function sync(action, payload) {
    if (!cart.id) {
      const items = [...cart.items]; const index = items.findIndex(item => item.productId === payload.productId);
      if (action === 'add') { if (index >= 0) items[index] = { ...items[index], quantity: items[index].quantity + payload.quantity }; else items.push({ id: `guest-${payload.productId}`, productId: payload.productId, quantity: payload.quantity, product: payload.product }); }
      if (action === 'update' && index >= 0) {
        if (payload.quantity <= 0) return setCart({ items: items.filter(item => item.productId !== payload.productId) });
        items[index] = { ...items[index], quantity: payload.quantity };
      }
      if (action === 'remove') return setCart({ items: items.filter(item => item.productId !== payload.productId) });
      setCart({ items }); return;
    }
    const response = await fetch(action === 'remove' ? `/api/cart?productId=${encodeURIComponent(payload.productId)}` : '/api/cart', { method: action === 'add' ? 'POST' : action === 'update' ? 'PATCH' : 'DELETE', headers: action !== 'remove' ? { 'Content-Type': 'application/json' } : undefined, body: action === 'remove' ? undefined : JSON.stringify(payload) });
    if (response.ok) { const refreshed = await fetch('/api/cart'); if (refreshed.ok) setCart(await refreshed.json()); } else { const result = await response.json(); throw new Error(result.error || 'কার্ট আপডেট করা যায়নি।'); }
  }
  async function add(product, quantity = 1) { try { await sync('add', { productId: product.id, quantity, product }); setOpen(true); return { ok: true }; } catch (error) { return { ok: false, error: error.message }; } }
  async function update(productId, quantity) { try { await sync('update', { productId, quantity }); } catch (error) { return error.message; } }
  async function remove(productId) { await sync('remove', { productId }); }
  const items = cart.items || [];
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + Number(item.product?.salePrice || item.product?.regularPrice || 0) * item.quantity, 0);
  return <CartContext.Provider value={{ items, count, subtotal, add, update, remove, open: () => setOpen(true) }}>{children}<CartDrawer items={items} count={count} subtotal={subtotal} open={open} close={() => setOpen(false)} update={update} remove={remove}/></CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }

function CartDrawer({ items, count, subtotal, open, close, update, remove }) { return <>{open && <button className="drawer-backdrop" aria-label="কার্ট বন্ধ করুন" onClick={close}/>}<aside className={`cart-drawer ${open ? 'is-open' : ''}`} aria-label="কার্ট" aria-hidden={!open}><div className="drawer-head"><h2>আপনার কার্ট</h2><button onClick={close} aria-label="কার্ট বন্ধ করুন"><X size={20}/></button></div><div className="drawer-items">{items.length ? items.map(item => <div className="drawer-item" key={item.id}><div className="drawer-thumb">{item.product?.images?.[0]?.url ? <img src={item.product.images[0].url} alt=""/> : '📦'}</div><div className="drawer-item-info"><strong>{item.product?.name}</strong><span>{bn.formatPrice(item.product?.salePrice || item.product?.regularPrice)}</span><div className="drawer-qty"><button onClick={() => update(item.productId, item.quantity - 1)} aria-label="পরিমাণ কমান"><Minus size={14}/></button><span>{item.quantity}</span><button onClick={() => update(item.productId, item.quantity + 1)} aria-label="পরিমাণ বাড়ান"><Plus size={14}/></button><button onClick={() => remove(item.productId)} aria-label="পণ্য মুছে ফেলুন"><Trash2 size={14}/></button></div></div></div>) : <p className="muted">আপনার কার্ট এখনো খালি।</p>}</div><div className="drawer-foot"><p>{count}টি পণ্য <strong>{bn.formatPrice(subtotal)}</strong></p><Link className="btn" href="/checkout" onClick={close}>চেকআউট</Link><Link href="/cart" onClick={close}>কার্ট দেখুন</Link><button className="drawer-continue" onClick={close}>কেনাকাটা চালিয়ে যান</button></div></aside></>; }