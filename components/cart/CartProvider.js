'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag, Ticket, ChevronDown, ArrowRight, LockKeyhole } from 'lucide-react';
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
  return <CartContext.Provider value={{ items, count, subtotal, add, update, remove, isOpen: open, open: () => setOpen(true) }}>{children}<CartDrawer items={items} count={count} subtotal={subtotal} open={open} close={() => setOpen(false)} update={update} remove={remove}/></CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }

function CartDrawer({ items, count, subtotal, open, close, update, remove }) {
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [deliveryConfig, setDeliveryConfig] = useState({ threshold: 2000, charge: 60 });
  const threshold = Number(deliveryConfig.threshold || 2000);
  const delivery = subtotal ? subtotal >= threshold ? 0 : Number(deliveryConfig.charge || 0) : 0;
  const discount = Number(coupon?.discount || 0);
  const total = Math.max(0, subtotal - discount + delivery);
  const isEmpty = items.length === 0;

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('cart-drawer-open');
    return () => document.body.classList.remove('cart-drawer-open');
  }, [open]);

  useEffect(() => {
    fetch('/api/delivery').then(async response => {
      if (!response.ok) return;
      const data = await response.json();
      setDeliveryConfig({ threshold: data.threshold, charge: data.zones?.[0]?.charge });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isEmpty) {
      setCoupon(null);
      setCouponCode('');
      setCouponMessage('');
    }
  }, [isEmpty]);

  useEffect(() => {
    if (coupon && coupon.subtotal !== subtotal) {
      setCoupon(null);
      setCouponMessage('');
    }
  }, [subtotal]);

  async function applyCoupon(event) {
    event.preventDefault();
    if (!couponCode.trim()) return setCouponMessage('কুপন কোড লিখুন।');
    setCouponLoading(true);
    setCouponMessage('');
    try {
      const response = await fetch('/api/cart/coupon', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: couponCode, subtotal }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'এই কুপনটি বৈধ নয়।');
      setCoupon(data);
      localStorage.setItem('khatibazar-coupon', data.code);
      setCouponMessage('কুপন সফলভাবে প্রয়োগ হয়েছে।');
    } catch (error) {
      setCoupon(null);
      setCouponMessage(error.message);
    } finally {
      setCouponLoading(false);
    }
  }

  function clearCoupon() {
    setCoupon(null);
    localStorage.removeItem('khatibazar-coupon');
    setCouponCode('');
    setCouponMessage('');
  }

  return <>
    {open && <button className="drawer-backdrop" aria-label="কার্ট বন্ধ করুন" onClick={close}/>}<aside className={`cart-drawer ${open ? 'is-open' : ''}`} aria-label="কার্ট" aria-hidden={!open}>
      <header className="drawer-head"><h2>আপনার কার্ট <span>({count})</span></h2><button onClick={close} aria-label="কার্ট বন্ধ করুন"><X size={20}/></button></header>
      <div className="drawer-progress"><strong>{subtotal >= threshold ? 'অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!' : `🚚 আরও ${bn.formatPrice(Math.max(0, threshold - subtotal))} কিনলে ফ্রি ডেলিভারি!`}</strong><div><span style={{ width: `${Math.min(100, subtotal / threshold * 100)}%` }}/></div><small><span>{bn.formatPrice(subtotal)} / {bn.formatPrice(threshold)}</span><b>ফ্রি ডেলিভারি</b></small></div>
      <div className={`drawer-items ${isEmpty ? 'is-empty' : ''}`}>{isEmpty ? <div className="drawer-empty"><div className="drawer-empty-icon"><ShoppingBag size={28}/></div><h3>আপনার কার্ট এখন খালি</h3><p>পছন্দের পণ্যগুলো কার্টে যোগ করে কেনাকাটা শুরু করুন।</p><Link className="drawer-shop-now" href="/shop" onClick={close}>কেনাকাটা করুন <ArrowRight size={15}/></Link></div> : items.map(item => { const price = Number(item.product?.salePrice || item.product?.regularPrice || 0); return <div className="drawer-item" key={item.id}><div className="drawer-thumb">{item.product?.images?.[0]?.url ? <img src={item.product.images[0].url} alt=""/> : '📦'}</div><div className="drawer-item-info"><div className="drawer-item-top"><strong>{item.product?.name || 'পণ্য'}</strong><button className="drawer-remove" onClick={() => remove(item.productId)} aria-label="পণ্য মুছে ফেলুন"><Trash2 size={15}/></button></div><span>{bn.formatPrice(price)}</span><div className="drawer-item-bottom"><div className="drawer-qty"><button disabled={item.quantity <= 1} onClick={() => update(item.productId, item.quantity - 1)} aria-label="পরিমাণ কমান"><Minus size={13}/></button><span>{bn.formatNumber(item.quantity)}</span><button onClick={() => update(item.productId, item.quantity + 1)} aria-label="পরিমাণ বাড়ান"><Plus size={13}/></button></div><b>{bn.formatPrice(price * item.quantity)}</b></div></div></div>; })}</div>
      <footer className="drawer-foot"><div className="drawer-summary"><p><span>সাবটোটাল</span><strong>{bn.formatPrice(subtotal)}</strong></p><p><span>ডেলিভারি চার্জ</span><strong>{delivery ? bn.formatPrice(delivery) : 'ফ্রি'}</strong></p><p><span>ডিসকাউন্ট</span><strong className="drawer-discount">-{bn.formatPrice(discount)}</strong></p><p className="drawer-total"><span>মোট</span><strong>{bn.formatPrice(total)}</strong></p></div><div className="drawer-options"><div className="drawer-coupon">{couponOpen ? <form onSubmit={applyCoupon}><div className="drawer-coupon-input"><input value={couponCode} onChange={event => { setCouponCode(event.target.value); setCouponMessage(''); }} placeholder="কুপন কোড লিখুন..." aria-label="কুপন কোড" disabled={couponLoading || isEmpty}/><button type="submit" disabled={couponLoading || isEmpty}>{couponLoading ? 'যাচাই...' : 'প্রয়োগ করুন'}</button></div>{couponMessage && <p className={coupon ? 'is-success' : ''} role="status">{couponMessage}</p>}{coupon && <button type="button" className="drawer-coupon-change" onClick={clearCoupon}>কুপন সরান</button>}</form> : <button type="button" className="drawer-option" disabled={isEmpty} onClick={() => setCouponOpen(true)}><span><Ticket size={15}/> <b>কুপন কোড ব্যবহার করুন</b></span><ChevronDown size={15}/></button>}</div><Link className="drawer-option" href="/cart" onClick={close}><span><ShoppingBag size={15}/> <b>কার্ট দেখুন</b></span><ArrowRight size={15}/></Link></div><Link className={`drawer-checkout ${isEmpty ? 'is-disabled' : ''}`} href={isEmpty ? '#' : '/checkout'} aria-disabled={isEmpty} onClick={event => { if (isEmpty) event.preventDefault(); else close(); }}><LockKeyhole size={15}/> চেকআউট করুন <ArrowRight size={16}/></Link><Link className="drawer-continue" href="/shop" onClick={close}>কেনাকাটা চালিয়ে যান</Link></footer>
    </aside>
  </>;
}