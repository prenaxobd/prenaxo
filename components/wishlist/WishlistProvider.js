'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [productIds, setProductIds] = useState([]);
  const [ready, setReady] = useState(false);

  async function refresh() {
    try {
      const response = await fetch('/api/wishlist');
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
    const response = await fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Please sign in');
    }

    setProductIds((current) => {
      const next = new Set(current);
      if (data.saved) next.add(String(productId));
      else next.delete(String(productId));
      return [...next];
    });

    return data;
  }

  const value = {
    ready,
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
