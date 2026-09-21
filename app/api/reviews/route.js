
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';


/* =====================================================
   GET REVIEWS
===================================================== */

export async function GET(request) {
  try {
    const { searchParams } =
      new URL(request.url);

    const productId =
      searchParams.get('productId');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 20));

    if (!productId) {
      return NextResponse.json(
        {
          error: 'Product ID is required.',
        },
        {
          status: 400,
        }
      );
    }

    const where = { productId, approved: true };
    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });

  } catch (error) {
    console.error(
      'GET reviews error:',
      error
    );

    return NextResponse.json(
      {
        error: 'Unable to load reviews.',
      },
      {
        status: 500,
      }
    );
  }
}


/* =====================================================
   CREATE REVIEW
===================================================== */

export async function POST(request) {
  const user = await getCurrentUser();

  /* Login required */

  if (!user) {
    return NextResponse.json(
      {
        error:
          'Please login to submit a review.',
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const productId =
      String(body.productId || '').trim();

    const rating =
      Number(body.rating);

    const comment =
      String(body.comment || '').trim();


    /* ===============================================
       VALIDATION
    =============================================== */

    if (!productId) {
      return NextResponse.json(
        {
          error: 'Product is required.',
        },
        {
          status: 400,
        }
      );
    }


    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          error:
            'Rating must be between 1 and 5.',
        },
        {
          status: 400,
        }
      );
    }


    if (comment.length > 2000) {
      return NextResponse.json(
        {
          error:
            'Review is too long.',
        },
        {
          status: 400,
        }
      );
    }


    /* ===============================================
       CHECK PRODUCT
    =============================================== */

    const product =
      await prisma.product.findUnique({
        where: {
          id: productId,
        },

        select: {
          id: true,
          active: true,
        },
      });

    if (!product || !product.active) {
      return NextResponse.json(
        {
          error: 'Product not found.',
        },
        {
          status: 404,
        }
      );
    }


    /* ===============================================
       PREVENT DUPLICATE REVIEW
    =============================================== */

    const existingReview =
      await prisma.review.findFirst({
        where: {
          userId: user.id,
          productId,
        },
      });

    if (existingReview) {
      return NextResponse.json(
        {
          error:
            'You have already reviewed this product.',
        },
        {
          status: 409,
        }
      );
    }


    /* ===============================================
       CHECK VERIFIED PURCHASE

       User must have a DELIVERED order
       containing this product.
    =============================================== */

    const purchasedOrderItem =
      await prisma.orderItem.findFirst({
        where: {
          productId,

          order: {
            userId: user.id,
            status: 'DELIVERED',
          },
        },

        select: {
          id: true,
        },
      });


    const verifiedPurchase =
      Boolean(purchasedOrderItem);


    /* ===============================================
       CREATE REVIEW

       approved = false
       verifiedPurchase = automatically calculated

       Admin must approve the review.
    =============================================== */

    const review =
      await prisma.review.create({
        data: {
          rating,

          comment:
            comment || null,

          approved: false,

          verifiedPurchase,

          user: {
            connect: {
              id: user.id,
            },
          },

          product: {
            connect: {
              id: productId,
            },
          },
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });


    return NextResponse.json(
      {
        ok: true,

        message:
          verifiedPurchase
            ? 'Review submitted successfully. Your verified purchase will be shown after approval.'
            : 'Review submitted successfully. It will appear after approval.',

        review,
      },
      {
        status: 201,
      }
    );

  } catch (error) {
    console.error(
      'POST review error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to submit review.',
      },
      {
        status: 500,
      }
    );
  }
}

