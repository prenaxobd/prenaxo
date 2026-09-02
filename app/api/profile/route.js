import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : '';

    const phone =
      typeof body.phone === 'string'
        ? body.phone.trim()
        : '';

    const image =
      typeof body.image === 'string'
        ? body.image.trim()
        : '';

    if (!name) {
      return NextResponse.json(
        { error: 'Full name is required.' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        name,
        phone: phone || null,
        image: image || null,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });

  } catch (error) {

    console.error(
      'PROFILE_UPDATE_ERROR:',
      error
    );

    return NextResponse.json(
      {
        error: 'Unable to update profile.',
      },
      {
        status: 500,
      }
    );
  }
}