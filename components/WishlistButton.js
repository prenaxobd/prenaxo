'use client';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { useState } from 'react';

export default function WishlistButton({ productId }) {
  const wishlist = useWishlist(); const [busy, setBusy] = useState(false); const saved = wishlist?.isSaved(productId) || false; const disabled = busy || !wishlist?.ready;
  async function toggle() { if (disabled) return; setBusy(true); try { await wishlist.toggle(productId); } catch {} finally { setBusy(false); } }
  return <button className={`wishlist-button${saved ? ' saved' : ''}`} type="button" aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={saved} disabled={disabled} onClick={toggle}><Heart size={18} fill={saved ? 'currentColor' : 'none'} /></button>;
}
