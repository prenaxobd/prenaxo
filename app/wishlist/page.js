
'use client';

import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/components/wishlist/WishlistProvider';

export default function Wishlist() {
  const wishlist = useWishlist();
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!wishlist?.ready || !wishlist.productIds.length || productsLoaded) return undefined;

    let active = true;
    fetch('/api/products', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load saved products.');
        const data = await response.json();
        const products = Array.isArray(data) ? data : data.products || data.items || [];
        if (active) setAllProducts(products);
      })
      .catch((loadError) => {
        console.error('Wishlist products loading error:', loadError);
        if (active) setError(loadError.message || 'Unable to load saved products.');
      })
      .finally(() => {
        if (active) setProductsLoaded(true);
      });

    return () => {
      active = false;
    };
  }, [wishlist?.ready, wishlist?.productIds.length, productsLoaded]);

  const products = wishlist?.productIds
    .map((id) => allProducts.find((product) => String(product.id) === id))
    .filter(Boolean) || [];
  const loading = !wishlist?.ready || (wishlist.productIds.length > 0 && !productsLoaded);


  if (loading) {
    return (
      <main className="container page-title">

        <div
          className="eyebrow"
          style={{ color: 'var(--coral)' }}
        >
          Saved things
        </div>

        <div className="wishlist-page-header">
          <h1>Wishlist</h1>

          <Link
            className="wishlist-account-button"
            href="/account"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Account
          </Link>
        </div>

        <div
          className="form"
          style={{
            textAlign: 'center',
            marginTop: 30,
          }}
        >
          <Heart size={42} />

          <h2>
            Loading wishlist...
          </h2>
        </div>

      </main>
    );
  }


  return (
    <main className="container page-title">

      <div
        className="eyebrow"
        style={{ color: 'var(--coral)' }}
      >
        Saved things
      </div>

      <div className="wishlist-page-header">
        <h1>Wishlist</h1>

        <Link
          className="wishlist-account-button"
          href="/account"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Account
        </Link>
      </div>


      {products.length === 0 ? (

        <div
          className="form"
          style={{
            textAlign: 'center',
            marginTop: 30,
          }}
        >

          <Heart size={42} />

          <h2>{error || 'Nothing saved yet'}</h2>

          <p className="muted">
            {error
              ? 'Please refresh the page and try again.'
              : 'Keep the things you love close by tapping the heart.'}
          </p>

          <Link
            className="btn"
            href="/shop"
          >
            Explore the collection
          </Link>

        </div>

      ) : (

        /*
         * IMPORTANT:
         *
         * We use the same ProductCard component
         * used on Shop/Home.
         *
         * Therefore:
         * - Same image
         * - Same style
         * - Same price
         * - Same rating
         * - Same wishlist
         * - Same Add to Cart
         * - Same /product/[slug] link
         */

        <div
          className="product-grid"
          style={{
            marginTop: 30,
          }}
        >

          {products.map((product) => (

            <ProductCard
              key={product.id}
              product={product}
            />

          ))}

        </div>

      )}

    </main>
  );
}
