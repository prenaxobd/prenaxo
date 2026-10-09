
'use client';

import Link from 'next/link';
import { ArrowLeft, Heart } from 'lucide-react';

import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/components/wishlist/WishlistProvider';

export default function Wishlist() {
  const wishlist = useWishlist();
  const productsById = new Map(
    (wishlist?.products || []).map((product) => [String(product.id), product])
  );
  const products = wishlist?.productIds
    .map((id) => productsById.get(id))
    .filter(Boolean) || [];
  const loading = !wishlist?.ready;


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

          <h2>Nothing saved yet</h2>

          <p className="muted">
            Keep the things you love close by tapping the heart.
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
