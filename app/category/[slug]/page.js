import Link from 'next/link';
import { notFound } from 'next/navigation';

import OptimizedImage from '@/components/OptimizedImage';
import ProductCard from '@/components/ProductCard';
import ShopBrowser from '@/components/shop/ShopBrowser';
import { getPublicCategoryBrands, getPublicCategories, getPublicCategory, getPublicCategoryPage, getPublicPriceBounds } from '@/lib/public-data';
import { getShopProducts } from '@/lib/products';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './category.module.css';

import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  cleanText,
  truncate,
  getRobots,
  getCanonical,
  safeJsonLd,
} from '@/lib/seo';

const CATEGORY_HERO_IMAGES = {
  'lamp-light': '/uploads/lamp_category_bg.webp',
  honey: 'https://res.cloudinary.com/ethp0qrs/image/upload/v1790486340/Honey-Nuts-Collection.webp',
  'honey-nuts': 'https://res.cloudinary.com/ethp0qrs/image/upload/v1790486340/Honey-Nuts-Collection.webp',
  'mans-clothing': 'https://res.cloudinary.com/ethp0qrs/image/upload/v1790486340/Man_s-Clothing-Collection.webp',
};

/* =====================================================
   CATEGORY METADATA
===================================================== */

export async function generateMetadata({
  params,
  searchParams,
}) {
  const { slug } = await params;
  const query = await searchParams;


  const category = await getPublicCategory(slug);


  if (!category) {
    return {
      title: 'Category Not Found',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const isFashionCategory = ['mans-clothing', 'womens-fashion'].includes(category.slug);

  const fallbackDescription =
    cleanText(
      category.description
    ) ||
    (isFashionCategory
      ? `Shop ${category.name} online in Bangladesh at Prenaxo.com. Discover quality fashion, trending styles, and great prices with convenient delivery.`
      : `Shop ${category.name} products online at ${SITE_NAME}.`);


  const title =
    category.seo?.metaTitle ||
    (isFashionCategory
      ? `${category.slug === 'mans-clothing' ? "Men's" : "Women's"} Fashion Online in Bangladesh | Prenaxo.com`
      : `${category.name} | ${SITE_NAME}`);


  const description =
    category.seo?.metaDescription ||
    truncate(
      fallbackDescription,
      160
    );


  const canonical = getCanonical(
    category.seo?.canonicalUrl,
    `/category/${category.slug}`
  );


  const ogTitle =
    category.seo?.ogTitle ||
    title;


  const ogDescription =
    category.seo?.ogDescription ||
    description;


  const ogImage =
    category.seo?.ogImage
      ? absoluteUrl(
          category.seo.ogImage
        )
      : category.image
      ? absoluteUrl(
          category.image
        )
      : absoluteUrl(
          '/uploads/site_icon.png'
        );


  return {
    title: {
      absolute: title,
    },

    description,

    alternates: {
      canonical,
    },

    robots: Object.keys(query || {}).length > 0
      ? { index: false, follow: true }
      : getRobots(category.seo),

    openGraph: {
      type: 'website',
      locale: 'en_BD',
      url: canonical,
      siteName: SITE_NAME,
      title: ogTitle,
      description: ogDescription,

      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: category.name,
            },
          ]
        : [],
    },

    twitter: {
      card: 'summary_large_image',
      title:
        category.seo?.twitterTitle ||
        ogTitle,
      description:
        category.seo?.twitterDescription ||
        ogDescription,
      images:
        category.seo?.twitterImage
          ? [
              absoluteUrl(
                category.seo
                  .twitterImage
              ),
            ]
          : ogImage
          ? [ogImage]
          : [],
    },
  };
}


/* =====================================================
   CATEGORY PAGE
===================================================== */

export default async function CategoryPage({
  params,
  searchParams,
}) {
  const { slug } = await params;
  const query = await searchParams;
  const currentPage = Math.max(1, Number(query?.page) || 1);
  const subcategorySlug = typeof query?.subcategory === 'string' ? query.subcategory : '';
  const productsPerPage = 12;


  let category = await getPublicCategoryPage(slug, currentPage, productsPerPage, subcategorySlug);


  if (!category) {
    notFound();
  }

  const categoryHeroImage =
    CATEGORY_HERO_IMAGES[category.slug?.trim().toLowerCase()];

  const lastPage = Math.max(1, Math.ceil(category._count.products / productsPerPage));
  if (currentPage > lastPage) {
    category = await getPublicCategoryPage(slug, lastPage, productsPerPage, subcategorySlug);
  }

  const totalPages = Math.max(1, Math.ceil(category._count.products / productsPerPage));
  const page = Math.min(currentPage, totalPages);
  const serializedProducts = category.products.map((product) => ({
    ...product,
    regularPrice: product.regularPrice?.toString() || null,
    salePrice: product.salePrice?.toString() || null,
    costPrice: product.costPrice?.toString() || null,
    createdAt: product.createdAt?.toISOString?.() || product.createdAt,
    updatedAt: product.updatedAt?.toISOString?.() || product.updatedAt,
  }));


  const categoryUrl =
    absoluteUrl(
      `/category/${category.slug}`
    );


  const categoryImage =
    category.image
      ? absoluteUrl(category.image)
      : null;
  const isFashionCategory = ['mans-clothing', 'womens-fashion'].includes(category.slug);
  const fashionTitle = category.slug === 'mans-clothing' ? "Men's Fashion" : "Women's Fashion";

  let fashionShopProps = null;
  if (isFashionCategory) {
    const filters = {
      category: category.slug,
      subcategory: subcategorySlug || 'all',
      brand: query?.brand || 'all',
      search: query?.search || query?.q || '',
      min: query?.min || '',
      max: query?.max || '',
      rating: Number(query?.rating || 0),
      availability: query?.availability || 'all',
      sort: query?.sort || 'newest',
      page: Math.max(1, Number(query?.page) || 1),
      perPage: 16,
    };
    const [productData, brands, categories, priceBounds] = await Promise.all([
      getShopProducts(filters),
      getPublicCategoryBrands(category.slug),
      getPublicCategories(),
      getPublicPriceBounds(category.slug),
    ]);

    fashionShopProps = {
      products: productData.products,
      total: productData.total,
      totalPages: productData.totalPages,
      currentPage: productData.page,
      initialFilters: {
        category: category.slug,
        subcategory: filters.subcategory,
        search: filters.search,
        brand: filters.brand,
        priceRange: { min: filters.min, max: filters.max },
        ratingFilter: filters.rating,
        availability: filters.availability,
        sort: filters.sort,
      },
      brands,
      categories,
      priceBounds,
      pageTitle: fashionTitle,
      basePath: `/category/${category.slug}`,
      lockedCategory: category.slug,
      pageClassName: styles.fashionShopPage,
    };
  }


  /* =====================================================
     CATEGORY JSON-LD
  ===================================================== */

  const categorySchema = {
    '@context':
      'https://schema.org',

    '@type':
      'CollectionPage',

    '@id':
      `${categoryUrl}#collection`,

    name:
      category.name,

    url:
      categoryUrl,

    description:
      truncate(
        cleanText(
          category.description
        ) ||
          `Shop ${category.name} products online at ${SITE_NAME}.`,
        160
      ),

    ...(categoryImage
      ? {
          image: [
            categoryImage,
          ],
        }
      : {}),

    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  };


  /* =====================================================
     BREADCRUMB JSON-LD
  ===================================================== */

  const breadcrumbSchema = {
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

        item: SITE_URL,
      },

      {
        '@type':
          'ListItem',

        position: 2,

        name: 'Shop',

        item: absoluteUrl('/shop'),
      },

      {
        '@type':
          'ListItem',

        position: 3,

        name: category.name,

        item: categoryUrl,
      },
    ],
  };


  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            safeJsonLd(
              categorySchema
            ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            safeJsonLd(
              breadcrumbSchema
            ),
        }}
      />


      {fashionShopProps ? (
        <ShopBrowser key={category.slug} {...fashionShopProps} />
      ) : (
      <main className={styles.page}>
        <div className="container">
          <section className={styles.hero}>
            {categoryHeroImage && (
              <OptimizedImage
                src={categoryHeroImage}
                alt=""
                className={styles.heroImage}
                width={1600}
                height={650}
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
              />
            )}
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>EXPLORE THE COLLECTION</span>
              <h1>{category.name} <strong>Collection</strong></h1>
              <p>{category.description || `Explore ${category.name} and all the products in its subcategories.`}</p>
              <a className={styles.heroButton} href="#category-products">Explore the collection <ArrowRight size={16} /></a>
            </div>
          </section>

          <div className={styles.contentHead} id="category-products">
            <div><span className={styles.eyebrow}>CURATED FOR YOU</span><h2>{category.selectedSubcategory ? `Shop ${category.subcategories.find(item => item.slug === category.selectedSubcategory)?.name}` : `Shop ${category.name}`}</h2></div>
            <span className={styles.count}>{category._count.products} products</span>
          </div>

          <div className={`${styles.catalogue} ${category.subcategories.length === 0 ? styles.catalogueFullWidth : ''}`}>
            {category.subcategories.length > 0 && (
              <aside className={styles.sidebar} aria-label={`${category.name} subcategory filter`}>
                <h3>Subcategories</h3>
                <Link
                  className={!category.selectedSubcategory ? styles.selectedSubcategory : ''}
                  href={`/category/${category.slug}`}
                  aria-current={!category.selectedSubcategory ? 'page' : undefined}
                >
                  All {category.name}
                </Link>
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    className={category.selectedSubcategory === subcategory.slug ? styles.selectedSubcategory : ''}
                    href={`/category/${category.slug}?subcategory=${encodeURIComponent(subcategory.slug)}`}
                    aria-current={category.selectedSubcategory === subcategory.slug ? 'page' : undefined}
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </aside>
            )}

            <div
              className={
                category.slug === 'lamp-light'
                  ? `${styles.products} ${styles.lampLightProducts}`
                  : styles.products
              }
            >
              {serializedProducts.length > 0 ? (
                <div className="shop-grid">
                  {serializedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
              ) : (
                <p className={styles.empty}>No products are currently available in this collection.</p>
              )}
            </div>
          </div>

          {totalPages > 1 && <nav className={styles.pagination} aria-label="Category pagination">
            {page > 1 ? <a href={`/category/${category.slug}?${new URLSearchParams({ ...(subcategorySlug ? { subcategory: subcategorySlug } : {}), page: String(page - 1) })}`} aria-label="Previous page"><ChevronLeft size={15} /></a> : <span className={styles.disabled}><ChevronLeft size={15} /></span>}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => number === page ? <span className={styles.active} key={number}>{number}</span> : <a href={`/category/${category.slug}?${new URLSearchParams({ ...(subcategorySlug ? { subcategory: subcategorySlug } : {}), page: String(number) })}`} key={number}>{number}</a>)}
            {page < totalPages ? <a href={`/category/${category.slug}?${new URLSearchParams({ ...(subcategorySlug ? { subcategory: subcategorySlug } : {}), page: String(page + 1) })}`} aria-label="Next page"><ChevronRight size={15} /></a> : <span className={styles.disabled}><ChevronRight size={15} /></span>}
          </nav>}
        </div>
      </main>
      )}
    </>
  );
}