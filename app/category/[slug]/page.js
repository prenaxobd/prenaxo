import Link from 'next/link';
import { notFound } from 'next/navigation';

import ProductCard from '@/components/ProductCard';
import { prisma } from '@/lib/prisma';

import {
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  cleanText,
  truncate,
  getRobots,
  safeJsonLd,
} from '@/lib/seo';


/* =====================================================
   CATEGORY METADATA
===================================================== */

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;


  const category =
    await prisma.category.findUnique({
      where: {
        slug,
      },

      include: {
        seo: true,
      },
    });


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


  const canonical =
    category.seo?.canonicalUrl ||
    absoluteUrl(
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
}) {
  const { slug } = await params;


  const category =
    await prisma.category.findUnique({
      where: {
        slug,
      },

      include: {
        seo: true,

        products: {
          where: {
            active: true,
          },

          include: {
            category: true,

            images: {
              orderBy: {
                sortOrder: 'asc',
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });


  if (!category) {
    notFound();
  }


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


      <main className="container">

        <div className="page-title">

          <div
            className="eyebrow"
            style={{
              color:
                'var(--coral)',
            }}
          >
            Collection
          </div>

          <h1>
            {category.name}
          </h1>

          <p className="muted">
            {category.description ||
              'Thoughtful picks for your everyday.'}
          </p>

        </div>


        <div className="shop-grid">

          {category.products.map(
            (product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}

        </div>

      </main>
    </>
  );
}