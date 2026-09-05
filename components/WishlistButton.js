'use client';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function WishlistButton({ productId }) {
  const [saved, setSaved] = useState(false); const [busy, setBusy] = useState(false);
  useEffect(() => { fetch('/api/wishlist').then(response => response.ok ? response.json() : null).then(data => setSaved(Boolean(data?.items?.some(item => item.productId === productId)))).catch(() => {}); }, [productId]);
  async function toggle() { setBusy(true); const response = await fetch('/api/wishlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId }) }); const data = await response.json(); if (response.ok) { setSaved(data.saved); window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: { saved: data.saved, count: data.count } })); } setBusy(false); }
  return <button className={`wishlist-button${saved ? ' saved' : ''}`} type="button" aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={saved} disabled={busy} onClick={toggle}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>;
}
