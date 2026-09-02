import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request) {

  try {

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.redirect(
        new URL('/login', request.url)
      );
    }

    const formData = await request.formData();

    const address = String(
      formData.get('address') || ''
    ).trim();

    const area = String(
      formData.get('area') || ''
    ).trim();

    const city = String(
      formData.get('city') || ''
    ).trim();

    const district = String(
      formData.get('district') || ''
    ).trim();

    if (!address || !city) {
      return NextResponse.json(
        {
          error: 'Address and city are required',
        },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        address: {
          address,
          area,
          city,
          district,
        },
      },
    });

    return NextResponse.redirect(
      new URL('/account/addresses?saved=1', request.url)
    );

  } catch (error) {

    console.error('ADDRESS ERROR:', error);

    return NextResponse.json(
      {
        error: 'Failed to save address',
      },
      { status: 500 }
    );
  }
}