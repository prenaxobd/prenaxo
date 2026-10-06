import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getCategorySubtreeIds } from './category-tree';

export const getPublicBrands = unstable_cache(
  async function getPublicBrands() {
    return prisma.brand.findMany({
      where: {
        active: true,
        products: {
          some: { active: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  },
  ['public-brands'],
  { tags: ['brands', 'products'], revalidate: 300 }
);

export const getPublicCategoryBrands = unstable_cache(
  async function getPublicCategoryBrands(slug) {
    const [category, categories] = await Promise.all([
      prisma.category.findUnique({
        where: { slug },
        select: { id: true, active: true },
      }),
      prisma.category.findMany({
        where: { active: true },
        select: { id: true, parentId: true },
      }),
    ]);

    if (!category?.active) return [];

    const categoryIds = getCategorySubtreeIds(categories, category.id);
    const where = { active: true, categoryId: { in: categoryIds } };
    const [legacyBrands, relatedBrands] = await Promise.all([
      prisma.product.findMany({
        where: { ...where, brand: { not: null } },
        distinct: ['brand'],
        select: { brand: true },
      }),
      prisma.brand.findMany({
        where: { products: { some: where } },
        select: { name: true },
      }),
    ]);
    const names = new Set([
      ...legacyBrands.map(item => item.brand?.trim()).filter(Boolean),
      ...relatedBrands.map(item => item.name.trim()).filter(Boolean),
    ]);

    return [...names]
      .sort((first, second) => first.localeCompare(second))
      .map(name => ({ id: name, name }));
  },
  ['public-category-brands'],
  { tags: ['brands', 'categories', 'products'], revalidate: 300 }
);

export const getPublicPriceBounds = unstable_cache(
  async function getPublicPriceBounds(categorySlug = '') {
    let categoryIds;

    if (categorySlug) {
      const [category, categories] = await Promise.all([
        prisma.category.findUnique({
          where: { slug: categorySlug },
          select: { id: true, active: true },
        }),
        prisma.category.findMany({
          where: { active: true },
          select: { id: true, parentId: true },
        }),
      ]);

      if (category?.active) {
        categoryIds = getCategorySubtreeIds(categories, category.id);
      }
    }

    const where = {
      active: true,
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    };
    let prices = await prisma.product.aggregate({
      where,
      _max: { regularPrice: true, salePrice: true },
    });

    if (
      categoryIds &&
      prices._max.regularPrice == null &&
      prices._max.salePrice == null
    ) {
      prices = await prisma.product.aggregate({
        where: { active: true },
        _max: { regularPrice: true, salePrice: true },
      });
    }

    return {
      min: 0,
      max: Math.ceil(Math.max(
        Number(prices._max.regularPrice || 0),
        Number(prices._max.salePrice || 0)
      )),
    };
  },
  ['public-price-bounds'],
  { tags: ['products', 'categories'], revalidate: 300 }
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
  async function getPublicCategoryPage(slug, page = 1, perPage = 12, subcategorySlug = '') {
    const [category, activeCategories] = await Promise.all([
      prisma.category.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          slug: true,
          parentId: true,
          description: true,
          image: true,
          active: true,
          seo: true,
        },
      }),
      prisma.category.findMany({
        where: { active: true },
        select: { id: true, name: true, slug: true, parentId: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    if (!category?.active) return null;

    const categoryTree = activeCategories;
    const directChildren = activeCategories.filter(item => item.parentId === category.id);
    let selectedRootId = category.id;

    if (subcategorySlug) {
      const selectedCategory = directChildren.find(item => item.slug === subcategorySlug);
      if (!selectedCategory) return null;
      selectedRootId = selectedCategory.id;
    }

    const productCategoryIds = getCategorySubtreeIds(categoryTree, selectedRootId);
    const productWhere = { active: true, categoryId: { in: productCategoryIds } };
    const pageNumber = Math.max(1, Number(page) || 1);
    const [productCount, products] = await Promise.all([
      prisma.product.count({ where: productWhere }),
      prisma.product.findMany({
        where: productWhere,
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNumber - 1) * perPage,
        take: perPage,
      }),
    ]);

    return {
      ...category,
      _count: { products: productCount },
      products,
      subcategories: directChildren,
      selectedSubcategory: subcategorySlug || null,
    };
  },
  ['public-category-page'],
  { tags: ['categories', 'products', 'seo'], revalidate: 60 }
);
