
'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

import ProductCard from '@/components/ProductCard';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadWishlist() {
    try {
      const response = await fetch('/api/wishlist', {
        cache: 'no-store',
      });

      const data = await response.json();

      const wishlistItems = Array.isArray(data?.items)
        ? data.items
        : [];

      const productIds = wishlistItems
        .map((item) => item.productId)
        .filter(Boolean);

      if (productIds.length === 0) {
        setProducts([]);
        return;
      }

      /*
       * Load all products.
       *
       * This uses your products API and then keeps
       * only the products that exist in wishlist.
       */

      const productResponse = await fetch(
        '/api/products',
        {
          cache: 'no-store',
        }
      );

      if (!productResponse.ok) {
        setProducts([]);
        return;
      }

      const productData = await productResponse.json();

      const allProducts = Array.isArray(productData)
        ? productData
        : productData.products || productData.items || [];

      /*
       * Match wishlist product IDs with full product objects.
       */

      const wishlistProducts = productIds
        .map((id) =>
          allProducts.find(
            (product) =>
              String(product.id) === String(id)
          )
        )
        .filter(Boolean);

      setProducts(wishlistProducts);

    } catch (error) {
      console.error(
        'Wishlist loading error:',
        error
      );

      setProducts([]);

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);


  if (loading) {
    return (
      <main className="container page-title">

        <div
          className="eyebrow"
          style={{ color: 'var(--coral)' }}
        >
          Saved things
        </div>

        <h1>Wishlist</h1>

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

      <h1>Wishlist</h1>


      {products.length === 0 ? (

        <div
          className="form"
          style={{
            textAlign: 'center',
            marginTop: 30,
          }}
        >

          <Heart size={42} />

          <h2>
            Nothing saved yet
          </h2>

          <p className="muted">
            Keep the things you love close by
            tapping the heart.
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

