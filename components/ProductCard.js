'use client';

import Link from 'next/link';

import {
  Heart,
  ShoppingCart,
  Star,
  Check,
  Eye,
} from 'lucide-react';

import { useEffect, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';


/*
|--------------------------------------------------------------------------
| RATING STARS
|--------------------------------------------------------------------------
|
| Example:
|
| rating = 3
| ★★★☆☆
|
| rating = 4
| ★★★★☆
|
| rating = 5
| ★★★★★
|
*/

function RatingStars({ rating }) {

  const value = Number(rating || 0);

  /*
   * Round the average rating to the nearest whole number.
   *
   * 3.0  → 3 stars
   * 3.4  → 3 stars
   * 3.5  → 4 stars
   * 4.8  → 5 stars
   */

  const filledStars = Math.round(value);


  return (
    <span
      className="card-rating-stars"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >

      {[1, 2, 3, 4, 5].map((star) => {

        const filled =
          star <= filledStars;


        return (
          <Star
            key={star}
            size={13}
            strokeWidth={2}
            className={
              filled
                ? 'rating-star-filled'
                : 'rating-star-empty'
            }
            fill={
              filled
                ? 'currentColor'
                : 'none'
            }
          />
        );

      })}

    </span>
  );
}


/*
|--------------------------------------------------------------------------
| PRODUCT CARD
|--------------------------------------------------------------------------
*/

export default function ProductCard({ product, flashSale = false, maxStock = 0, viewMode = 'grid' }) {

  const cart = useCart();


  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [message, setMessage] =
    useState('');

  const [saved, setSaved] =
    useState(false);

  const [wishlistLoading, setWishlistLoading] =
    useState(true);

  const [adding, setAdding] =
    useState(false);


  /*
  |--------------------------------------------------------------------------
  | LOAD WISHLIST STATE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {

    let cancelled = false;


    async function loadWishlistState() {

      try {

        const response =
          await fetch(
            '/api/wishlist',
            {
              cache: 'no-store',
            }
          );


        if (!response.ok) {

          if (!cancelled) {
            setSaved(false);
          }

          return;
        }


        const data =
          await response.json();


        const wishlistItems =
          Array.isArray(data?.items)
            ? data.items
            : [];


        const exists =
          wishlistItems.some(
            (item) =>
              String(item.productId) ===
              String(product.id)
          );


        if (!cancelled) {

          setSaved(exists);

        }

      } catch (error) {

        console.error(
          'Wishlist state error:',
          error
        );

      } finally {

        if (!cancelled) {

          setWishlistLoading(false);

        }

      }

    }


    loadWishlistState();


    return () => {

      cancelled = true;

    };

  }, [product.id]);


  /*
  |--------------------------------------------------------------------------
  | PRODUCT DATA
  |--------------------------------------------------------------------------
  */

  const price =
    Number(
      product.salePrice ||
      product.regularPrice ||
      0
    );


  const regularPrice =
    Number(
      product.regularPrice || 0
    );


  const discount =
    product.salePrice &&
    regularPrice > price
      ? Math.round(
          (
            (regularPrice - price) /
            regularPrice
          ) * 100
        )
      : 0;


  /*
  |--------------------------------------------------------------------------
  | RATING DATA
  |--------------------------------------------------------------------------
  |
  | These values must come from your product API.
  |
  | product.rating
  | product.reviewCount
  |
  */

  const rating =
    Number(
      product.rating || 0
    );


  const reviewCount =
    Number(
      product.reviewCount || 0
    );


  const image =
    product.images?.[0];


  /*
  |--------------------------------------------------------------------------
  | ADD TO CART
  |--------------------------------------------------------------------------
  */

  async function addCart(event) {

    event.preventDefault();
    event.stopPropagation();


    if (
      adding ||
      product.stock <= 0
    ) {
      return;
    }


    setAdding(true);
    setMessage('');


    try {

      const result =
        await cart.add(
          product,
          1
        );


      if (result.ok) {

        setMessage(
          'Added to cart ✓'
        );


        setTimeout(
          () => setMessage(''),
          2000
        );

      } else {

        setMessage(
          result.error ||
          'Unable to add item'
        );

      }

    } catch (error) {

      console.error(
        'Cart error:',
        error
      );


      setMessage(
        'Unable to add item'
      );

    } finally {

      setAdding(false);

    }

  }


  /*
  |--------------------------------------------------------------------------
  | WISHLIST
  |--------------------------------------------------------------------------
  */

  async function wishlist(event) {

    event.preventDefault();
    event.stopPropagation();


    if (wishlistLoading) {
      return;
    }


    setMessage('');


    try {

      const response =
        await fetch(
          '/api/wishlist',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              productId:
                product.id,
            }),
          }
        );


      const data =
        await response.json();


      if (response.ok) {

        const newSaved =
          Boolean(data.saved);


        setSaved(newSaved);


        /*
        |--------------------------------------------------------------------------
        | UPDATE HEADER WISHLIST COUNT
        |--------------------------------------------------------------------------
        */

        window.dispatchEvent(
          new CustomEvent(
            'wishlist-updated',
            {
              detail: {
                saved: newSaved,

                count:
                  typeof data.count === 'number'
                    ? data.count
                    : undefined,
              },
            }
          )
        );

      } else {

        setMessage(
          data.error ||
          'Please sign in'
        );

      }

    } catch (error) {

      console.error(
        'Wishlist error:',
        error
      );


      setMessage(
        'Something went wrong'
      );

    }

  }


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <article className="product-card">


      {/* IMAGE */}

      <div className="product-card-image-wrap">

        <Link
          href={`/product/${product.slug}`}
          className="product-card-image-link"
        >

          <div className="product-image">

            {image?.url ? (

              <img
                src={image.url}
                alt={
                  image.alt ||
                  product.name
                }
              />

            ) : (

              <span className="product-placeholder">
                📦
              </span>

            )}

          </div>

        </Link>


        {/* DISCOUNT */}

        {discount > 0 && (

          <span className="product-discount">
            -{discount}%
          </span>

        )}


        {/* WISHLIST */}

        <button
          type="button"
          className={`product-wishlist ${
            saved ? 'saved' : ''
          }`}
          onClick={wishlist}
          disabled={wishlistLoading}
          aria-label={
            saved
              ? 'Remove from wishlist'
              : 'Add to wishlist'
          }
          aria-pressed={saved}
        >

          <Heart
            size={18}
            fill={
              saved
                ? 'currentColor'
                : 'none'
            }
          />

        </button>

      </div>


      {/* PRODUCT INFO */}

      <div className="product-info">


        {/* PRODUCT LINK */}

        <Link
          href={`/product/${product.slug}`}
          className="product-content-link"
        >


          {/* CATEGORY */}

          <span className="product-category">

            {product.category?.name ||
              'Prenaxo'}

          </span>


          {/* TITLE */}

          <h3 className="product-name">

            {product.name}

          </h3>


          {/* ============================================================
              RATING
          ============================================================ */}

          <div className="product-card-rating">

            <RatingStars
              rating={rating}
            />


            {/* RATING NUMBER */}

            <span className="rating-number">

              {rating > 0
                ? rating.toFixed(1)
                : '0.0'}


              {/* REVIEW COUNT */}

              <span className="rating-count">

                ({reviewCount})

              </span>

            </span>

          </div>

        </Link>


        {/* PRICE */}

        <div className="product-price-row">

          <div className="product-price">

            <span className="current-price">

              ৳{price.toLocaleString()}

            </span>


            {discount > 0 && (

              <span className="old-price">

                ৳{regularPrice.toLocaleString()}

              </span>

            )}

          </div>

        </div>

        {flashSale && product.stock > 0 && (
          <div className="flash-card-stock">
            <div><span>Only {product.stock} left</span><span>{Math.round((Number(product.stock) / Math.max(1, maxStock)) * 100)}%</span></div>
            <span className="flash-card-stock-bar" role="progressbar" aria-label="Stock remaining" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round((Number(product.stock) / Math.max(1, maxStock)) * 100)}><i style={{ width: `${Math.min(100, Math.max(0, Math.round((Number(product.stock) / Math.max(1, maxStock)) * 100)))}%` }} /></span>
          </div>
        )}


        {/* ACTIONS */}

        {viewMode === 'list' ? (
          <div className="product-card-actions product-card-actions-list">
            <Link
              href={`/product/${product.slug}`}
              className="product-card-view-btn"
            >
              <Eye size={16} />
              {flashSale ? 'বিস্তারিত' : 'Details'}
            </Link>

            <button
              type="button"
              className="product-add-cart"
              onClick={addCart}
              disabled={
                adding ||
                product.stock <= 0
              }
            >

              {adding ? (

                <>

                  <span className="cart-spinner" />

                  {flashSale ? 'যোগ হচ্ছে...' : 'Adding...'}

                </>

              ) : product.stock <= 0 ? (

                <>

                  <ShoppingCart size={17} />

                  {flashSale ? 'স্টক শেষ' : 'Out of Stock'}

                </>

              ) : (

                <>

                  <ShoppingCart size={17} />

                  {flashSale ? 'কার্টে যোগ করুন' : 'Add to Cart'}

                </>

              )}

            </button>
          </div>
        ) : (
          <button
            type="button"
            className="product-add-cart product-add-cart-grid"
            onClick={addCart}
            disabled={
              adding ||
              product.stock <= 0
            }
          >

            {adding ? (

              <>

                <span className="cart-spinner" />

                {flashSale ? 'যোগ হচ্ছে...' : 'Adding...'}

              </>

            ) : product.stock <= 0 ? (

              <>

                <ShoppingCart size={17} />

                {flashSale ? 'স্টক শেষ' : 'Out of Stock'}

              </>

            ) : (

              <>

                <ShoppingCart size={17} />

                {flashSale ? 'কার্টে যোগ করুন' : 'Add to Cart'}

              </>

            )}

          </button>
        )}


        {/* MESSAGE */}

        {message && (

          <div
            className="product-cart-message"
            role="status"
          >

            <Check size={14} />

            {message}

          </div>

        )}

      </div>

    </article>
  );
}

