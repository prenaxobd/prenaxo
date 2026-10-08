'use client';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { useAccountRequired } from '@/components/auth/AccountRequiredProvider';
import { useState } from 'react';

export default function WishlistButton({ productId }) {
  const wishlist = useWishlist();
  const { requireAccount, showAccountRequired } = useAccountRequired();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const saved = wishlist?.isSaved(productId) || false;
  const disabled = busy || !wishlist?.ready;

  async function toggle() {
    if (disabled) return;
    setBusy(true);
    setError('');
    try {
      if (!(await requireAccount())) return;
      await wishlist.toggle(productId);
    } catch (toggleError) {
      if (toggleError.status === 401) {
        showAccountRequired();
        return;
      }

      setError(toggleError.message || 'Unable to update your wishlist.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className={`wishlist-button${saved ? ' saved' : ''}`}
        type="button"
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={saved}
        aria-describedby={error ? `wishlist-error-${productId}` : undefined}
        disabled={disabled}
        onClick={toggle}
      >
        <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
      </button>
      {error && <span id={`wishlist-error-${productId}`} role="status">{error}</span>}
    </>
  );
}
