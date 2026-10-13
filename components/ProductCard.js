'use client';
import OptimizedImage from '@/components/OptimizedImage';

import Link from 'next/link';

import {
  Heart,
  ShoppingCart,
  Star,
  Check,
  Eye,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';

import { useCart } from '@/components/cart/CartProvider';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { useAccountRequired } from '@/components/auth/AccountRequiredProvider';
import { getProductVariantPrice } from '@/lib/product-pricing';


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

export default function ProductCard({
  product,
  flashSale = false,
  maxStock = 0,
  viewMode = 'grid',
  imageSizes = '(max-width: 620px) 45vw, (max-width: 1000px) 30vw, 22vw',
  scrollReveal = false,
}) {

  const cardRef = useRef(null);
  const cart = useCart();
  const wishlistStore = useWishlist();
  const { requireAccount, showAccountRequired } = useAccountRequired();


  /*
  |--------------------------------------------------------------------------
  | STATES
  |--------------------------------------------------------------------------
  */

  const [message, setMessage] =
    useState('');

  const saved = wishlistStore?.isSaved(product.id) || false;
  const wishlistLoading = !wishlistStore?.ready;

  const [adding, setAdding] =
    useState(false);
  const weightVariants = product.category?.enableWeightVariants
    ? (product.variants || []).filter((variant) => variant.name)
    : [];
  const [selectedWeightVariantId, setSelectedWeightVariantId] = useState(() => (
    weightVariants.find((variant) => Number(variant.stock || 0) > 0)?.id ||
    weightVariants[0]?.id ||
    ''
  ));
  const selectedWeightVariant = weightVariants.find((variant) => variant.id === selectedWeightVariantId)
    || weightVariants.find((variant) => Number(variant.stock || 0) > 0)
    || null;
  const [savingWishlist, setSavingWishlist] =
    useState(false);

  useEffect(() => {
    if (!scrollReveal || !cardRef.current) return undefined;

    const card = cardRef.current;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      card.classList.add('is-scroll-visible');
      return undefined;
    }

    card.classList.add('is-scroll-pending');
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      card.classList.remove('is-scroll-pending');
      card.classList.add('is-scroll-visible');
      observer.disconnect();
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });

    observer.observe(card);
    return () => observer.disconnect();
  }, [scrollReveal]);


  /*
  |--------------------------------------------------------------------------
  | PRODUCT DATA
  |--------------------------------------------------------------------------
  */

  const price =
    Number(
      product.salePrice ??
      product.regularPrice ??
      0
    );


  const regularPrice =
    Number(
      product.regularPrice || 0
    );


  const discount =
    product.salePrice != null &&
    regularPrice > 0 &&
    regularPrice > price
      ? Math.round(
          (
            (regularPrice - price) /
            regularPrice
          ) * 100
        )
      : 0;

  const displayedPrice = selectedWeightVariant
    ? getProductVariantPrice(selectedWeightVariant, product)
    : price;
  const displayedRegularPrice = selectedWeightVariant
    ? Number(selectedWeightVariant.regularPrice || 0)
    : regularPrice;
  const displayedDiscount = displayedRegularPrice > displayedPrice && displayedRegularPrice > 0
    ? Math.round(((displayedRegularPrice - displayedPrice) / displayedRegularPrice) * 100)
    : discount;
  const availableStock = weightVariants.length
    ? Number(selectedWeightVariant?.stock || 0)
    : Number(product.stock || 0);


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
      availableStock <= 0
    ) {
      return;
    }

    setAdding(true);
    setMessage('');

    try {
      if (!(await requireAccount())) return;

      const cartProduct = selectedWeightVariant
        ? {
            ...product,
            variantId: selectedWeightVariant.id,
            variant: selectedWeightVariant,
            regularPrice: selectedWeightVariant.regularPrice,
            salePrice: selectedWeightVariant.salePrice,
            stock: selectedWeightVariant.stock,
          }
        : product;
      const result = await cart.add(cartProduct, 1);


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
      setMessage(
        error.message || 'Unable to add item'
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


    if (wishlistLoading || savingWishlist) {
      return;
    }

    setMessage('');
    setSavingWishlist(true);

    try {
      if (!(await requireAccount())) return;
      await wishlistStore.toggle(product.id);
    } catch (error) {
      if (error.status === 401) {
        showAccountRequired();
        return;
      }

      console.error(
        'Wishlist error:',
        error
      );
      setMessage(
        error.message || 'Unable to update wishlist.'
      );
    } finally {
      setSavingWishlist(false);
    }

  }


  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (

    <article
      ref={cardRef}
      className={`product-card ${scrollReveal ? 'product-card-scroll-reveal' : ''}`}
    >


      {/* IMAGE */}

      <div className="product-card-image-wrap">

        <Link
          href={`/product/${product.slug}`}
          className="product-card-image-link"
        >

          <div className="product-image">

            {image?.url ? (

              <OptimizedImage
                src={image.url}
                alt={
                  image.alt ||
                  product.name
                }
                sizes={imageSizes}
              />

            ) : (

              <span className="product-placeholder">
                📦
              </span>

            )}

          </div>

        </Link>


        {/* DISCOUNT */}

        {displayedDiscount > 0 && (

          <span className="product-discount">
            -{displayedDiscount}%
          </span>

        )}


        {/* WISHLIST */}

        <button
          type="button"
          className={`product-wishlist ${
            saved ? 'saved' : ''
          }`}
          onClick={wishlist}
          disabled={wishlistLoading || savingWishlist}
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

              ৳{displayedPrice.toLocaleString()}

            </span>


            {displayedDiscount > 0 && (

              <span className="old-price">

                ৳{displayedRegularPrice.toLocaleString()}

              </span>

            )}

          </div>

          {weightVariants.length > 0 && (
            <span
              className={`product-card-stock-status ${availableStock > 0 ? 'is-in-stock' : 'is-out-of-stock'}`}
              aria-live="polite"
            >
              {availableStock > 0 ? 'In stock' : 'Out of stock'}
            </span>
          )}

        </div>

        {weightVariants.length > 0 && (
          <div className="product-card-weight-options" aria-label="Select weight">
            {weightVariants.map((variant) => {
              const selected = variant.id === selectedWeightVariant?.id;
              const inStock = Number(variant.stock || 0) > 0;
              return (
                <button
                  type="button"
                  key={variant.id}
                  className={selected ? 'selected' : ''}
                  disabled={!inStock}
                  aria-pressed={selected}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setSelectedWeightVariantId(variant.id);
                    setMessage('');
                  }}
                >
                  {variant.name}
                </button>
              );
            })}
          </div>
        )}

        {flashSale && availableStock > 0 && (
          <div className="flash-card-stock">
            <div><span>Only {availableStock} left</span><span>{Math.round((availableStock / Math.max(1, maxStock)) * 100)}%</span></div>
            <span className="flash-card-stock-bar" role="progressbar" aria-label="Stock remaining" aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round((availableStock / Math.max(1, maxStock)) * 100)}><i style={{ width: `${Math.min(100, Math.max(0, Math.round((availableStock / Math.max(1, maxStock)) * 100)))}%` }} /></span>
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
              Details
            </Link>

            <button
              type="button"
              className="product-add-cart"
              onClick={addCart}
              disabled={
                adding ||
                availableStock <= 0
              }
            >

              {adding ? (

                <>

                  <span className="cart-spinner" />

                  Adding...

                </>

              ) : availableStock <= 0 ? (

                <>

                  <ShoppingCart size={17} />

                  Out of Stock

                </>

              ) : (

                <>

                  <ShoppingCart size={17} />

                  Add to Cart

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
              availableStock <= 0
            }
          >

            {adding ? (

              <>

                <span className="cart-spinner" />

                Adding...

              </>

            ) : availableStock <= 0 ? (

              <>

                <ShoppingCart size={17} />

                Out of Stock

              </>

            ) : (

              <>

                <ShoppingCart size={17} />

                Add to Cart

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
