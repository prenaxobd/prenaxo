import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PENDING_VERIFICATION', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  paymentNote: z.string().trim().min(5).max(500).optional(),
});

export async function GET(request, { params }) {
  try {
    await requirePermission('orders.view');
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
    const admin = await requirePermission('orders.update_status');
    const { id } = await params;
    const { status, paymentStatus, paymentNote } = updateSchema.parse(await request.json());
    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        select: { id: true, paymentMethod: true, paymentStatus: true },
      });
      if (!existing) throw new Error('Order not found.');

      if (status === 'CANCELLED') {
        const gatewayMethod = await tx.paymentMethod.findUnique({ where: { code: existing.paymentMethod }, select: { type: true } });
        if (gatewayMethod?.type === 'GATEWAY') {
          const pendingAttempt = await tx.paymentAttempt.findFirst({
            where: { orderId: id, status: 'PENDING', checkoutLockUserId: { not: null } },
            select: { id: true },
          });
          if (pendingAttempt) throw new Error('Wait for the provider to confirm or cancel the online payment before cancelling this order.');
        }
      }

      const updateData = { ...(status ? { status } : {}) };
      if (paymentStatus && paymentStatus !== existing.paymentStatus) {
        const method = await tx.paymentMethod.findUnique({
          where: { code: existing.paymentMethod },
          select: { type: true },
        });
        const cashCollection = method?.type === 'COD' && existing.paymentStatus === 'PENDING' && paymentStatus === 'PAID';
        const isManualPayment = ['BANK_TRANSFER', 'MANUAL_WALLET'].includes(method?.type);
        const reviewableStatus = existing.paymentStatus === 'PENDING_VERIFICATION' || (isManualPayment && existing.paymentStatus === 'PENDING');
        const reviewedManualPayment = reviewableStatus && ['PAID', 'FAILED'].includes(paymentStatus) && isManualPayment;
        const reviewedGatewayPayment = existing.paymentStatus === 'PENDING_VERIFICATION' && paymentStatus === 'PAID' && method?.type === 'GATEWAY';
        const manualRefund = paymentStatus === 'REFUNDED' && existing.paymentStatus === 'PAID' && ['COD', 'BANK_TRANSFER', 'MANUAL_WALLET'].includes(method?.type);

        if (!cashCollection && !reviewedManualPayment && !reviewedGatewayPayment && !manualRefund) {
          throw new Error('This payment status can only be changed after a valid payment review or provider confirmation.');
        }
        if (!paymentNote) throw new Error('Add a note describing this payment decision.');

        updateData.paymentStatus = paymentStatus;
        if (reviewedGatewayPayment) {
          const attempt = await tx.paymentAttempt.updateMany({
            where: { orderId: id, status: 'PENDING', providerTransactionId: { not: null } },
            data: { status: 'PAID', checkoutLockUserId: null },
          });
          if (!attempt.count) throw new Error('The provider-verified payment attempt was not found.');
        }
      }

      await tx.order.update({ where: { id }, data: updateData });
      if (updateData.paymentStatus) {
        await tx.paymentEvent.create({
          data: {
            orderId: id,
            actorId: admin.id,
            status: paymentStatus,
            source: 'ADMIN',
            note: paymentNote,
          },
        });
      }
      return tx.order.findUnique({
        where: { id },
        include: { paymentEvents: { orderBy: { createdAt: 'desc' }, include: { actor: { select: { name: true, email: true } } } } },
      });
    });
    return Response.json(order);
  } catch (error) {
    return jsonError(error);
  }
}
