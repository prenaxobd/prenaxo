import Link from 'next/link';
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Check,
  PackageCheck,
  RotateCcw,
  MapPin,
} from 'lucide-react';

import { getProduct, getProducts } from '@/lib/products';

import ProductReviews from '@/components/product/ProductReviews';
import ProductGallery from '@/components/product/ProductGallery';
import ProductActions from '@/components/product/ProductActions';
import RelatedProducts from '@/components/product/RelatedProducts';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product not found | Khatibazar',
    };
  }

  const seo = product.seo;

  return {
    title:
      seo?.metaTitle ||
      product.name ||
      'Product | Khatibazar',

    description:
      seo?.metaDescription ||
      product.shortDescription ||
      product.description ||
      `Shop ${product.name} at Khatibazar.`,

    alternates: seo?.canonicalUrl
      ? {
          canonical: seo.canonicalUrl,
        }
      : undefined,

    robots: {
      index: seo?.robotsIndex !== 'NOINDEX',
      follow: seo?.robotsFollow !== 'NOFOLLOW',
    },

    openGraph: {
      title:
        seo?.ogTitle ||
        seo?.metaTitle ||
        product.name,

      description:
        seo?.ogDescription ||
        seo?.metaDescription ||
        product.shortDescription ||
        undefined,

      images:
        seo?.ogImage
          ? [seo.ogImage]
          : product.images?.[0]?.url
          ? [product.images[0].url]
          : undefined,
    },
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    return (
      <main className="single-product-page">
        <div className="container">
          <div className="product-not-found">
            <div className="product-not-found-inner">
              <div className="not-found-icon">
                📦
              </div>

              <h1>
                Product not found
              </h1>

              <p>
                Sorry, we could not find the
                product you are looking for.
              </p>

              <Link
                href="/shop"
                className="product-back-shop"
              >
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const allProducts = await getProducts();

  /* =========================================
     PRICE
  ========================================= */

  const regularPrice = Number(
    product.regularPrice || 0
  );

  const salePrice =
    product.salePrice !== null &&
    product.salePrice !== undefined
      ? Number(product.salePrice)
      : null;

  const hasDiscount =
    salePrice !== null &&
    salePrice > 0 &&
    salePrice < regularPrice;

  const price = hasDiscount
    ? salePrice
    : regularPrice;

  const discount =
    hasDiscount && regularPrice > 0
      ? Math.round(
          ((regularPrice - salePrice) /
            regularPrice) *
            100
        )
      : 0;

  /* =========================================
     RELATED PRODUCTS
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

  const approvedReviews = reviews.filter(
    (review) => review.approved === true
  );

  const reviewCount =
    approvedReviews.length;

  const ratingTotal =
    approvedReviews.reduce(
      (total, review) =>
        total + Number(review.rating || 0),
      0
    );

  const averageRating =
    reviewCount > 0
      ? Number(
          (
            ratingTotal /
            reviewCount
          ).toFixed(1)
        )
      : 0;

  const ratingDistribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  approvedReviews.forEach((review) => {
    const rating = Number(
      review.rating
    );

    if (
      rating >= 1 &&
      rating <= 5
    ) {
      ratingDistribution[rating]++;
    }
  });

  /* =========================================
     PRODUCT DATA
  ========================================= */

  const images = product.images || [];

  const sku =
    product.sku ||
    `KB-${String(product.id).toUpperCase()}`;

  const stock = Number(
    product.stock || 0
  );

  const inStock = stock > 0;

  const shortDescription =
    product.shortDescription?.trim() || '';

  /* =========================================
     REVIEW STARS
  ========================================= */

  const stars = Array.from({
    length: 5,
  });

  return (
    <main className="single-product-page">

      {/* =========================================
          BREADCRUMB
      ========================================= */}

      <div className="container">
        <nav
          className="product-breadcrumb"
          aria-label="Breadcrumb"
        >
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
        </nav>
      </div>

      {/* =========================================
          PRODUCT MAIN
      ========================================= */}

      <section
        id="product-top"
        className="container product-main"
      >

        {/* =======================================
            GALLERY
        ======================================= */}

        <div className="product-gallery-column">
          <ProductGallery
            product={product}
            discount={discount}
          />
        </div>

        {/* =======================================
            PRODUCT INFORMATION
        ======================================= */}

        <div className="product-info">

          {/* TOP BADGES */}

          <div className="product-top-meta">

            <div className="quality-badge">
              <Check size={14} />
              <span>
                Fresh & Quality
              </span>
            </div>

            {product.brand && (
              <span className="product-brand-pill">
                {product.brand}
              </span>
            )}

          </div>

          {/* CATEGORY */}

          {product.category?.name && (
            <div className="product-category">
              <span>
                Grocery
              </span>

              <ChevronRight size={13} />

              <span>
                {product.category.name}
              </span>
            </div>
          )}

          {/* TITLE */}

          <h1 className="product-title">
            {product.name}
          </h1>

          {/* RATING */}

          <a
            href="#reviews"
            className="product-rating product-rating-link"
            aria-label="View product reviews"
          >
            <span className="stars">
              {stars.map((_, index) => (
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
              {reviewCount}{' '}
              {reviewCount === 1
                ? 'Review'
                : 'Reviews'}
            </span>
          </a>

          {/* SKU + STOCK */}

          <div className="product-meta-row">

            <div className="product-sku">
              <span>
                SKU
              </span>

              <strong>
                {sku}
              </strong>
            </div>

            <div
              className={
                inStock
                  ? 'product-stock available'
                  : 'product-stock unavailable'
              }
            >
              <span className="stock-dot" />

              {inStock
                ? `${stock} available`
                : 'Out of stock'}
            </div>

          </div>

          {/* PRICE */}

          <div className="product-price-area">

            <div className="product-price-main">
              <span className="current-price">
                ৳{price.toLocaleString()}
              </span>

              {hasDiscount && (
                <span className="old-price">
                  ৳
                  {regularPrice.toLocaleString()}
                </span>
              )}
            </div>

            {hasDiscount && (
              <span className="discount-badge">
                Save {discount}%
              </span>
            )}

          </div>

          {/* =====================================
              SHORT DESCRIPTION
          ===================================== */}

          {shortDescription && (
            <div className="product-short-description">

              <div className="short-description-title">
                About this product
              </div>

              <p>
                {shortDescription}
              </p>

            </div>
          )}

          {product.productType === 'COMBO' && product.comboItems?.length > 0 && (
            <div className="product-combo-includes">
              <h2>This Bundle Includes</h2>
              {product.comboItems.map(item => <div key={item.id}><span>{item.includedProduct?.images?.[0]?.url && <img src={item.includedProduct.images[0].url} alt="" />}</span><strong>{item.includedProduct?.name}</strong><b>× {item.quantity}</b></div>)}
            </div>
          )}

          {/* =====================================
              VARIANTS
          ===================================== */}

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

          {/* =====================================
              CART ACTIONS
          ===================================== */}

          <div className="product-action-area">
            <ProductActions
              product={product}
              disabled={!inStock}
            />
          </div>

          {/* =====================================
              DELIVERY INFO
          ===================================== */}

          <div className="delivery-card">

            <div className="delivery-card-title">
              <Truck size={19} />

              <strong>
                Delivery Information
              </strong>
            </div>

            <div className="delivery-row">

              <span>
                <MapPin size={15} />
                Deliver to
              </span>

              <strong>
                Your location
              </strong>

            </div>

            <div className="delivery-row">

              <span>
                <PackageCheck size={15} />
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
              Free delivery on orders
              above ৳3,000
            </div>

          </div>

          {/* =====================================
              TRUST FEATURES
          ===================================== */}

          <div className="trust-features">

            <div>
              <ShieldCheck size={18} />
              <span>
                Authentic
              </span>
            </div>

            <div>
              <Check size={18} />
              <span>
                Quality Checked
              </span>
            </div>

            <div>
              <Truck size={18} />
              <span>
                Fast Delivery
              </span>
            </div>

            <div>
              <RotateCcw size={18} />
              <span>
                Easy Return
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================
          PRODUCT DETAILS
      ========================================= */}

      <section className="container product-details-section">

        <div className="product-details-card">

          {/* =======================================
              DESCRIPTION
          ======================================= */}

          <div className="product-description-block">

            <div className="details-eyebrow">
              PRODUCT INFORMATION
            </div>

            <h2>
              Product Description
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
                Product description is
                not available yet.
              </p>
            )}

          </div>

          {/* =======================================
              SPECIFICATIONS
          ======================================= */}

          <div className="specifications">

            <div className="details-eyebrow">
              PRODUCT DETAILS
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

              <div>
                <span>
                  SKU
                </span>

                <strong>
                  {sku}
                </strong>
              </div>

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

              {product.variants?.length > 0 && (
                <div>
                  <span>
                    Options
                  </span>

                  <strong>
                    {product.variants.length}{' '}
                    options
                  </strong>
                </div>
              )}

            </div>

          </div>

          {/* =======================================
              DELIVERY / RETURN
          ======================================= */}

          <div className="delivery-return-section">

            <div className="details-eyebrow">
              CUSTOMER CARE
            </div>

            <h2>
              Delivery & Return
            </h2>

            <div className="delivery-return-grid">

              <div className="delivery-return-card">
                <Truck size={22} />

                <div>
                  <h3>
                    Fast Delivery
                  </h3>

                  <p>
                    Your order is carefully
                    packed and delivered safely
                    to your doorstep.
                  </p>
                </div>
              </div>

              <div className="delivery-return-card">
                <ShieldCheck size={22} />

                <div>
                  <h3>
                    Quality Guarantee
                  </h3>

                  <p>
                    Every product is checked
                    before it leaves our
                    warehouse.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =========================================
          REVIEWS
      ========================================= */}

      <section
        id="reviews"
        className="container product-reviews-section"
      >
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          averageRating={averageRating}
          reviewCount={reviewCount}
          ratingDistribution={
            ratingDistribution
          }
        />
      </section>

      {/* =========================================
          RELATED PRODUCTS
      ========================================= */}

      {related.length > 0 && (
        <section className="container related-products">

          <div className="section-heading">

            <div>
              <span>
                YOU MAY ALSO LIKE
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

