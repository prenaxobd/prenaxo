import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

function serializeProduct(product) {
  return {
    ...product,
    regularPrice: Number(product.regularPrice),
    salePrice:
      product.salePrice === null
        ? null
        : Number(product.salePrice),
    reviews: product.reviews || [],
    orderItems: undefined,
  };
}

async function loadHomepageData() {
  const now = new Date();

  const baseInclude = {
    category: true,
    images: true,
    reviews: {
      where: { approved: true },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 3,
    },
  };

  const [banners, homeRightBanner, categories, products, reviews, brands, topSellingStats] =
    await Promise.all([
      prisma.banner
        .findMany({
          where: {
            active: true,
            AND: [
              {
                OR: [
                  { startAt: null },
                  { startAt: { lte: now } },
                ],
              },
              {
                OR: [
                  { endAt: null },
                  { endAt: { gte: now } },
                ],
              },
            ],
          },
          orderBy: {
            sortOrder: 'asc',
          },
        })
        .catch(() => []),

      prisma.homeRightBanner
        .findFirst({
          where: {
            isActive: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        })
        .catch(() => null),

      prisma.category
        .findMany({
          where: {
            active: true,
          },
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        })
        .catch(() => []),

      prisma.product
        .findMany({
          where: {
            active: true,
          },
          include: {
            ...baseInclude,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 48,
        })
        .catch(() => []),

      prisma.review
        .findMany({
          where: {
            approved: true,
          },
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
            product: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 8,
        })
        .catch(() => []),

      prisma.brand
        .findMany({
          where: {
            active: true,
          },
          orderBy: [
            {
              featured: 'desc',
            },
            {
              name: 'asc',
            },
          ],
          take: 6,
        })
        .catch(() => []),

      prisma.orderItem
        .groupBy({
          by: ['productId'],
          where: {
            order: {
              paymentStatus: 'PAID',
              status: { not: 'CANCELLED' },
            },
            product: { active: true },
          },
          _sum: { quantity: true },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 8,
        })
        .catch(() => []),
    ]);

  const topSellingIds = topSellingStats.map((item) => item.productId);
  const topSellingProducts = topSellingIds.length
    ? await prisma.product.findMany({
        where: { id: { in: topSellingIds }, active: true },
        include: baseInclude,
      }).catch(() => [])
    : [];
  const topSellingById = new Map(topSellingProducts.map((product) => [product.id, product]));

  const serialized = products.map(serializeProduct);

  const topSelling = topSellingIds
    .map((productId) => topSellingById.get(productId))
    .filter(Boolean)
    .map(serializeProduct);

  const featured = serialized
    .filter((product) => product.featured)
    .slice(0, 8);

  const deals = serialized
    .filter(
      (product) =>
        product.salePrice !== null &&
        product.salePrice < product.regularPrice
    )
    .sort(
      (a, b) =>
        1 -
        b.salePrice / b.regularPrice -
        (1 - a.salePrice / a.regularPrice)
    )
    .slice(0, 8);

  const categorySections = categories
    .map((category) => ({
      ...category,
      products: serialized
        .filter(
          (product) =>
            product.categoryId === category.id
        )
        .slice(0, 8),
    }))
    .filter(
      (section) => section.products.length
    );

  const sections = await prisma.homepageSection
    .findMany({
      where: {
        active: true,
      },
      include: {
        category: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    })
    .catch(() => []);

  return {
    banners,
    homeRightBanner,
    categories,
    featured,
    topSelling: topSelling.length
      ? topSelling
      : serialized.slice(0, 8),
    deals,
    newArrivals: serialized.slice(0, 8),
    categorySections,
    reviews,
    sections,
    brands,
    products: serialized,
  };
}

export const getHomepageData = unstable_cache(
  loadHomepageData,
  ['homepage-data'],
  {
    tags: ['homepage', 'products', 'categories', 'brands', 'seo'],
    revalidate: 60,
  }
);