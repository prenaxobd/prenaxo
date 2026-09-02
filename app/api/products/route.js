import { NextResponse } from 'next/server';

import { getProducts } from '@/lib/products';
import { prisma } from '@/lib/prisma';


/*
|--------------------------------------------------------------------------
| GET PRODUCTS
|--------------------------------------------------------------------------
|
| Product data + approved review rating
|
| Only APPROVED reviews are included.
|
| Example:
|
| 5 star approved
| 4 star approved
| 2 star pending
|
| Result:
|
| rating = 4.5
| reviewCount = 2
|
|--------------------------------------------------------------------------
*/

export async function GET() {

  try {

    /*
    |--------------------------------------------------------------------------
    | LOAD PRODUCTS
    |--------------------------------------------------------------------------
    */

    const products =
      await getProducts();


    /*
    |--------------------------------------------------------------------------
    | LOAD APPROVED REVIEWS
    |--------------------------------------------------------------------------
    |
    | We calculate:
    |
    | _avg.rating  → average approved rating
    | _count.rating → approved review count
    |
    */

    const reviewStats =
      await prisma.review.groupBy({
        by: ['productId'],

        where: {
          approved: true,
        },

        _avg: {
          rating: true,
        },

        _count: {
          rating: true,
        },
      });


    /*
    |--------------------------------------------------------------------------
    | CREATE QUICK LOOKUP
    |--------------------------------------------------------------------------
    */

    const statsMap =
      new Map(
        reviewStats.map((item) => [
          String(item.productId),
          {
            rating:
              Number(
                item._avg.rating || 0
              ),

            reviewCount:
              Number(
                item._count.rating || 0
              ),
          },
        ])
      );


    /*
    |--------------------------------------------------------------------------
    | MERGE RATING WITH PRODUCTS
    |--------------------------------------------------------------------------
    */

    const updatedProducts =
      products.map((product) => {

        const stats =
          statsMap.get(
            String(product.id)
          );


        /*
        |--------------------------------------------------------------------------
        | NO APPROVED REVIEW
        |--------------------------------------------------------------------------
        */

        if (!stats) {

          return {
            ...product,

            rating: 0,

            reviewCount: 0,
          };

        }


        /*
        |--------------------------------------------------------------------------
        | APPROVED REVIEW EXISTS
        |--------------------------------------------------------------------------
        */

        return {
          ...product,

          rating:
            Number(
              stats.rating.toFixed(1)
            ),

          reviewCount:
            stats.reviewCount,
        };

      });


    /*
    |--------------------------------------------------------------------------
    | NO CACHE
    |--------------------------------------------------------------------------
    |
    | Important after admin approves a review.
    |
    */

    return NextResponse.json(
      updatedProducts,
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate',
        },
      }
    );


  } catch (error) {

    console.error(
      'GET PRODUCTS ERROR:',
      error
    );


    return NextResponse.json(
      {
        error:
          'Unable to load products',
      },
      {
        status: 500,
      }
    );

  }

}

