import { prisma } from '@/lib/prisma';
import {
  requirePermission,
  jsonError,
} from '@/lib/admin';

const validStatuses = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const validPaymentStatuses = [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
];

export async function GET(request) {
  try {
    await requirePermission('orders.view');

    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const q = searchParams.get('q');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where = {
      ...(status && validStatuses.includes(status)
        ? { status }
        : {}),

      ...(paymentStatus &&
      validPaymentStatuses.includes(paymentStatus)
        ? { paymentStatus }
        : {}),

      ...(q
        ? {
            OR: [
              {
                orderNumber: {
                  contains: q,
                },
              },
              {
                customerName: {
                  contains: q,
                },
              },
              {
                customerEmail: {
                  contains: q,
                },
              },
              {
                customerPhone: {
                  contains: q,
                },
              },
            ],
          }
        : {}),

      ...(from || to
        ? {
            createdAt: {
              ...(from
                ? {
                    gte: new Date(`${from}T00:00:00`),
                  }
                : {}),

              ...(to
                ? {
                    lte: new Date(`${to}T23:59:59.999`),
                  }
                : {}),
            },
          }
        : {}),
    };

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },

        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    const serializedOrders = orders.map((order) => ({
      ...order,

      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCharge: Number(order.shippingCharge),
      total: Number(order.total),

      createdAt: order.createdAt.toISOString(),

      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    }));

    return Response.json(serializedOrders);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    await requirePermission('orders.update_status');

    const body = await request.json();

    const {
      id,
      status,
      paymentStatus,
    } = body;

    // -----------------------------------------
    // Validate Order ID
    // -----------------------------------------

    if (!id) {
      return Response.json(
        {
          error: 'Order ID is required.',
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Validate Order Status
    // -----------------------------------------

    if (
      status &&
      !validStatuses.includes(status)
    ) {
      return Response.json(
        {
          error: 'Invalid order status.',
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Validate Payment Status
    // -----------------------------------------

    if (
      paymentStatus &&
      !validPaymentStatuses.includes(paymentStatus)
    ) {
      return Response.json(
        {
          error: 'Invalid payment status.',
        },
        {
          status: 400,
        }
      );
    }

    // -----------------------------------------
    // Update Order
    // -----------------------------------------

    const order = await prisma.order.update({
      where: {
        id,
      },

      data: {
        ...(status
          ? {
              status,
            }
          : {}),

        ...(paymentStatus
          ? {
              paymentStatus,
            }
          : {}),
      },

      include: {
        items: true,
      },
    });

    // -----------------------------------------
    // Return Serialized Order
    // -----------------------------------------

    return Response.json({
      ...order,

      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingCharge: Number(order.shippingCharge),
      total: Number(order.total),

      createdAt: order.createdAt.toISOString(),

      items: order.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice),
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}