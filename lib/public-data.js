import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getPublicBrands = unstable_cache(
  async function getPublicBrands() {
    return prisma.brand.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  },
  ['public-brands'],
  { tags: ['brands'], revalidate: 300 }
);

export const getPublicCategories = unstable_cache(
  async function getPublicCategories() {
    return prisma.category.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });
  },
  ['public-categories'],
  { tags: ['categories'], revalidate: 300 }
);

export const getPublicCategory = unstable_cache(
  async function getPublicCategory(slug) {
    return prisma.category.findUnique({
      where: { slug },
      include: {
        seo: true,
      },
    });
  },
  ['public-category'],
  { tags: ['categories', 'seo'], revalidate: 60 }
);

export const getPublicCategoryPage = unstable_cache(
  async function getPublicCategoryPage(slug, page = 1, perPage = 12) {
    return prisma.category.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        image: true,
        seo: true,
        _count: {
          select: {
            products: { where: { active: true } },
          },
        },
        products: {
          where: { active: true },
          include: {
            category: true,
            images: {
              orderBy: { sortOrder: 'asc' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (Math.max(1, page) - 1) * perPage,
          take: perPage,
        },
      },
    });
  },
  ['public-category-page'],
  { tags: ['categories', 'products', 'seo'], revalidate: 60 }
);
