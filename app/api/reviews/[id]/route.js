import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

/*
|--------------------------------------------------------------------------
| UPDATE REVIEW
|--------------------------------------------------------------------------
| Mainly used by admin for approve / reject.
|
| PATCH /api/reviews/:id
|
| Body:
| {
|   "approved": true
| }
|--------------------------------------------------------------------------
*/

export async function PATCH(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const approved = Boolean(body.approved);

    const review = await prisma.review.update({
      where: {
        id,
      },
      data: {
        approved,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      review,
      message: approved
        ? 'Review approved successfully.'
        : 'Review rejected successfully.',
    });
  } catch (error) {
    console.error('UPDATE REVIEW ERROR:', error);

    return NextResponse.json(
      {
        error: 'Unable to update review.',
      },
      { status: 400 }
    );
  }
}


/*
|--------------------------------------------------------------------------
| DELETE REVIEW
|--------------------------------------------------------------------------
| Admin can permanently delete a review.
|
| DELETE /api/reviews/:id
|--------------------------------------------------------------------------
*/

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required.' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await prisma.review.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE REVIEW ERROR:', error);

    return NextResponse.json(
      {
        error: 'Unable to delete review.',
      },
      { status: 400 }
    );
  }
}