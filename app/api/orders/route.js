import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getDeliveryConfig, calculateDelivery } from '@/lib/delivery';

const schema = z.object({
  customerName: z.string().trim().min(2),
  customerEmail: z.string().trim().email().optional().or(z.literal('')).optional(),
  customerPhone: z.string().trim().min(8),
  shippingAddress: z.record(z.string(), z.string()),
  paymentMethod: z.enum(['COD', 'BANK', 'BKASH', 'NAGAD']),
  couponCode: z.string().optional(),
  paymentTransactionId: z.string().optional(),
  orderNote: z.string().optional(),
});

export async function POST(request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Please sign in before checkout.' },
      { status: 401 }
    );
  }

  try {
    const data = schema.parse(await request.json());
    const { threshold, zones } = await getDeliveryConfig();
    const customerEmail = (data.customerEmail || '').trim() || user.email || null;

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { product: true, variant: true } } },
    });

    if (!cart?.items.length) {
      throw new Error('Your cart is empty.');
    }

    let subtotal = 0;

    for (const item of cart.items) {
      const stock = item.variant?.stock ?? item.product.stock;
      if (stock < item.quantity) {
        throw new Error(`${item.product.name} is out of stock.`);
      }

      subtotal += Number(item.variant?.price ?? item.product.salePrice ?? item.product.regularPrice) * item.quantity;
    }

    let discount = 0;

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });

      if (
        coupon?.active &&
        (!coupon.expiresAt || coupon.expiresAt > new Date()) &&
        subtotal >= Number(coupon.minimumOrder || 0)
      ) {
        discount = coupon.type === 'PERCENTAGE'
          ? Math.min((subtotal * Number(coupon.value)) / 100, subtotal)
          : Math.min(Number(coupon.value), subtotal);
      }
    }

    const zone = zones.find(
      (item) =>
        item.division === data.shippingAddress.city &&
        item.district === data.shippingAddress.district
    );

    if (!zone) {
      throw new Error('Please select a valid delivery area.');
    }

    const { charge: shippingCharge } = calculateDelivery(subtotal, zone, threshold);
    const productQuantities = new Map();
    const variantQuantities = new Map();

    for (const item of cart.items) {
      productQuantities.set(item.productId, (productQuantities.get(item.productId) || 0) + item.quantity);
      if (item.variantId) {
        variantQuantities.set(item.variantId, (variantQuantities.get(item.variantId) || 0) + item.quantity);
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const variantUpdates = [...variantQuantities].map(([id, quantity]) => tx.productVariant.updateMany({
        where: { id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      }));
      const productUpdates = [...productQuantities].map(([id, quantity]) => tx.product.updateMany({
        where: { id, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      }));
      const [updatedVariants, updatedProducts] = await Promise.all([
        Promise.all(variantUpdates),
        Promise.all(productUpdates),
      ]);

      if (updatedVariants.some((result) => result.count === 0)) {
        throw new Error('A selected product option is out of stock.');
      }
      if (updatedProducts.some((result) => result.count === 0)) {
        throw new Error('A product in your cart is out of stock.');
      }

      const created = await tx.order.create({
        data: {
          orderNumber: `KB-${Date.now()}`,
          userId: user.id,
          customerName: data.customerName,
          customerEmail,
          customerPhone: data.customerPhone,
          shippingAddress: data.shippingAddress,
          subtotal,
          discount,
          shippingCharge,
          total: subtotal - discount + shippingCharge,
          paymentMethod: data.paymentMethod,
          paymentTransactionId: data.paymentTransactionId || null,
          orderNote: data.orderNote || null,
        },
      });

      await tx.orderItem.createMany({
        data: cart.items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.variant?.price ?? item.product.salePrice ?? item.product.regularPrice,
          productName: item.product.name,
          orderId: created.id,
          productId: item.productId,
          variantId: item.variantId,
          variantLabel: item.variant ? [item.variant.color, item.variant.size].filter(Boolean).join(' / ') || null : null,
          attributeValueIds: item.attributeValueIds,
        })),
      });

      await tx.cart.delete({
        where: { userId: user.id },
      });

      return created;
    }, { maxWait: 10000, timeout: 30000 });

    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Unable to place order.' },
      { status: 400 }
    );
  }
}
