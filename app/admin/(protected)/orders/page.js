import { prisma } from '@/lib/prisma';
import OrderManager from '@/components/admin/OrderManager';
import { requirePermission } from '@/lib/admin';
import { redirect } from 'next/navigation';

function serializeOrder(order) {
  return {
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
  };
}

export default async function OrdersPage() {
  try { await requirePermission('orders.view'); } catch { redirect('/admin'); }
  const [
    orders,
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    revenueResult,
  ] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

    prisma.order.count(),

    prisma.order.count({
      where: {
        status: 'PENDING',
      },
    }),

    prisma.order.count({
      where: {
        status: 'PROCESSING',
      },
    }),

    prisma.order.count({
      where: {
        status: 'DELIVERED',
      },
    }),

    prisma.order.count({
      where: {
        status: 'CANCELLED',
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  const stats = {
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    cancelledOrders,
    totalRevenue: Number(revenueResult._sum.total || 0),
  };

  return (
    <OrderManager
      initialOrders={orders.map(serializeOrder)}
      initialStats={stats}
    />
  );
}