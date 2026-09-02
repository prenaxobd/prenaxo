import Link from 'next/link';
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Check,
} from 'lucide-react';

import { getProduct, getProducts } from '@/lib/products';

import ProductReviews from '@/components/product/ProductReviews';
import ProductGallery from '@/components/product/ProductGallery';
import ProductActions from '@/components/product/ProductActions';
import RelatedProducts from '@/components/product/RelatedProducts';

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await getProduct(slug);

  /* =========================================
     PRODUCT NOT FOUND
  ========================================= */

  if (!product) {
    return (
      <main className="container product-not-found">
        <div className="product-not-found-inner">
          <div className="not-found-icon">📦</div>

          <h1>Product not found</h1>

          <p>
            Sorry, we could not find the product you are
            looking for.
          </p>

          <Link href="/shop" className="btn">
            Back to Shop
          </Link>
        </div>
      </main>
    );
  }

  /* =========================================
     ALL PRODUCTS
  ========================================= */

  const allProducts = await getProducts();

  /* =========================================
     PRICE
  ========================================= */

  const regularPrice = Number(product.regularPrice || 0);

  const salePrice =
    product.salePrice !== null &&
    product.salePrice !== undefined
      ? Number(product.salePrice)
      : null;

  const price =
    salePrice !== null &&
    salePrice < regularPrice
      ? salePrice
      : regularPrice;

  /* =========================================
     DISCOUNT
  ========================================= */

  const hasDiscount =
    salePrice !== null &&
    regularPrice > salePrice;

  const discount = hasDiscount
    ? Math.round(
        ((regularPrice - salePrice) /
          regularPrice) *
          100
      )
    : 0;

  /* =========================================
     RELATED PRODUCTS
     Same category first
  ========================================= */

  const sameCategory = allProducts.filter(
    (item) =>
      item.id !== product.id &&
      item.categoryId === product.categoryId
  );

  const otherProducts = allProducts.filter(
    (item) =>
      item.id !== product.id &&
      item.categoryId !== product.categoryId
  );

  const related = [
    ...sameCategory,
    ...otherProducts,
  ].slice(0, 8);

  /* =========================================
     REVIEWS
  ========================================= */

  const reviews = product.reviews || [];

  /*
   * Only approved reviews affect
   * public rating.
   */

  const approvedReviews = reviews.filter(
    (review) => review.approved === true
  );

  const reviewCount = approvedReviews.length;

  const ratingTotal = approvedReviews.reduce(
    (total, review) =>
      total + Number(review.rating || 0),
    0
  );

  const averageRating =
    reviewCount > 0
      ? Number(
          (ratingTotal / reviewCount).toFixed(1)
        )
      : 0;

  /* =========================================
     REVIEW DISTRIBUTION
  ========================================= */

  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  approvedReviews.forEach((review) => {
    const rating = Number(review.rating);

    if (
      rating >= 1 &&
      rating <= 5
    ) {
      ratingDistribution[rating]++;
    }
  });

  /* =========================================
     IMAGES
  ========================================= */

  const images = product.images || [];

  /* =========================================
     SKU
  ========================================= */

  const sku =
    product.sku ||
    `KB-${String(product.id).toUpperCase()}`;

  /* =========================================
     STOCK
  ========================================= */

  const inStock =
    Number(product.stock || 0) > 0;

  return (
    <main className="single-product-page">

      {/* =================================================
          BREADCRUMB
      ================================================= */}

      <div className="container">

        <div className="product-breadcrumb">

          <Link href="/">
            Home
          </Link>

          <ChevronRight size={14} />

          <Link href="/shop">
            Shop
          </Link>

          {product.category?.name && (
            <>
              <ChevronRight size={14} />

              <Link
                href={`/shop?category=${product.category.slug}`}
              >
                {product.category.name}
              </Link>
            </>
          )}

          <ChevronRight size={14} />

          <span className="current">
            {product.name}
          </span>

        </div>

      </div>


      {/* =================================================
          MAIN PRODUCT AREA
      ================================================= */}

      <section
        id="product-top"
        className="container product-main"
      >

        {/* ===============================================
            PRODUCT GALLERY
        =============================================== */}

        <ProductGallery
          product={product}
          discount={discount}
        />


        {/* ===============================================
            PRODUCT INFORMATION
        =============================================== */}

        <div className="product-info">

          {/* QUALITY BADGE */}

          <div className="quality-badge">
            <Check size={14} />

            <span>
              Fresh &amp; Quality
            </span>
          </div>


          {/* BRAND */}

          {product.brand && (
            <div className="product-brand">
              Brand:{' '}

              <strong>
                {product.brand}
              </strong>
            </div>
          )}


          {/* CATEGORY */}

          {product.category?.name && (
            <div className="product-category">

              <span>
                Grocery
              </span>

              <ChevronRight size={14} />

              <span>
                {product.category.name}
              </span>

            </div>
          )}


          {/* PRODUCT TITLE */}

          <h1 className="product-title">
            {product.name}
          </h1>


          {/* =============================================
              DYNAMIC RATING
          ============================================= */}

          <a
            href="#reviews"
            className="product-rating product-rating-link"
            aria-label="View product reviews"
          >

            <span className="stars">
              {Array.from({
                length: 5,
              }).map((_, index) => (
                <span
                  key={index}
                  className={
                    index <
                    Math.round(
                      averageRating
                    )
                      ? 'star filled'
                      : 'star'
                  }
                >
                  ★
                </span>
              ))}
            </span>

            <strong>
              {averageRating > 0
                ? averageRating.toFixed(1)
                : '0.0'}
            </strong>

            <span className="review-count">
              (
              {reviewCount}
              {' '}
              {reviewCount === 1
                ? 'Review'
                : 'Reviews'}
              )
            </span>

          </a>


          {/* SKU */}

          <div className="product-sku">

            SKU:

            <strong>
              {sku}
            </strong>

          </div>


          {/* STOCK */}

          <div
            className={
              inStock
                ? 'product-stock available'
                : 'product-stock unavailable'
            }
          >

            <span className="stock-dot" />

            {inStock
              ? `${product.stock} available · Ready to ship`
              : 'Currently unavailable'}

          </div>


          {/* =============================================
              PRICE
          ============================================= */}

          <div className="product-price-area">

            <span className="current-price">
              ৳
              {price.toLocaleString()}
            </span>

            {hasDiscount && (
              <>
                <span className="old-price">
                  ৳
                  {regularPrice.toLocaleString()}
                </span>

                <span className="discount-badge">
                  {discount}% OFF
                </span>
              </>
            )}

          </div>


          {/* =============================================
              SHORT DESCRIPTION
          ============================================= */}

          {product.shortDescription && (
            <div className="product-short-description">

              <p>
                {product.shortDescription}
              </p>

            </div>
          )}


          {/* =============================================
              VARIANTS
          ============================================= */}

          {product.variants?.length > 0 && (
            <div className="product-variation">

              <div className="variation-title">
                Available Options
              </div>

              <div className="variation-options">

                {product.variants.map(
                  (variant) => (
                    <button
                      type="button"
                      key={variant.id}
                      className="variation-option"
                    >

                      {variant.size && (
                        <span>
                          {variant.size}
                        </span>
                      )}

                      {variant.color && (
                        <span>
                          {variant.color}
                        </span>
                      )}

                      {!variant.size &&
                        !variant.color && (
                          <span>
                            Option
                          </span>
                        )}

                    </button>
                  )
                )}

              </div>

            </div>
          )}


          {/* =============================================
              CART ACTIONS
          ============================================= */}

          <div className="product-action-area">

            <ProductActions
              product={product}
              disabled={!inStock}
            />

          </div>


          {/* =============================================
              DELIVERY
          ============================================= */}

          <div className="delivery-card">

            <div className="delivery-card-title">

              <Truck size={20} />

              <strong>
                Delivery Information
              </strong>

            </div>


            <div className="delivery-row">

              <span>
                📍 Deliver to
              </span>

              <strong>
                Enter your location
              </strong>

            </div>


            <div className="delivery-row">

              <span>
                Estimated delivery
              </span>

              <strong>
                1–2 business days
              </strong>

            </div>


            <div className="delivery-row">

              <span>
                Delivery charge
              </span>

              <strong>
                ৳60
              </strong>

            </div>


            <div className="free-delivery">

              Free delivery on orders above ৳3,000

            </div>

          </div>


          {/* =============================================
              TRUST FEATURES
          ============================================= */}

          <div className="trust-features">

            <div>
              <ShieldCheck size={19} />

              <span>
                100% Authentic
              </span>
            </div>


            <div>
              <Check size={19} />

              <span>
                Quality Checked
              </span>
            </div>


            <div>
              <ShieldCheck size={19} />

              <span>
                Secure Payment
              </span>
            </div>


            <div>
              <Truck size={19} />

              <span>
                Fast Delivery
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          PRODUCT DESCRIPTION
      ================================================= */}

      <section className="container product-details-section">

        <div className="product-details-card">

          <div className="product-description-block">

            <div className="details-eyebrow">
              Product information
            </div>

            <h2>
              About this product
            </h2>


            {product.description ? (

              <div
                className="full-product-description"
                dangerouslySetInnerHTML={{
                  __html:
                    product.description,
                }}
              />

            ) : (

              <p className="muted">
                Product description is not
                available yet.
              </p>

            )}

          </div>


          {/* =================================================
              SPECIFICATIONS
          ================================================= */}

          <div className="specifications">

            <div className="details-eyebrow">
              Product details
            </div>

            <h2>
              Specifications
            </h2>


            <div className="spec-grid">

              {product.brand && (
                <div>
                  <span>
                    Brand
                  </span>

                  <strong>
                    {product.brand}
                  </strong>
                </div>
              )}


              {product.category?.name && (
                <div>
                  <span>
                    Category
                  </span>

                  <strong>
                    {product.category.name}
                  </strong>
                </div>
              )}


              {product.sku && (
                <div>
                  <span>
                    SKU
                  </span>

                  <strong>
                    {product.sku}
                  </strong>
                </div>
              )}


              {product.variants?.length > 0 && (
                <div>
                  <span>
                    Options
                  </span>

                  <strong>
                    {product.variants.length}
                    {' '}
                    options
                  </strong>
                </div>
              )}


              <div>
                <span>
                  Availability
                </span>

                <strong
                  className={
                    inStock
                      ? 'spec-in-stock'
                      : 'spec-out-stock'
                  }
                >
                  {inStock
                    ? 'In Stock'
                    : 'Out of Stock'}
                </strong>
              </div>

            </div>

          </div>


          {/* =================================================
              DELIVERY & RETURN
          ================================================= */}

          <div className="delivery-return-section">

            <div className="details-eyebrow">
              Customer care
            </div>

            <h2>
              Delivery &amp; Return
            </h2>


            <div className="delivery-return-grid">

              <div className="delivery-return-card">

                <Truck size={22} />

                <h3>
                  Fast Delivery
                </h3>

                <p>
                  Your order is carefully packed
                  and delivered safely to your
                  doorstep.
                </p>

              </div>


              <div className="delivery-return-card">

                <ShieldCheck size={22} />

                <h3>
                  Quality Guarantee
                </h3>

                <p>
                  Every product is checked before
                  it leaves our warehouse.
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          REVIEWS
      ================================================= */}

      <section
        id="reviews"
        className="container product-reviews-section"
      >

        <ProductReviews
          productId={product.id}
          reviews={reviews}
          averageRating={averageRating}
          reviewCount={reviewCount}
          ratingDistribution={ratingDistribution}
        />

      </section>


      {/* =================================================
          RELATED PRODUCTS
      ================================================= */}

      {related.length > 0 && (

        <section className="container related-products">

          <div className="section-heading">

            <div>

              <span>
                You may also like
              </span>

              <h2>
                Related Products
              </h2>

            </div>


            <Link
              href="/shop"
              className="related-view-all"
            >
              View all

              <ChevronRight size={16} />

            </Link>

          </div>


          <RelatedProducts
            products={related}
          />

        </section>

      )}

    </main>
  );
}