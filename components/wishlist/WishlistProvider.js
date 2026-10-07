'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState([]);
  const [ready, setReady] = useState(false);

  async function refresh() {
    try {
      const response = await fetch('/api/wishlist', { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      setProductIds(
        Array.isArray(data?.items)
          ? data.items.map((item) => String(item.productId))
          : []
      );
    } finally {
      setReady(true);
    }
  }

  useEffect(() => {
    refresh().catch(() => setReady(true));

    const handleAuthStateChange = () => {
      setReady(false);
      refresh().catch(() => setReady(true));
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthStateChange);
  }, []);

  async function toggle(productId) {
    const id = String(productId);
    const wasSaved = productIds.includes(id);

    setProductIds((current) => (
      wasSaved
        ? current.filter((savedId) => savedId !== id)
        : [...current, id]
    ));

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update your wishlist.');
      }

      setProductIds((current) => {
        const next = new Set(current);
        if (data.saved) next.add(id);
        else next.delete(id);
        return [...next];
      });
      window.dispatchEvent(new Event('wishlist-updated'));

      return data;
    } catch (error) {
      setProductIds((current) => {
        const next = new Set(current);
        if (wasSaved) next.add(id);
        else next.delete(id);
        return [...next];
      });
      throw error;
    }
  }

  const value = {
    ready,
    productIds,
    count: productIds.length,
    isSaved: (productId) => productIds.includes(String(productId)),
    toggle,
    refresh,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
