import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const wishlistItemSchema = z.object({
  productId: z.string().trim().min(1),
});

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ items: [] });
  }

  const wishlist = await prisma.wishlist.findUnique({
    where: { userId: user.id },
    select: {
      items: {
        select: { id: true, productId: true },
      },
    },
  });

  return NextResponse.json({ items: wishlist?.items || [] });
}

export async function POST(request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Please sign in to update your wishlist.' }, { status: 401 });
  }

  try {
    const { productId } = wishlistItemSchema.parse(await request.json());
    const [product, wishlist] = await Promise.all([
      prisma.product.findFirst({
        where: { id: productId, active: true },
        select: { id: true },
      }),
      prisma.wishlist.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
        select: { id: true },
      }),
    ]);

    if (!product) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
      select: { id: true },
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
      return NextResponse.json({ saved: false });
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error?.name === 'ZodError') {
      return NextResponse.json({ error: error.issues.map(issue => issue.message).join(' ') }, { status: 400 });
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Wishlist was updated in another request. Please refresh and try again.' }, { status: 409 });
    }

    console.error('WISHLIST UPDATE ERROR:', error);
    return NextResponse.json({ error: 'Unable to update wishlist.' }, { status: 500 });
  }
}
