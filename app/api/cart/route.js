import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

function normalizeAttributeSelectionKey(ids = []) {
  return [...new Set((Array.isArray(ids) ? ids : []).filter(Boolean))]
    .sort()
    .join(',');
}

function serializeCart(items = []) {
  return (items || []).map((item) => ({
    id: item.id,
    productId: item.productId,
    variantId: item.variantId || null,
    attributeValueIds: Array.isArray(item.attributeValueIds) ? item.attributeValueIds : [],
    attributeSelectionKey: item.attributeSelectionKey || normalizeAttributeSelectionKey(Array.isArray(item.attributeValueIds) ? item.attributeValueIds : []),
    quantity: item.quantity,
    product: item.product,
    variant: item.variant,
  }));
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ items: [] }, { status: 200 });
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
              },
            },
          },
          variant: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: cart?.id || null,
    items: serializeCart(cart?.items || []),
  }, { status: 200 });
}

export async function POST(request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Please sign in before adding to cart.' }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const incomingItems = Array.isArray(body.items) ? body.items : body && body.productId ? [body] : [];

    if (!incomingItems.length) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const cart = await prisma.cart.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    await prisma.$transaction(async (tx) => {
      for (const item of incomingItems) {
        if (!item?.productId) continue;

        const productId = String(item.productId);
        const variantId = item.variantId ? String(item.variantId) : null;
        const quantity = Number(item.quantity || 1);

        if (!Number.isFinite(quantity) || quantity <= 0) continue;

        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) continue;

        const attributeValueIds = Array.isArray(item.attributeValueIds) ? item.attributeValueIds : [];
        const attributeSelectionKey = normalizeAttributeSelectionKey(attributeValueIds);

        const existingItem = await tx.cartItem.findFirst({
          where: {
            cartId: cart.id,
            productId,
            variantId,
            attributeSelectionKey,
          },
        });

        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: {
              quantity: { increment: quantity },
              attributeValueIds,
            },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: cart.id,
              productId,
              variantId,
              attributeSelectionKey,
              quantity,
              attributeValueIds,
            },
          });
        }
      }
    });

    const refreshedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } }, variant: true } } },
    });

    return NextResponse.json({
      id: refreshedCart?.id || cart.id,
      items: serializeCart(refreshedCart?.items || []),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to update cart.' }, { status: 400 });
  }
}

export async function PATCH(request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Please sign in before updating cart.' }, { status: 401 });
  }

  try {
    const payload = await request.json().catch(() => ({}));
    const productId = payload?.productId ? String(payload.productId) : null;
    const variantId = payload?.variantId ? String(payload.variantId) : null;
    const quantity = Number(payload?.quantity || 0);

    if (!productId) {
      return NextResponse.json({ error: 'Product not found in cart.' }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    const attributeValueIds = Array.isArray(payload.attributeValueIds) ? payload.attributeValueIds : [];
    const attributeSelectionKey = normalizeAttributeSelectionKey(attributeValueIds);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          cartId: cart.id,
          productId,
          variantId,
          attributeSelectionKey,
        },
      });
    } else {
      await prisma.cartItem.updateMany({
        where: {
          cartId: cart.id,
          productId,
          variantId,
          attributeSelectionKey,
        },
        data: { quantity },
      });
    }

    const refreshedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } }, variant: true } } },
    });

    return NextResponse.json({
      id: refreshedCart?.id || cart.id,
      items: serializeCart(refreshedCart?.items || []),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to update cart.' }, { status: 400 });
  }
}

export async function DELETE(request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Please sign in before updating cart.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const variantId = searchParams.get('variantId') || null;
    const attributeSelectionKey = searchParams.get('attributeSelectionKey') || '';

    const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    if (!productId) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.delete({ where: { id: cart.id } });
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId,
        variantId,
        attributeSelectionKey,
      },
    });

    const refreshedCart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } }, variant: true } } },
    });

    return NextResponse.json({
      id: refreshedCart?.id || cart.id,
      items: serializeCart(refreshedCart?.items || []),
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unable to remove cart item.' }, { status: 400 });
  }
}
