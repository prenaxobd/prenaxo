import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizePhone(value = '') {
  return String(value || '')
    .replace(/\D/g, '')
    .trim();
}

function normalizeOrderNumber(value = '') {
  return String(value || '')
    .trim()
    .replace(/^#+/, '')
    .replace(/^kb[-\s]*/i, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();
}

function getOrderVariants(rawValue = '') {
  const value = String(rawValue || '').trim();
  if (!value) return [];

  const digits = value.replace(/\D/g, '');
  const cleaned = normalizeOrderNumber(value);

  return Array.from(
    new Set([
      value,
      value.replace(/^kb[-\s]*/i, ''),
      cleaned,
      digits,
      `KB-${digits}`,
      `kb-${digits}`,
    ].filter(Boolean))
  );
}

function getPhoneVariants(rawValue = '') {
  const digits = normalizePhone(rawValue);
  if (!digits) return [];

  return Array.from(
    new Set([
      digits,
      digits.replace(/^880/, ''),
      digits.replace(/^0/, ''),
      digits.replace(/^0/, '880'),
      digits.replace(/^880/, '0'),
      `+${digits}`,
      `880${digits.replace(/^0/, '')}`,
    ].filter(Boolean))
  );
}

export async function GET(request) {
  try {
    const params = new URL(request.url).searchParams;
    const orderNumberInput = (params.get('orderNumber') || '').trim();
    const phoneInput = (params.get('phone') || '').trim();

    if (!orderNumberInput || !phoneInput) {
      return NextResponse.json(
        { success: false, message: 'Please enter your order number and phone number.' },
        { status: 400 }
      );
    }

    const orderVariants = getOrderVariants(orderNumberInput);
    const phoneVariants = getPhoneVariants(phoneInput);

    const candidateOrders = await prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { in: orderVariants } },
          ...orderVariants.map((variant) => ({ orderNumber: { contains: variant } })),
          ...phoneVariants.map((variant) => ({ customerPhone: { contains: variant } })),
        ],
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  select: {
                    id: true,
                    url: true,
                    alt: true,
                    sortOrder: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const matchedOrder = candidateOrders.find((order) => {
      const candidateOrderVariants = getOrderVariants(order.orderNumber || '');
      const candidatePhoneVariants = getPhoneVariants(order.customerPhone || '');

      const orderMatches = orderVariants.some((variant) => {
        const normalizedVariant = normalizeOrderNumber(variant);
        return candidateOrderVariants.some((candidate) => {
          const normalizedCandidate = normalizeOrderNumber(candidate);
          return (
            candidate.toLowerCase() === variant.toLowerCase() ||
            candidate.toLowerCase().includes(variant.toLowerCase()) ||
            normalizedCandidate === normalizedVariant ||
            normalizedCandidate.includes(normalizedVariant) ||
            normalizedVariant.includes(normalizedCandidate)
          );
        });
      });

      const phoneMatches = phoneVariants.some((variant) =>
        candidatePhoneVariants.some((candidate) => {
          const normalizedVariant = normalizePhone(variant);
          const normalizedCandidate = normalizePhone(candidate);
          return (
            normalizedCandidate === normalizedVariant ||
            normalizedCandidate.includes(normalizedVariant) ||
            normalizedVariant.includes(normalizedCandidate)
          );
        })
      );

      return orderMatches && phoneMatches;
    });

    if (!matchedOrder) {
      return NextResponse.json(
        { success: false, message: 'No order found with this order number and phone number.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        id: matchedOrder.id,
        orderNumber: matchedOrder.orderNumber,
        customerName: matchedOrder.customerName,
        customerPhone: matchedOrder.customerPhone,
        customerEmail: matchedOrder.customerEmail,
        status: matchedOrder.status,
        paymentStatus: matchedOrder.paymentStatus,
        paymentMethod: matchedOrder.paymentMethod,
        subtotal: Number(matchedOrder.subtotal),
        shippingCharge: Number(matchedOrder.shippingCharge),
        discount: Number(matchedOrder.discount),
        total: Number(matchedOrder.total),
        shippingAddress: matchedOrder.shippingAddress,
        createdAt: matchedOrder.createdAt.toISOString(),
        items: matchedOrder.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName || item.product?.name || 'Product',
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          subtotal: Number(item.unitPrice) * item.quantity,
          image: item.product?.images?.[0]?.url ?? null,
          images: item.product?.images ?? [],
        })),
      },
    });
  } catch (error) {
    console.error('TRACK ORDER ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Unable to track your order right now. Please try again.',
      },
      { status: 500 }
    );
  }
}
