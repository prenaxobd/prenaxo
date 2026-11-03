import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['PENDING', 'PENDING_VERIFICATION', 'PAID', 'FAILED', 'REFUNDED']).optional(),
  paymentNote: z.string().trim().min(5).max(500).optional(),
}).refine(({ status, paymentStatus }) => Boolean(status || paymentStatus), {
  message: 'Provide an order status or payment status to update.',
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
        select: { id: true, paymentMethod: true, paymentStatus: true, paymentTransactionId: true },
      });
      if (!existing) throw new Error('Order not found.');

      const method = await tx.paymentMethod.findUnique({
        where: { code: existing.paymentMethod },
        select: { type: true },
      });
      const isManualPayment = ['BANK_TRANSFER', 'MANUAL_WALLET'].includes(method?.type);
      const pendingManualVerification = isManualPayment && existing.paymentStatus === 'PENDING_VERIFICATION';
      let effectivePaymentNote = paymentNote;
      const updateData = {};

      if (pendingManualVerification) {
        if (paymentStatus === 'PAID' && !existing.paymentTransactionId) {
          throw new Error('This order has no submitted transaction ID to verify.');
        }
        if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) && paymentStatus !== 'PAID') {
          throw new Error('Verify the manual payment and mark it as paid before processing this order.');
        }
        if (paymentStatus === 'PAID' && status && status !== 'PROCESSING') {
          throw new Error('A verified manual payment must move the order to processing.');
        }
        if (paymentStatus === 'FAILED' && status && status !== 'CANCELLED') {
          throw new Error('A rejected manual payment must cancel the order.');
        }
        if (status === 'CANCELLED' && paymentStatus && paymentStatus !== 'FAILED') {
          throw new Error('Canceling this unverified manual-payment order must mark its payment as failed.');
        }
      }

      if (status === 'CANCELLED') {
        if (method?.type === 'GATEWAY') {
          const pendingAttempt = await tx.paymentAttempt.findFirst({
            where: { orderId: id, status: 'PENDING', checkoutLockUserId: { not: null } },
            select: { id: true },
          });
          if (pendingAttempt) throw new Error('Wait for the provider to confirm or cancel the online payment before cancelling this order.');
        }
      }

      if (status) updateData.status = status;
      if (pendingManualVerification && paymentStatus === 'PAID') updateData.status = 'PROCESSING';
      if (pendingManualVerification && paymentStatus === 'FAILED') updateData.status = 'CANCELLED';
      if (pendingManualVerification && status === 'CANCELLED' && !paymentStatus) {
        updateData.paymentStatus = 'FAILED';
        effectivePaymentNote = paymentNote || 'Order cancelled before manual payment verification.';
      }
      if (paymentStatus && paymentStatus !== existing.paymentStatus) {
        const cashCollection = method?.type === 'COD' && existing.paymentStatus === 'PENDING' && paymentStatus === 'PAID';
        const reviewableStatus = existing.paymentStatus === 'PENDING_VERIFICATION' || (isManualPayment && existing.paymentStatus === 'PENDING');
        const reviewedManualPayment = reviewableStatus && ['PAID', 'FAILED'].includes(paymentStatus) && isManualPayment;
        const reviewedGatewayPayment = existing.paymentStatus === 'PENDING_VERIFICATION' && paymentStatus === 'PAID' && method?.type === 'GATEWAY';
        const manualRefund = paymentStatus === 'REFUNDED' && existing.paymentStatus === 'PAID' && ['COD', 'BANK_TRANSFER', 'MANUAL_WALLET'].includes(method?.type);

        if (!cashCollection && !reviewedManualPayment && !reviewedGatewayPayment && !manualRefund) {
          throw new Error('This payment status can only be changed after a valid payment review or provider confirmation.');
        }
        if (!effectivePaymentNote) throw new Error('Add a note describing this payment decision.');

        updateData.paymentStatus = paymentStatus;
        if (reviewedGatewayPayment) {
          const attempt = await tx.paymentAttempt.updateMany({
            where: { orderId: id, status: 'PENDING', providerTransactionId: { not: null } },
            data: { status: 'PAID', checkoutLockUserId: null },
          });
          if (!attempt.count) throw new Error('The provider-verified payment attempt was not found.');
        }
      }

      if (pendingManualVerification) {
        const updated = await tx.order.updateMany({
          where: { id, paymentStatus: 'PENDING_VERIFICATION' },
          data: updateData,
        });
        if (!updated.count) {
          throw new Error('This payment was already reviewed. Refresh the order and try again.');
        }
      } else {
        await tx.order.update({ where: { id }, data: updateData });
      }

      if (updateData.paymentStatus) {
        await tx.paymentEvent.create({
          data: {
            orderId: id,
            actorId: admin.id,
            status: updateData.paymentStatus,
            source: 'ADMIN',
            note: effectivePaymentNote,
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
