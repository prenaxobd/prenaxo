import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonError } from '@/lib/admin';

export async function GET(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const order = await prisma.order.findUnique({ where: { id }, include: { user: { select: { id: true, name: true, email: true, phone: true } }, items: { include: { variant: true, product: { select: { id: true, name: true, sku: true, images: { orderBy: { sortOrder: 'asc' }, take: 1 }, attributeValues: { include: { attributeValue: { include: { attribute: true } } } } } } } } } });
    if (!order) return Response.json({ error: 'Order not found.' }, { status: 404 });
    return Response.json(order);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const { status, paymentStatus } = await request.json();
    const order = await prisma.order.update({ where: { id }, data: { ...(status ? { status } : {}), ...(paymentStatus ? { paymentStatus } : {}) } });
    return Response.json(order);
  } catch (error) {
    return jsonError(error);
  }
}
