'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Heart } from 'lucide-react';

import ProductCard from '@/components/ProductCard';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import styles from './WishlistPage.module.css';

export default function Wishlist() {
  const wishlist = useWishlist();
  const products = wishlist?.products || [];
  const loading = !wishlist?.ready;

  return (
    <main className={`container page-title ${styles.page}`}>
      <div className={styles.eyebrow}>Saved things</div>

      <div className={styles.header}>
        <div>
          <h1>Wishlist</h1>
          {!loading && products.length > 0 && (
            <p className={styles.count}>
              {products.length} {products.length === 1 ? 'product' : 'products'} saved
            </p>
          )}
        </div>

        <Link className="wishlist-account-button" href="/account">
          <ArrowLeft size={16} aria-hidden="true" />
          Back to Account
        </Link>
      </div>

      {loading ? (
        <div className={styles.loading} role="status" aria-label="Loading wishlist">
          <span />
          <span />
          <span />
        </div>
      ) : products.length > 0 ? (
        <div className={`product-grid ${styles.productGrid}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <section className={styles.emptyState} aria-labelledby="wishlist-empty-title">
          <div className={styles.heartIcon} aria-hidden="true">
            <Heart size={30} />
          </div>
          <span className={styles.emptyEyebrow}>YOUR NEXT FAVORITE IS OUT THERE</span>
          <h2 id="wishlist-empty-title">Your wishlist is waiting</h2>
          <p>
            Save the products you love by tapping the heart. They’ll be kept here
            so you can find them whenever you’re ready.
          </p>
          <Link className={styles.exploreButton} href="/shop">
            Explore the collection
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      )}
    </main>
  );
}
