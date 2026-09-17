import { prisma } from './prisma';


/* =====================================================
   GET ALL PRODUCTS
===================================================== */

export async function getProducts() {
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


/* =====================================================
   GET SINGLE PRODUCT
===================================================== */

export async function getProduct(slug) {
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
}


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