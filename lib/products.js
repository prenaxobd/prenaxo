
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

        },


        orderBy: {
          createdAt: 'desc',
        },

      });


    return products.map(
      normalizeProduct
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


    return product
      ? normalizeProduct(product)
      : null;


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

  return {

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

  };

}

