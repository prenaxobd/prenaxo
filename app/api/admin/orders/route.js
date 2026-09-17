import { NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  getDeliveryConfig,
  calculateDelivery,
} from '@/lib/delivery';

const schema = z.object({
  customerName: z.string().trim().min(2),
  customerPhone: z.string().trim().min(8),

  shippingAddress: z.record(z.string(), z.string()),

  paymentMethod: z
    .string()
    .trim()
    .min(1)
    .transform((value) => value.toUpperCase()),

  paymentTransactionId: z
    .string()
    .trim()
    .max(150)
    .optional()
    .or(z.literal('')),

  orderNote: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .or(z.literal('')),

  couponCode: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
});

export async function POST(request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      {
        error: 'Please sign in before checkout.',
      },
      {
        status: 401,
      }
    );
  }

  try {
    const data = schema.parse(await request.json());

    const {
      threshold,
      zones,
    } = await getDeliveryConfig();

    const order = await prisma.$transaction(async (tx) => {
      /*
       * ---------------------------------------------------------
       * Validate payment method
       * ---------------------------------------------------------
       */

      const paymentMethod = await tx.paymentMethod.findUnique({
        where: {
          code: data.paymentMethod,
        },
      });

      if (!paymentMethod || !paymentMethod.active) {
        throw new Error(
          'The selected payment method is not available.'
        );
      }

      /*
       * ---------------------------------------------------------
       * Validate transaction ID
       * ---------------------------------------------------------
       */

      const requiresTransactionId = ['BKASH', 'NAGAD'].includes(
        paymentMethod.code
      );

      const paymentTransactionId =
        data.paymentTransactionId?.trim() || null;

      if (requiresTransactionId && !paymentTransactionId) {
        throw new Error(
          `Please enter your ${paymentMethod.name} transaction ID.`
        );
      }

      /*
       * ---------------------------------------------------------
       * Load cart
       * ---------------------------------------------------------
       */

      const cart = await tx.cart.findUnique({
        where: {
          userId: user.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!cart?.items.length) {
        throw new Error('Your cart is empty.');
      }

      /*
       * ---------------------------------------------------------
       * Calculate subtotal
       * ---------------------------------------------------------
       */

      let subtotal = 0;

      for (const item of cart.items) {
        if (item.product.stock < item.quantity) {
          throw new Error(
            `${item.product.name} is out of stock.`
          );
        }

        const price = Number(
          item.product.salePrice ||
            item.product.regularPrice
        );

        subtotal += price * item.quantity;
      }

      /*
       * ---------------------------------------------------------
       * Coupon
       * ---------------------------------------------------------
       */

      let discount = 0;

      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: {
            code: data.couponCode.toUpperCase(),
          },
        });

        if (
          coupon?.active &&
          (!coupon.expiresAt ||
            coupon.expiresAt > new Date()) &&
          subtotal >= Number(coupon.minimumOrder || 0)
        ) {
          discount =
            coupon.type === 'PERCENTAGE'
              ? Math.min(
                  (subtotal * Number(coupon.value)) / 100,
                  subtotal
                )
              : Math.min(
                  Number(coupon.value),
                  subtotal
                );
        }
      }

      /*
       * ---------------------------------------------------------
       * Delivery zone
       * ---------------------------------------------------------
       */

      const zone = zones.find(
        (item) =>
          item.division === data.shippingAddress.city &&
          item.district === data.shippingAddress.district
      );

      if (!zone) {
        throw new Error(
          'Please select a valid delivery area.'
        );
      }

      const {
        charge: shippingCharge,
      } = calculateDelivery(
        subtotal,
        zone,
        threshold
      );

      /*
       * ---------------------------------------------------------
       * Create order
       * ---------------------------------------------------------
       */

      const created = await tx.order.create({
        data: {
          orderNumber: `KB-${Date.now()}`,

          userId: user.id,

          customerName: data.customerName,

          // Email is no longer requested from checkout.
          // Existing signed-in user's email is stored automatically.
          customerEmail: user.email || null,

          customerPhone: data.customerPhone,

          shippingAddress: data.shippingAddress,

          subtotal,

          discount,

          shippingCharge,

          total:
            subtotal -
            discount +
            shippingCharge,

          paymentMethod: paymentMethod.code,

          paymentTransactionId,

          paymentStatus: 'PENDING',

          orderNote:
            data.orderNote?.trim() || null,

          items: {
            create: cart.items.map((item) => ({
              quantity: item.quantity,

              unitPrice:
                item.product.salePrice ||
                item.product.regularPrice,

              productName: item.product.name,

              productId: item.productId,
              attributeValueIds: item.attributeValueIds,
            })),
          },
        },
      });

      /*
       * ---------------------------------------------------------
       * Reduce stock
       * ---------------------------------------------------------
       */

      for (const item of cart.items) {
        const updated =
          await tx.product.updateMany({
            where: {
              id: item.productId,
              stock: {
                gte: item.quantity,
              },
            },

            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });

        if (updated.count !== 1) {
          throw new Error(
            'Stock changed; please try again.'
          );
        }
      }

      /*
       * ---------------------------------------------------------
       * Clear cart
       * ---------------------------------------------------------
       */

      await tx.cartItem.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return created;
    });

    return NextResponse.json(
      {
        orderNumber: order.orderNumber,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error('Order creation error:', error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Unable to create order.',
      },
      {
        status: 400,
      }
    );
  }
}