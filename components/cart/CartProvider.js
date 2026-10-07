'use client';
import OptimizedImage from '@/components/OptimizedImage';
import { createContext, startTransition, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Minus, Plus, Trash2, ShoppingBag, Ticket, ChevronDown, ArrowRight, LockKeyhole } from 'lucide-react';
import { bn } from '@/lib/i18n';
import { mergeGuestCart } from './guest-cart';
import { getCartItemImage, getCartItemOptionLabels } from './cart-options';

const CartContext = createContext(null);

function localCart() { try { return JSON.parse(localStorage.getItem('khatibazar-cart') || '{"items":[]}'); } catch { return { items: [] }; } }
function saveLocal(cart) { localStorage.setItem('khatibazar-cart', JSON.stringify(cart)); }
function attributeSelectionKey(ids = []) { return [...new Set(ids)].sort().join(','); }
function matchesCartItem(item, payload) { return item.productId === payload.productId && (item.variantId || null) === (payload.variantId || null) && attributeSelectionKey(item.attributeValueIds) === attributeSelectionKey(payload.attributeValueIds); }

function mergeCartItems(localItems = [], serverItems = []) {
  const normalizedLocal = localItems.filter(item => item && item.productId);
  const normalizedServer = serverItems.filter(item => item && item.productId);

  const merged = [...normalizedServer];

  for (const localItem of normalizedLocal) {
    const existingIndex = merged.findIndex((item) => item.productId === localItem.productId && (item.variantId || null) === (localItem.variantId || null) && attributeSelectionKey(item.attributeValueIds) === attributeSelectionKey(localItem.attributeValueIds));

    if (existingIndex >= 0) {
      merged[existingIndex] = {
        ...merged[existingIndex],
        ...localItem,
        quantity: Math.max(merged[existingIndex].quantity || 0, localItem.quantity || 0),
      };
    } else {
      merged.push(localItem);
    }
  }

  return merged;
}

function addCartItems(items, additions) {
  const nextItems = [...items];

  for (const { product, quantity } of additions) {
    const payload = {
      productId: String(product.id),
      variantId: product.variantId || null,
      attributeValueIds: product.attributeValueIds || [],
    };
    const index = nextItems.findIndex((item) => matchesCartItem(item, payload));

    if (index >= 0) {
      nextItems[index] = { ...nextItems[index], quantity: nextItems[index].quantity + quantity };
    } else {
      nextItems.push({
        id: `guest-${payload.productId}-${payload.variantId || 'base'}-${attributeSelectionKey(payload.attributeValueIds)}`,
        ...payload,
        quantity,
        product,
      });
    }
  }

  return nextItems;
}

function removeCartItems(items, additions) {
  let nextItems = [...items];

  for (const { product, quantity } of additions) {
    const payload = {
      productId: String(product.id),
      variantId: product.variantId || null,
      attributeValueIds: product.attributeValueIds || [],
    };
    const index = nextItems.findIndex((item) => matchesCartItem(item, payload));
    if (index < 0) continue;

    const remainingQuantity = nextItems[index].quantity - quantity;
    nextItems = remainingQuantity > 0
      ? nextItems.map((item, itemIndex) => (
        itemIndex === index ? { ...item, quantity: remainingQuantity } : item
      ))
      : nextItems.filter((_, itemIndex) => itemIndex !== index);
  }

  return nextItems;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const updateQueues = useRef(new Map());
  const updateVersions = useRef(new Map());
  const confirmedItems = useRef(new Map());
  useEffect(() => {
    const stored = localCart();
    startTransition(() => setCart(stored));

    fetch('/api/cart')
      .then(async (response) => {
        if (!response.ok) return;

        let serverCart = await response.json();
        const latestLocal = localCart();

        if (latestLocal.items.length) {
          try {
            await mergeGuestCart(latestLocal.items);
            const refreshed = await fetch('/api/cart');
            if (!refreshed.ok) throw new Error('Unable to refresh the merged cart.');
            serverCart = await refreshed.json();
            localStorage.removeItem('khatibazar-cart');
          } catch {
            startTransition(() => setCart((current) => ({
              ...current,
              items: mergeCartItems(localCart().items, current.items),
            })));
            return;
          }
        }

        startTransition(() => setCart((current) => ({
          ...serverCart,
          items: mergeCartItems(current.items, serverCart.items || []),
        })));
        if ((serverCart?.items || []).length) localStorage.removeItem('khatibazar-cart');
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => { if (ready && !cart.id) saveLocal(cart); }, [cart, ready]);
  useEffect(() => { const close = event => event.key === 'Escape' && setOpen(false); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  async function sync(action, payload) {
    if (!cart.id) {
      setCart((currentCart) => {
        const items = [...currentCart.items];
        const index = items.findIndex(item => item.productId === payload.productId && (item.variantId || null) === (payload.variantId || null) && attributeSelectionKey(item.attributeValueIds) === attributeSelectionKey(payload.attributeValueIds));

        if (action === 'add') {
          if (index >= 0) {
            items[index] = { ...items[index], quantity: items[index].quantity + payload.quantity };
          } else {
            items.push({ id: `guest-${payload.productId}-${payload.variantId || 'base'}-${attributeSelectionKey(payload.attributeValueIds)}`, productId: payload.productId, variantId: payload.variantId || null, attributeValueIds: payload.attributeValueIds || [], quantity: payload.quantity, product: payload.product });
          }
        }

        if (action === 'update' && index >= 0) {
          if (payload.quantity <= 0) {
            return { ...currentCart, items: items.filter((_, itemIndex) => itemIndex !== index) };
          }
          items[index] = { ...items[index], quantity: payload.quantity };
        }

        if (action === 'remove') {
          return { ...currentCart, items: items.filter(item => !(item.productId === payload.productId && (item.variantId || null) === (payload.variantId || null) && attributeSelectionKey(item.attributeValueIds) === attributeSelectionKey(payload.attributeValueIds))) };
        }

        return { ...currentCart, items };
      });
      return;
    }
    const sendRequest = () => fetch(action === 'remove' ? `/api/cart?productId=${encodeURIComponent(payload.productId)}&variantId=${encodeURIComponent(payload.variantId || '')}&attributeSelectionKey=${encodeURIComponent(attributeSelectionKey(payload.attributeValueIds))}` : '/api/cart', { method: action === 'add' ? 'POST' : action === 'update' ? 'PATCH' : 'DELETE', headers: action !== 'remove' ? { 'Content-Type': 'application/json' } : undefined, body: action === 'remove' ? undefined : JSON.stringify(payload) });
    let response;

    if (action === 'update') {
      const queueKey = JSON.stringify([payload.productId, payload.variantId || null, attributeSelectionKey(payload.attributeValueIds)]);
      const previousRequest = updateQueues.current.get(queueKey) || Promise.resolve();
      const request = previousRequest.catch(() => {}).then(sendRequest);
      updateQueues.current.set(queueKey, request);

      try {
        response = await request;
      } finally {
        if (updateQueues.current.get(queueKey) === request) updateQueues.current.delete(queueKey);
      }
    } else {
      response = await sendRequest();
    }

    if (response.ok) {
      const updatedCart = await response.json();
      if (action !== 'update') setCart(updatedCart);
    } else {
      const result = await response.json().catch(() => ({}));
      throw new Error(result.error || 'কার্ট আপডেট করা যায়নি।');
    }
  }
  async function addMany(items) {
    const additions = items
      .filter(({ product, quantity }) => product?.id && Number.isFinite(Number(quantity)) && Number(quantity) > 0)
      .map(({ product, quantity }) => ({ product, quantity: Number(quantity) }));

    if (!additions.length) return { ok: false, error: 'Please select an available product.' };

    setOpen(true);
    setCart((currentCart) => {
      const nextCart = { ...currentCart, items: addCartItems(currentCart.items, additions) };
      if (!currentCart.id) saveLocal(nextCart);
      return nextCart;
    });

    if (!cart.id) return { ok: true };

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: additions.map(({ product, quantity }) => ({
            productId: product.id,
            variantId: product.variantId || null,
            attributeValueIds: product.attributeValueIds || [],
            quantity,
          })),
        }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'কার্ট আপডেট করা যায়নি।');

      setCart((currentCart) => ({ ...currentCart, id: data.id || currentCart.id }));
      return { ok: true };
    } catch (error) {
      setCart((currentCart) => ({
        ...currentCart,
        items: removeCartItems(currentCart.items, additions),
      }));
      return { ok: false, error: error.message || 'কার্ট আপডেট করা যায়নি।' };
    }
  }

  async function add(product, quantity = 1) {
    return addMany([{ product, quantity }]);
  }
  async function update(productId, quantity, variantId = null, attributeValueIds = []) {
    const payload = { productId, variantId, attributeValueIds, quantity };

    if (cart.id) {
      const key = JSON.stringify([productId, variantId || null, attributeSelectionKey(attributeValueIds)]);
      const currentItem = cart.items.find(item => matchesCartItem(item, payload));
      if (!confirmedItems.current.has(key)) confirmedItems.current.set(key, currentItem || null);
      const version = (updateVersions.current.get(key) || 0) + 1;
      updateVersions.current.set(key, version);

      setCart(currentCart => ({
        ...currentCart,
        items: quantity <= 0
          ? currentCart.items.filter(item => !matchesCartItem(item, payload))
          : currentCart.items.map(item => matchesCartItem(item, payload) ? { ...item, quantity } : item),
      }));

      try {
        await sync('update', payload);
        confirmedItems.current.set(key, quantity <= 0 || !currentItem ? null : { ...currentItem, quantity });
        if (updateVersions.current.get(key) === version) confirmedItems.current.delete(key);
      } catch (error) {
        if (updateVersions.current.get(key) === version) {
          const confirmedItem = confirmedItems.current.get(key);
          setCart(currentCart => {
            const itemExists = currentCart.items.some(item => matchesCartItem(item, payload));
            return {
              ...currentCart,
              items: confirmedItem
                ? itemExists
                  ? currentCart.items.map(item => matchesCartItem(item, payload) ? confirmedItem : item)
                  : [...currentCart.items, confirmedItem]
                : currentCart.items.filter(item => !matchesCartItem(item, payload)),
            };
          });
          confirmedItems.current.delete(key);
        }

        return error.message;
      }

      return '';
    }

    try {
      await sync('update', payload);
      return '';
    } catch (error) {
      return error.message;
    }
  }
  async function remove(productId, variantId = null, attributeValueIds = []) { await sync('remove', { productId, variantId, attributeValueIds }); }
  function clearCart() { setCart({ items: [] }); setOpen(false); localStorage.removeItem('khatibazar-cart'); }
  const items = cart.items || [];
  const count = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + Number(item.variant?.price ?? item.product?.salePrice ?? item.product?.regularPrice ?? 0) * item.quantity, 0);
  return <CartContext.Provider value={{ items, count, subtotal, add, addMany, update, remove, clearCart, ready, isOpen: open, open: () => setOpen(true) }}>{children}<CartDrawer items={items} count={count} subtotal={subtotal} open={open} close={() => setOpen(false)} update={update} remove={remove}/></CartContext.Provider>;
}

export function useCart() { return useContext(CartContext); }

function CartDrawer({ items, count, subtotal, open, close, update, remove }) {
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [deliveryConfig, setDeliveryConfig] = useState({ threshold: 2000, charge: 60 });
  const threshold = Number(deliveryConfig.threshold || 2000);
  const delivery = subtotal ? subtotal >= threshold ? 0 : Number(deliveryConfig.charge || 0) : 0;
  const isEmpty = items.length === 0;
  const activeCoupon = isEmpty || (coupon && coupon.subtotal !== subtotal)
    ? null
    : coupon;
  const discount = Number(activeCoupon?.discount || 0);
  const total = Math.max(0, subtotal - discount + delivery);

  useEffect(() => {
    if (!open) return undefined;
    document.body.classList.add('cart-drawer-open');
    return () => document.body.classList.remove('cart-drawer-open');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    fetch('/api/delivery').then(async response => {
      if (!response.ok) return;
      const data = await response.json();
      setDeliveryConfig({ threshold: data.threshold, charge: data.zones?.[0]?.charge });
    }).catch(() => {});

    return undefined;
  }, [open]);

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

  async function changeQuantity(item, quantity) {
    setUpdateError('');
    const error = await update(item.productId, quantity, item.variantId, item.attributeValueIds);
    if (error) setUpdateError(error);
  }

  return <>
    {open && <button className="drawer-backdrop" aria-label="কার্ট বন্ধ করুন" onClick={close}/>}<aside className={`cart-drawer ${open ? 'is-open' : ''}`} aria-label="কার্ট" aria-hidden={!open}>
      <header className="drawer-head"><h2>আপনার কার্ট <span>({count})</span></h2><button onClick={close} aria-label="কার্ট বন্ধ করুন"><X size={20}/></button></header>
      <div className="drawer-progress"><strong>{subtotal >= threshold ? 'অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!' : `🚚 আরও ${bn.formatPrice(Math.max(0, threshold - subtotal))} কিনলে ফ্রি ডেলিভারি!`}</strong><div><span style={{ width: `${Math.min(100, subtotal / threshold * 100)}%` }}/></div><small><span>{bn.formatPrice(subtotal)} / {bn.formatPrice(threshold)}</span><b>ফ্রি ডেলিভারি</b></small></div>
      <div className={`drawer-items ${isEmpty ? 'is-empty' : ''}`}>
        {isEmpty ? (
          <div className="drawer-empty">
            <div className="drawer-empty-icon"><ShoppingBag size={28}/></div>
            <h3>আপনার কার্ট এখন খালি</h3>
            <p>পছন্দের পণ্যগুলো কার্টে যোগ করে কেনাকাটা শুরু করুন।</p>
            <Link className="drawer-shop-now" href="/shop" onClick={close}>কেনাকাটা করুন <ArrowRight size={15}/></Link>
          </div>
        ) : items.map((item) => {
          const price = Number(item.variant?.price ?? item.product?.salePrice ?? item.product?.regularPrice ?? 0);
          const image = getCartItemImage(item);

          return (
            <div className="drawer-item" key={item.id}>
              <div className="drawer-thumb">
                {image?.url
                  ? <OptimizedImage src={image.url} alt={image.alt || ''}/>
                  : '📦'}
              </div>
              <div className="drawer-item-info">
                <div className="drawer-item-top">
                  <strong>{item.product?.name || 'পণ্য'}</strong>
                  <button
                    className="drawer-remove"
                    onClick={() => remove(item.productId, item.variantId, item.attributeValueIds)}
                    aria-label="পণ্য মুছে ফেলুন"
                  ><Trash2 size={15}/></button>
                </div>
                <span>
                  {getCartItemOptionLabels(item)} {bn.formatPrice(price)}
                </span>
                <div className="drawer-item-bottom">
                  <div className="drawer-qty">
                    <button
                      disabled={item.quantity <= 1}
                      onClick={() => void changeQuantity(item, item.quantity - 1)}
                      aria-label="পরিমাণ কমান"
                    ><Minus size={13}/></button>
                    <span>{bn.formatNumber(item.quantity)}</span>
                    <button
                      onClick={() => void changeQuantity(item, item.quantity + 1)}
                      aria-label="পরিমাণ বাড়ান"
                    ><Plus size={13}/></button>
                  </div>
                  <b>{bn.formatPrice(price * item.quantity)}</b>
                </div>
              </div>
            </div>
          );
        })}
        {updateError && <p className="drawer-update-error" role="alert">{updateError}</p>}
      </div>
      <footer className="drawer-foot"><div className="drawer-summary"><p><span>সাবটোটাল</span><strong>{bn.formatPrice(subtotal)}</strong></p><p><span>ডেলিভারি চার্জ</span><strong>{delivery ? bn.formatPrice(delivery) : 'ফ্রি'}</strong></p><p><span>ডিসকাউন্ট</span><strong className="drawer-discount">-{bn.formatPrice(discount)}</strong></p><p className="drawer-total"><span>মোট</span><strong>{bn.formatPrice(total)}</strong></p></div><div className="drawer-options"><div className="drawer-coupon">{couponOpen ? <form onSubmit={applyCoupon}><div className="drawer-coupon-input"><input value={couponCode} onChange={event => { setCouponCode(event.target.value); setCouponMessage(''); }} placeholder="কুপন কোড লিখুন..." aria-label="কুপন কোড" disabled={couponLoading || isEmpty}/><button type="submit" disabled={couponLoading || isEmpty}>{couponLoading ? 'যাচাই...' : 'প্রয়োগ করুন'}</button></div>{couponMessage && <p className={coupon ? 'is-success' : ''} role="status">{couponMessage}</p>}{coupon && <button type="button" className="drawer-coupon-change" onClick={clearCoupon}>কুপন সরান</button>}</form> : <button type="button" className="drawer-option" disabled={isEmpty} onClick={() => setCouponOpen(true)}><span><Ticket size={15}/> <b>কুপন কোড ব্যবহার করুন</b></span><ChevronDown size={15}/></button>}</div><Link className="drawer-option" href="/cart" onClick={close}><span><ShoppingBag size={15}/> <b>কার্ট দেখুন</b></span><ArrowRight size={15}/></Link></div><Link className={`drawer-checkout ${isEmpty ? 'is-disabled' : ''}`} href={isEmpty ? '#' : '/checkout'} aria-disabled={isEmpty} onClick={event => { if (isEmpty) event.preventDefault(); else close(); }}><LockKeyhole size={15}/> চেকআউট করুন <ArrowRight size={16}/></Link><Link className="drawer-continue" href="/shop" onClick={close}>কেনাকাটা চালিয়ে যান</Link></footer>
    </aside>
  </>;
}