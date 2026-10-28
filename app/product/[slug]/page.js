import OptimizedImage from '@/components/OptimizedImage';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import './product-page.css';

import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Check,
  PackageCheck,
  RotateCcw,
  MapPin,
} from 'lucide-react';

import { getProduct } from '@/lib/products';

import ProductReviews from '@/components/product/ProductReviews';
import ProductGallery from '@/components/product/ProductGallery';
import ProductActions from '@/components/product/ProductActions';
import MetaProductView from '@/components/MetaProductView';
import ProductPriceDisplay from '@/components/product/ProductPriceDisplay';
import ProductWeightStockDisplay from '@/components/product/ProductWeightStockDisplay';
import { ProductOptionProvider } from '@/components/product/ProductOptionContext';
import RelatedProductsSection from '@/components/product/RelatedProductsSection';
import DeliveryChecker from '@/components/product/DeliveryChecker';
import ProductDetailsTabs from '@/components/product/ProductDetailsTabs';

import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  cleanText,
  truncate,
  getRobots,
  getCanonical,
  getProductPrice,
  safeJsonLd,
} from '@/lib/seo';


/* =====================================================
   PRODUCT METADATA
===================================================== */

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;

  const product =
    await getProduct(slug);


  if (!product) {
    return {
      title: 'Product Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }


  const seo =
    product.seo;


  const title =
    cleanText(seo?.metaTitle) ||
    `${product.name} | ${SITE_NAME}`;


  const canonical = getCanonical(
    seo?.canonicalUrl,
    `/product/${product.slug}`
  );

  const description = truncate(
    cleanText(seo?.metaDescription) ||
      cleanText(
        product.shortDescription || product.description
      ) ||
      `Shop ${product.name} online at ${SITE_NAME}.`,
    160
  );

  const image =
    absoluteUrl(seo?.ogImage) ||
    absoluteUrl(product.images?.[0]?.url);
  const ogTitle = cleanText(seo?.ogTitle) || title;
  const ogDescription =
    cleanText(seo?.ogDescription) || description;


  return {
    title: {
      absolute: title,
    },

    description,

    alternates: {
      canonical,
    },

    robots:
      product.active
        ? getRobots(seo)
        : { index: false, follow: true },

    openGraph: {
      type: 'website',
      locale: 'en_BD',
      url: canonical,
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,

      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 1200,
              alt: product.name,
            },
          ]
        : [],
    },

    twitter: {
      card: 'summary_large_image',

      title: cleanText(seo?.twitterTitle) || ogTitle,

      description:
        cleanText(seo?.twitterDescription) || ogDescription,

      images: seo?.twitterImage
        ? [absoluteUrl(seo.twitterImage)].filter(Boolean)
        : image
          ? [image]
          : [],
    },
  };
}


/* =====================================================
   PRODUCT JSON-LD
===================================================== */

function ProductStructuredData({
  product,
  canonicalUrl,
  price,
  inStock,
  averageRating,
  reviewCount,
  approvedReviews,
}) {
  const productUrl = canonicalUrl;


  const images =
    (product.images || [])
      .map((image) =>
        absoluteUrl(image.url)
      )
      .filter(Boolean);


  const brandName =
    product.brandRelation?.name ||
    product.brand ||
    null;


  const categoryName =
    product.category?.name ||
    null;


  const description =
    truncate(
      cleanText(
        product.shortDescription ||
          product.description
      ) ||
        `Shop ${product.name} online at ${SITE_NAME}.`,
      500
    );


  const schema = {
    '@context':
      'https://schema.org',

    '@type':
      'Product',

    '@id':
      `${productUrl}#product`,

    name:
      product.name,

    url:
      productUrl,

    description,

    ...(product.sku ? { sku: product.sku } : {}),

    ...(images.length > 0
      ? {
          image: images,
        }
      : {}),

    ...(brandName
      ? {
          brand: {
            '@type':
              'Brand',
            name:
              brandName,
          },
        }
      : {}),

    ...(categoryName
      ? {
          category:
            categoryName,
        }
      : {}),

    ...(Number.isFinite(Number(price)) && Number(price) > 0
      ? {
          offers: {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'BDT',
            price: Number(price).toFixed(2),
            availability: inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            seller: {
              '@type': 'Organization',
              name: SITE_NAME,
              url: SITE_URL,
            },
          },
        }
      : {}),
  };


  /* =====================================================
     AGGREGATE RATING
  ===================================================== */

  if (
    reviewCount > 0 &&
    averageRating > 0
  ) {
    schema.aggregateRating = {
      '@type':
        'AggregateRating',

      ratingValue:
        Number(
          averageRating
        ).toFixed(1),

      reviewCount:
        reviewCount,

      bestRating:
        '5',

      worstRating:
        '1',
    };
  }


  /* =====================================================
     REVIEWS
  ===================================================== */

  const reviewSchema =
    approvedReviews
      .filter(
        (review) =>
          review.comment &&
          String(
            review.comment
          ).trim()
      )
      .slice(0, 20)
      .map((review) => ({
        '@type':
          'Review',

        reviewRating: {
          '@type':
            'Rating',

          ratingValue:
            Number(
              review.rating
            ),

          bestRating:
            '5',

          worstRating:
            '1',
        },

        author: {
          '@type':
            'Person',

          name:
            review.user?.name ||
            'Customer',
        },

        reviewBody:
          cleanText(
            review.comment
          ),

        datePublished:
          review.createdAt
            ? new Date(
                review.createdAt
              ).toISOString()
            : undefined,
      }));


  if (
    reviewSchema.length > 0
  ) {
    schema.review =
      reviewSchema;
  }


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            safeJsonLd(schema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd({
            '@context':
              'https://schema.org',

            '@type':
              'BreadcrumbList',

            itemListElement: [
              {
                '@type':
                  'ListItem',

                position: 1,

                name: 'Home',

                item:
                  SITE_URL,
              },

              {
                '@type':
                  'ListItem',

                position: 2,

                name: 'Shop',

                item:
                  absoluteUrl(
                    '/shop'
                  ),
              },

              ...(product.category
                ? [
                    {
                      '@type':
                        'ListItem',

                      position: 3,

                      name:
                        product.category
                          .name,

                      item:
                        absoluteUrl(
                          `/category/${product.category.slug}`
                        ),
                    },
                  ]
                : []),

              {
                '@type':
                  'ListItem',

                position:
                  product.category
                    ? 4
                    : 3,

                name:
                  product.name,

                item:
                  productUrl,
              },
            ],
          }),
        }}
      />
    </>
  );
}


/* =====================================================
   PRODUCT PAGE
===================================================== */

export default async function ProductPage({
  params,
}) {
  const { slug } = await params;

  const product =
    await getProduct(slug);


  if (!product) {
    notFound();
  }

  const canonicalUrl = getCanonical(
    product.seo?.canonicalUrl,
    `/product/${product.slug}`
  );

  /* =========================================
     PRICE
  ========================================= */

  const regularPrice =
    Number(
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


  const price =
    hasDiscount
      ? salePrice
      : salePrice ?? regularPrice;


  const discount =
    hasDiscount &&
    regularPrice > 0
      ? Math.round(
          (
            (
              regularPrice -
              salePrice
            ) /
            regularPrice
          ) *
            100
        )
      : 0;


  /* =========================================
     RELATED PRODUCTS
  ========================================= */

  /* =========================================
     REVIEWS
  ========================================= */

  const reviews =
    product.reviews || [];


  const approvedReviews =
    reviews.filter(
      (review) =>
        review.approved === true
    );


  const reviewCount = product.reviewSummary?.count ?? approvedReviews.length;
  const averageRating = product.reviewSummary
    ? Number(Number(product.reviewSummary.average).toFixed(1))
    : reviewCount
      ? Number((approvedReviews.reduce((total, review) => total + Number(review.rating || 0), 0) / approvedReviews.length).toFixed(1))
      : 0;
  const ratingDistribution = product.reviewSummary?.ratingDistribution || {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };


  /* =========================================
     PRODUCT DATA
  ========================================= */

  const images =
    product.images || [];


  const sku = product.sku || '';


  const weightVariants = product.category?.enableWeightVariants
    ? product.variants.filter((variant) => variant.name)
    : [];
  const stock =
    weightVariants.length
      ? weightVariants.reduce((total, variant) => total + Number(variant.stock || 0), 0)
      :
    Number(
      product.stock || 0
    );

  const inStock =
    weightVariants.length > 0
      ? weightVariants.some((variant) => Number(variant.stock || 0) > 0)
      : product.variants?.length > 0
      ? product.variants.some((variant) => Number(variant.stock || 0) > 0)
      : stock > 0;


  const shortDescription =
    product.shortDescription?.trim() ||
    '';


  /* =========================================
     REVIEW STARS
  ========================================= */

  const stars =
    Array.from({
      length: 5,
    });


  return (
    <main className="single-product-page">

      {product.active && (
        <ProductStructuredData
          product={product}
          canonicalUrl={canonicalUrl}
          price={price}
          inStock={inStock}
          averageRating={averageRating}
          reviewCount={reviewCount}
          approvedReviews={approvedReviews}
        />
      )}

      {product.active && (
        <MetaProductView
          productId={product.id}
          productName={product.name}
          price={price}
        />
      )}

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
                href={`/category/${product.category.slug}`}
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

        <ProductOptionProvider
          defaultWeightVariantId={
            weightVariants.find((variant) => Number(variant.stock || 0) > 0)?.id ||
            weightVariants[0]?.id ||
            ''
          }
        >
        <div className="product-gallery-column">

          <ProductGallery
            product={product}
            discount={discount}
          />

        </div>


        <div className="product-info">

          <div className="product-top-meta">

            <div className="quality-badge">

              <Check size={14} />

              <span>
                Fresh & Quality
              </span>

            </div>


            {(product.brandRelation?.name ||
              product.brand) && (
              <span className="product-brand-pill">
                {product.brandRelation?.name ||
                  product.brand}
              </span>
            )}

          </div>


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


          <h1 className="product-title">
            {product.name}
          </h1>


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


          <a
            href="#reviews"
            className="product-rating product-rating-link"
            aria-label="View product reviews"
          >

            <span className="stars">

              {stars.map(
                (_, index) => (
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
                )
              )}

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

              {weightVariants.length > 0
                ? <ProductWeightStockDisplay weightVariants={weightVariants} fallbackStock={stock} />
                : inStock
                  ? `${stock} available`
                  : 'Out of stock'}

            </div>

          </div>


          <div className="product-price-area">

            <ProductPriceDisplay
              weightVariants={weightVariants}
              regularPrice={regularPrice}
              salePrice={salePrice}
              price={price}
              hasDiscount={hasDiscount}
              discount={discount}
            />

          </div>


          {product.productType ===
            'COMBO' &&
            product.comboItems?.length >
              0 && (
              <div className="product-combo-includes">

                <h2>
                  This Bundle Includes
                </h2>

                {product.comboItems.map(
                  (item) => (
                    <div
                      key={item.id}
                    >

                      <span>
                        {item.includedProduct
                          ?.images?.[0]
                          ?.url && (
                          <OptimizedImage
                            src={
                              item
                                .includedProduct
                                .images[0]
                                .url
                            }
                            alt=""
                          />
                        )}
                      </span>

                      <strong>
                        {
                          item
                            .includedProduct
                            ?.name
                        }
                      </strong>

                      <b>
                        × {item.quantity}
                      </b>

                    </div>
                  )
                )}

              </div>
            )}


          <div className="product-action-area">

            <ProductActions
              product={product}
              disabled={!inStock}
            />

          </div>


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

          <DeliveryChecker />


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

        </ProductOptionProvider>

      </section>


      {/* =========================================
          PRODUCT DETAILS
      ========================================= */}

      <section className="container product-details-section">
        <ProductDetailsTabs product={product} sku={sku} inStock={inStock} />
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

      <section className="container product-faq-section" aria-labelledby="product-faq-title">
        <div className="section-heading">
          <div>
            <span>NEED TO KNOW</span>
            <h2 id="product-faq-title">Frequently Asked Questions</h2>
          </div>
        </div>
        <div className="product-faq-list">
          <details>
            <summary>What sizes and colors are available?</summary>
            <p>Select from the options shown above when they are configured for this product.</p>
          </details>
          <details>
            <summary>How can I check delivery availability?</summary>
            <p>Enter your area or district in the delivery checker to see the available delivery information.</p>
          </details>
          <details>
            <summary>What is the return policy?</summary>
            <p>Returns are handled according to the Prenaxo return policy. Contact customer support if there is a problem with your order.</p>
          </details>
        </div>
      </section>


      {/* =========================================
          RELATED PRODUCTS
      ========================================= */}

      <Suspense fallback={null}>
        <RelatedProductsSection
          productId={product.id}
          categoryId={product.categoryId}
        />
      </Suspense>

    </main>
  );
}