import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import OrderDetailManager from '@/components/admin/OrderDetailManager';

export default async function AdminOrderDetails({ params }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: { include: { product: { select: { id: true, name: true, sku: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } } },
    },
  });
  if (!order) notFound();
  return <OrderDetailManager initialOrder={{ ...order, subtotal: Number(order.subtotal), discount: Number(order.discount), shippingCharge: Number(order.shippingCharge), total: Number(order.total), items: order.items.map(item => ({ ...item, unitPrice: Number(item.unitPrice) })), createdAt: order.createdAt.toISOString() }} />;
}
