
import { prisma } from './prisma';


/* =====================================================
   GET ALL PRODUCTS
===================================================== */

export async function getProducts() {

  try {

    const products =
      await prisma.product.findMany({

        where: {
          active: true,
        },

        include: {

          /* =================================================
             CATEGORY
          ================================================= */

          category: true,

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

              /*
               * We don't actually need approved here because
               * the Prisma where condition already filters it.
               *
               * But keeping it available makes normalizeProduct
               * work correctly in every situation.
               */
              approved: true,

            },

          },


          /* =================================================
             VARIANTS
          ================================================= */

          variants: true,

          comboItems: {
            include: {
              includedProduct: {
                include: { images: { orderBy: { sortOrder: 'asc' } } },
              },
            },
          },

        },


        orderBy: {
          createdAt: 'desc',
        },

      });


    const seoRows = await prisma.productSEO.findMany({ where: { productId: { in: products.map(product => product.id) } } });
    const seoByProduct = new Map(seoRows.map(row => [row.productId, row]));
    return products.map(product => normalizeProduct({ ...product, seo: seoByProduct.get(product.id) || null }));


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

          category: true,

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

          variants: true,

          comboItems: {
            include: {
              includedProduct: {
                include: { images: { orderBy: { sortOrder: 'asc' } } },
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


    if (!product) return null;
    const seo = await prisma.productSEO.findUnique({ where: { productId: product.id } });
    return normalizeProduct({ ...product, seo });


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


  /* ===================================================
     APPROVED REVIEWS
  =================================================== */

  const approvedReviews =
    Array.isArray(product.reviews)
      ? product.reviews.filter(
          (review) =>
            review.approved === true
        )
      : [];


  /* ===================================================
     REVIEW COUNT
  =================================================== */

  const reviewCount =
    approvedReviews.length;


  /* ===================================================
     TOTAL RATING
  =================================================== */

  const totalRating =
    approvedReviews.reduce(
      (total, review) => {

        return (
          total +
          Number(
            review.rating || 0
          )
        );

      },
      0
    );


  /* ===================================================
     AVERAGE RATING
  =================================================== */

  const rating =
    reviewCount > 0
      ? Number(
          (
            totalRating /
            reviewCount
          ).toFixed(1)
        )
      : 0;


  /* ===================================================
     NORMALIZED PRODUCT
  =================================================== */

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

function serializeProductData(value) {
  if (value === null || value === undefined) {
    return value;
  }

  if (
    typeof value.toNumber === 'function' &&
    typeof value.toString === 'function'
  ) {
    return Number(value);
  }

  if (Array.isArray(value)) {
    return value.map(serializeProductData);
  }

  if (typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        serializeProductData(nestedValue),
      ])
    );
  }

  return value;
}

