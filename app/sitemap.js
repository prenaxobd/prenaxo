import { prisma } from '@/lib/prisma';

import {
  SITE_URL,
  absoluteUrl,
  getCanonical,
} from '@/lib/seo';


export default async function sitemap() {
  try {

    /* =====================================================
       PRODUCTS
    ===================================================== */

    const products =
      await prisma.product.findMany({
        where: {
          active: true,
        },

        select: {
          slug: true,
          updatedAt: true,

          seo: {
            select: {
              canonicalUrl: true,
              robotsIndex: true,
            },
          },
        },

        orderBy: {
          updatedAt: 'desc',
        },
      });


    /* =====================================================
       CATEGORIES
    ===================================================== */

    const categories =
      await prisma.category.findMany({
        where: {
          active: true,
        },

        select: {
          slug: true,
          createdAt: true,

          seo: {
            select: {
              canonicalUrl: true,
              robotsIndex: true,
            },
          },
        },

        orderBy: {
          createdAt: 'desc',
        },
      });


    /* =====================================================
       PRODUCT URLS
    ===================================================== */

    const productUrls =
      products
        .filter(
          (product) =>
            product.seo?.robotsIndex !==
            'NOINDEX'
        )
        .filter((product) => {
          if (
            !product.seo?.canonicalUrl
          ) {
            return true;
          }

          const canonical =
            getCanonical(
              product.seo.canonicalUrl,
              `/product/${product.slug}`
            );

          return (
            canonical ===
              absoluteUrl(
                `/product/${product.slug}`
              )
          );
        })
        .map((product) => ({
          url: absoluteUrl(
            `/product/${product.slug}`
          ),

          lastModified:
            product.updatedAt,

          changeFrequency:
            'weekly',

          priority: 0.8,
        }));


    /* =====================================================
       CATEGORY URLS
    ===================================================== */

    const categoryUrls =
      categories
        .filter(
          (category) =>
            category.seo?.robotsIndex !==
            'NOINDEX'
        )
        .filter((category) => {
          if (
            !category.seo?.canonicalUrl
          ) {
            return true;
          }

          const canonical =
            getCanonical(
              category.seo.canonicalUrl,
              `/category/${category.slug}`
            );

          return (
            canonical ===
              absoluteUrl(
                `/category/${category.slug}`
              )
          );
        })
        .map((category) => ({
          url: absoluteUrl(
            `/category/${category.slug}`
          ),

          lastModified:
            category.createdAt,

          changeFrequency:
            'weekly',

          priority: 0.7,
        }));


    /* =====================================================
       STATIC URLS
    ===================================================== */

    const staticUrls = [
      {
        url: SITE_URL,

        lastModified:
          new Date(),

        changeFrequency:
          'daily',

        priority: 1,
      },

      {
        url:
          absoluteUrl('/shop'),

        lastModified:
          new Date(),

        changeFrequency:
          'daily',

        priority: 0.9,
      },

      ...[
        '/about',
        '/contact',
        '/faq',
        '/privacy',
        '/terms',
        '/combos',
        '/flash-sale',
      ].map((path) => ({
        url: absoluteUrl(path),
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      })),
    ];


    return [
      ...staticUrls,
      ...categoryUrls,
      ...productUrls,
    ];

  } catch (error) {

    console.error(
      'sitemap error:',
      error
    );

    return [
      {
        url: SITE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}