import Link from 'next/link';
import { notFound } from 'next/navigation';

import ProductCard from '@/components/ProductCard';
import { getPublicCategory, getPublicCategoryPage } from '@/lib/public-data';
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


/* =====================================================
   CATEGORY METADATA
===================================================== */

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;


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


  const fallbackDescription =
    cleanText(
      category.description
    ) ||
    `Shop ${category.name} products online at ${SITE_NAME}.`;


  const title =
    category.seo?.metaTitle ||
    `${category.name} | ${SITE_NAME}`;


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
    title,

    description,

    alternates: {
      canonical,
    },

    robots: getRobots(
      category.seo
    ),

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
  const productsPerPage = 12;


  let category = await getPublicCategoryPage(slug, currentPage, productsPerPage);


  if (!category) {
    notFound();
  }

  const lastPage = Math.max(1, Math.ceil(category._count.products / productsPerPage));
  if (currentPage > lastPage) {
    category = await getPublicCategoryPage(slug, lastPage, productsPerPage);
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


      <main className={styles.page}>
        <div className="container">
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <span className={styles.eyebrow}>LIGHT UP YOUR EVERYDAY</span>
              <h1>{category.name} <strong>Collection</strong></h1>
              <p>{category.description || 'Warm, thoughtful lighting pieces to make every corner of your home feel brighter.'}</p>
              <a className={styles.heroButton} href="#category-products">Explore the collection <ArrowRight size={16} /></a>
            </div>
          </section>

          <div className={styles.contentHead} id="category-products">
            <div><span className={styles.eyebrow}>CURATED FOR YOU</span><h2>Shop {category.name}</h2></div>
            <span className={styles.count}>{category._count.products} products</span>
          </div>

          <div className={styles.products}>
            <div className="shop-grid">
              {serializedProducts.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>

          {totalPages > 1 && <nav className={styles.pagination} aria-label="Category pagination">
            {page > 1 ? <a href={`/category/${category.slug}?page=${page - 1}`} aria-label="Previous page"><ChevronLeft size={15} /></a> : <span className={styles.disabled}><ChevronLeft size={15} /></span>}
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => number === page ? <span className={styles.active} key={number}>{number}</span> : <a href={`/category/${category.slug}?page=${number}`} key={number}>{number}</a>)}
            {page < totalPages ? <a href={`/category/${category.slug}?page=${page + 1}`} aria-label="Next page"><ChevronRight size={15} /></a> : <span className={styles.disabled}><ChevronRight size={15} /></span>}
          </nav>}
        </div>
      </main>
    </>
  );
}