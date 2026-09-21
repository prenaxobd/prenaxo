import { prisma } from './prisma';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';


/* =====================================================
   GET ALL PRODUCTS
===================================================== */

async function loadProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
      },

      include: {
        /* =================================================
           CATEGORY
        ================================================= */

        category: true,

        /* =================================================
           BRAND
        ================================================= */

        brandRelation: true,

        /* =================================================
           PRODUCT IMAGES
        ================================================= */

        images: {
          orderBy: {
            sortOrder: 'asc',
          },
        },

        /* =================================================
           APPROVED REVIEWS
        ================================================= */

        reviews: {
          where: {
            approved: true,
          },

          select: {
            rating: true,
            approved: true,
          },
        },

        /* =================================================
           VARIANTS
        ================================================= */

        variants: true,

        /* =================================================
           COMBO ITEMS
        ================================================= */

        comboItems: {
          include: {
            includedProduct: {
              include: {
                images: {
                  orderBy: {
                    sortOrder: 'asc',
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });


    /* =====================================================
       PRODUCT SEO
    ===================================================== */

    const productIds = products.map(
      (product) => product.id
    );

    const seoRows =
      productIds.length > 0
        ? await prisma.productSEO.findMany({
            where: {
              productId: {
                in: productIds,
              },
            },
          })
        : [];

    const seoByProduct = new Map(
      seoRows.map((row) => [
        row.productId,
        row,
      ])
    );


    return products.map((product) =>
      normalizeProduct({
        ...product,
        seo:
          seoByProduct.get(product.id) ||
          null,
      })
    );

  } catch (error) {
    console.error(
      'getProducts error:',
      error
    );

    return [];
  }
}


export const getProducts = unstable_cache(
  loadProducts,
  ['products-list'],
  { tags: ['products', 'categories', 'brands', 'seo'], revalidate: 60 }
);

/* =====================================================
  GET SINGLE PRODUCT
===================================================== */

const getCachedProduct = unstable_cache(async function getProduct(slug) {
  try {
    const product =
      await prisma.product.findUnique({
        where: {
          slug,
        },

        include: {
          /* =================================================
             CATEGORY
          ================================================= */

          category: {
            include: {
              attributes: {
                include: {
                  attribute: {
                    include: { values: { where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } },
                  },
                },
              },
            },
          },

          /* =================================================
             BRAND RELATION
          ================================================= */

          brandRelation: true,

          /* =================================================
             IMAGES
          ================================================= */

          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },

          /* =================================================
             VARIANTS
          ================================================= */

          variants: {
            include: {
              attributeValues: {
                include: { attributeValue: { include: { attribute: true } } },
              },
            },
          },

          attributeValues: {
            include: {
              attributeValue: {
                include: { attribute: true },
              },
            },
          },

          /* =================================================
             COMBO ITEMS
          ================================================= */

          comboItems: {
            include: {
              includedProduct: {
                include: {
                  images: {
                    orderBy: {
                      sortOrder: 'asc',
                    },
                  },
                },
              },
            },
          },

          /* =================================================
             ALL REVIEWS
          ================================================= */

          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },

            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });


    if (!product) {
      return null;
    }


    /* =====================================================
       PRODUCT SEO
    ===================================================== */

    const seo =
      await prisma.productSEO.findUnique({
        where: {
          productId: product.id,
        },
      });


    return normalizeProduct({
      ...product,
      seo,
    });

  } catch (error) {
    console.error(
      'getProduct error:',
      error
    );

    return null;
  }
}, ['product-by-slug'], {
  tags: ['products', 'categories', 'brands', 'seo'],
  revalidate: 60,
});

export const getProduct = cache((slug) => getCachedProduct(slug));


/* =====================================================
   NORMALIZE PRODUCT
===================================================== */

function normalizeProduct(product) {

  /* =====================================================
     APPROVED REVIEWS
  ===================================================== */

  const approvedReviews =
    Array.isArray(product.reviews)
      ? product.reviews.filter(
          (review) =>
            review.approved === true
        )
      : [];


  /* =====================================================
     REVIEW COUNT
  ===================================================== */

  const reviewCount =
    approvedReviews.length;


  /* =====================================================
     TOTAL RATING
  ===================================================== */

  const totalRating =
    approvedReviews.reduce(
      (total, review) =>
        total +
        Number(
          review.rating || 0
        ),
      0
    );


  /* =====================================================
     AVERAGE RATING
  ===================================================== */

  const rating =
    reviewCount > 0
      ? Number(
          (
            totalRating /
            reviewCount
          ).toFixed(1)
        )
      : 0;


  /* =====================================================
     NORMALIZED PRODUCT
  ===================================================== */

  return serializeProductData({

    ...product,


    /* =================================================
       PRICE
    ================================================= */

    regularPrice:
      Number(
        product.regularPrice || 0
      ),


    salePrice:
      product.salePrice === null
        ? null
        : Number(
            product.salePrice
          ),


    costPrice:
      product.costPrice === null
        ? null
        : Number(
            product.costPrice
          ),


    /* =================================================
       RATING
    ================================================= */

    rating,


    /* =================================================
       REVIEW COUNT
    ================================================= */

    reviewCount,


    /* =================================================
       VARIANTS
    ================================================= */

    variants:
      product.variants?.map(
        (variant) => ({
          ...variant,

          price:
            variant.price === null
              ? null
              : Number(
                  variant.price
                ),
        })
      ) || [],


    /* =================================================
       REVIEWS
    ================================================= */

    reviews:
      product.reviews || [],
  });
}


/* =====================================================
   SERIALIZE PRISMA DATA
===================================================== */

function serializeProductData(value) {

  if (
    value === null ||
    value === undefined
  ) {
    return value;
  }


  if (
    typeof value.toNumber === 'function' &&
    typeof value.toString === 'function'
  ) {
    return Number(value);
  }


  if (Array.isArray(value)) {
    return value.map(
      serializeProductData
    );
  }


  if (
    typeof value === 'object' &&
    !(value instanceof Date)
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, nestedValue]) => [
          key,
          serializeProductData(
            nestedValue
          ),
        ]
      )
    );
  }


  return value;
}

async function loadRelatedProducts(productId, categoryId) {
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        id: { not: productId },
        ...(categoryId ? { categoryId } : {}),
      },
      include: {
        category: true,
        brandRelation: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: { where: { approved: true }, select: { rating: true, approved: true } },
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    return products.map(normalizeProduct);
  } catch (error) {
    console.error('getRelatedProducts error:', error);
    return [];
  }
}

async function loadShopProducts({
  category = 'all',
  brand = 'all',
  min = '',
  max = '',
  rating = 0,
  availability = 'all',
  sort = 'newest',
  page = 1,
  perPage = 16,
} = {}) {
  try {
    const priceFilter = {};
    if (min) priceFilter.gte = Number(min);
    if (max) priceFilter.lt = Number(max);

    const filters = [
      { active: true },
      ...(category !== 'all' ? [{ category: { is: { name: category } } }] : []),
      ...(brand !== 'all'
        ? [{ OR: [{ brand }, { brandRelation: { is: { name: brand } } }] }]
        : []),
      ...(availability === 'in-stock' ? [{ stock: { gt: 0 } }] : []),
      ...(availability === 'out-of-stock' ? [{ stock: { lte: 0 } }] : []),
      ...(Object.keys(priceFilter).length
        ? [{
            OR: [
              { salePrice: null, regularPrice: priceFilter },
              { salePrice: { not: null, ...priceFilter } },
            ],
          }]
        : []),
    ];

    const where = filters.length === 1 ? filters[0] : { AND: filters };

    const reviewStats = (rating || sort === 'best-sellers' || sort === 'top-rated')
      ? await prisma.review.groupBy({
          by: ['productId'],
          where: { approved: true },
          _avg: { rating: true },
          _count: { rating: true },
        })
      : [];

    const statsByProduct = new Map(
      reviewStats.map((item) => [
        item.productId,
        {
          rating: Number(item._avg.rating || 0),
          reviewCount: item._count.rating,
        },
      ])
    );

    const ratingProductIds = rating
      ? reviewStats
          .filter((item) => Number(item._avg.rating || 0) >= Number(rating))
          .map((item) => item.productId)
      : null;

    if (ratingProductIds) {
      where.id = { in: ratingProductIds };
    }

    const total = await prisma.product.count({ where });
    const orderBy = sort === 'price-low'
      ? [{ salePrice: 'asc' }, { regularPrice: 'asc' }, { createdAt: 'desc' }]
      : sort === 'price-high'
        ? [{ salePrice: 'desc' }, { regularPrice: 'desc' }, { createdAt: 'desc' }]
        : sort === 'featured'
          ? [{ featured: 'desc' }, { createdAt: 'desc' }]
          : { createdAt: 'desc' };

    const metadataSort = sort === 'best-sellers' || sort === 'top-rated';
    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(perPage) || 16);

    let pageIds = null;
    if (metadataSort) {
      const candidates = await prisma.product.findMany({
        where,
        select: { id: true, featured: true, createdAt: true },
      });

      pageIds = candidates
        .sort((first, second) => {
          const firstStats = statsByProduct.get(first.id) || { rating: 0, reviewCount: 0 };
          const secondStats = statsByProduct.get(second.id) || { rating: 0, reviewCount: 0 };
          if (sort === 'top-rated') {
            return secondStats.rating - firstStats.rating ||
              secondStats.reviewCount - firstStats.reviewCount ||
              second.createdAt - first.createdAt;
          }
          return (
            (secondStats.reviewCount * 12 + secondStats.rating * 10 + (second.featured ? 30 : 0)) -
            (firstStats.reviewCount * 12 + firstStats.rating * 10 + (first.featured ? 30 : 0))
          ) || secondStats.rating - firstStats.rating || second.createdAt - first.createdAt;
        })
        .slice((pageNumber - 1) * pageSize, pageNumber * pageSize)
        .map((product) => product.id);
    }

    const products = await prisma.product.findMany({
      where: pageIds ? { id: { in: pageIds } } : where,
      include: {
        category: true,
        brandRelation: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        reviews: { where: { approved: true }, select: { rating: true, approved: true } },
      },
      ...(pageIds ? {} : { orderBy, skip: (pageNumber - 1) * pageSize, take: pageSize }),
    });

    if (pageIds) {
      const productsById = new Map(products.map((product) => [product.id, product]));
      products.sort((first, second) => pageIds.indexOf(first.id) - pageIds.indexOf(second.id));
      products.splice(0, products.length, ...pageIds.map((id) => productsById.get(id)).filter(Boolean));
    }

    return {
      products: products.map((product) => normalizeProduct({
        ...product,
        ...(statsByProduct.has(product.id) ? statsByProduct.get(product.id) : {}),
      })),
      total,
      page: pageNumber,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  } catch (error) {
    console.error('getShopProducts error:', error);
    return { products: [], total: 0, page: 1, totalPages: 1 };
  }
}

export const getRelatedProducts = unstable_cache(
  loadRelatedProducts,
  ['related-products'],
  { tags: ['products', 'categories', 'brands'], revalidate: 60 }
);

export const getShopProducts = unstable_cache(
  loadShopProducts,
  ['shop-products'],
  { tags: ['products', 'categories', 'seo'], revalidate: 60 }
);