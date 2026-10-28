import { prisma } from '@/lib/prisma';

import {
  absoluteUrl,
  getCanonical,
} from '@/lib/seo';

export const revalidate = 3600;


export default async function sitemap() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: {
        slug: true,
        updatedAt: true,
        productType: true,
        regularPrice: true,
        salePrice: true,
        seo: {
          select: {
            canonicalUrl: true,
            robotsIndex: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { active: true, parentId: null },
      select: {
        slug: true,
        seo: {
          select: {
            canonicalUrl: true,
            robotsIndex: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const productUrls = products
    .filter((product) => product.seo?.robotsIndex !== 'NOINDEX')
    .filter((product) => {
      const path = `/product/${product.slug}`;
      return getCanonical(product.seo?.canonicalUrl, path) === absoluteUrl(path);
    })
    .map((product) => ({
      url: absoluteUrl(`/product/${product.slug}`),
      lastModified: product.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const categoryUrls = categories
    .filter((category) => category.seo?.robotsIndex !== 'NOINDEX')
    .filter((category) => {
      const path = `/category/${category.slug}`;
      return getCanonical(category.seo?.canonicalUrl, path) === absoluteUrl(path);
    })
    .map((category) => ({
      url: absoluteUrl(`/category/${category.slug}`),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const staticUrls = [
    { url: absoluteUrl('/'), changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/shop'), changeFrequency: 'daily', priority: 0.9 },
    ...[
      '/about',
      '/contact',
      '/faq',
      '/privacy',
      '/terms',
    ].map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: 'monthly',
      priority: 0.5,
    })),
  ];

  if (products.some((product) => product.productType === 'COMBO')) {
    staticUrls.push({
      url: absoluteUrl('/combos'),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  if (
    products.some(
      (product) =>
        product.salePrice !== null &&
        Number(product.salePrice) > 0 &&
        Number(product.salePrice) < Number(product.regularPrice || 0)
    )
  ) {
    staticUrls.push({
      url: absoluteUrl('/flash-sale'),
      changeFrequency: 'daily',
      priority: 0.6,
    });
  }

  return [...staticUrls, ...categoryUrls, ...productUrls];
}