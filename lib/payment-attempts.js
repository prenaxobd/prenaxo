import { prisma } from '@/lib/prisma';
import {
  createMerchantTransactionId,
  createSslCommerzSession,
  querySslCommerzTransaction,
  validateSslCommerzTransaction,
} from '@/lib/sslcommerz';

export async function createSslCommerzAttempt(tx, order, paymentMethod, userId) {
  return tx.paymentAttempt.create({
    data: {
      orderId: order.id,
      paymentMethodId: paymentMethod.id,
      methodCode: paymentMethod.code,
      provider: 'SSLCOMMERZ',
      checkoutLockUserId: userId,
      merchantTransactionId: createMerchantTransactionId(),
      amount: order.total,
      currency: 'BDT',
      status: 'CREATED',
      inventoryReserved: true,
    },
  });
}

export async function startSslCommerzAttempt(attempt, order, paymentMethod) {
  const session = await createSslCommerzSession({ attempt, order, paymentMethod });
  await prisma.paymentAttempt.updateMany({
    where: { id: attempt.id, status: 'CREATED' },
    data: {
      providerSessionKey: session.sessionKey,
      status: 'PENDING',
    },
  });
  const currentAttempt = await prisma.paymentAttempt.findUnique({ where: { id: attempt.id } });
  return { attempt: currentAttempt, redirectUrl: session.redirectUrl };
}

function amountInCents(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

function orderCartSignature(items) {
  return items.map((item) => {
    const values = Array.isArray(item.attributeValueIds) ? [...item.attributeValueIds].map(String).sort() : [];
    return `${item.productId}:${item.variantId || ''}:${item.quantity}:${values.join(',')}`;
  }).sort().join('|');
}

async function releaseReservedInventory(tx, orderId) {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { productId: true, variantId: true, quantity: true },
  });
  const productQuantities = new Map();
  const variantQuantities = new Map();
  for (const item of items) {
    productQuantities.set(item.productId, (productQuantities.get(item.productId) || 0) + item.quantity);
    if (item.variantId) variantQuantities.set(item.variantId, (variantQuantities.get(item.variantId) || 0) + item.quantity);
  }
  const [updatedVariants, updatedProducts] = await Promise.all([
    Promise.all([...variantQuantities].map(([id, quantity]) => tx.productVariant.updateMany({ where: { id }, data: { stock: { increment: quantity } } }))),
    Promise.all([...productQuantities].map(([id, quantity]) => tx.product.updateMany({ where: { id }, data: { stock: { increment: quantity } } }))),
  ]);
  if (updatedVariants.some((result) => result.count === 0) || updatedProducts.some((result) => result.count === 0)) {
    throw new Error('Inventory reservation could not be released safely.');
  }
}

export async function verifySslCommerzPayment({ merchantTransactionId, validationId }) {
  const attempt = await prisma.paymentAttempt.findUnique({
    where: { merchantTransactionId },
    include: { order: true },
  });
  if (!attempt || attempt.provider !== 'SSLCOMMERZ') {
    throw new Error('Payment attempt not found.');
  }
  if (attempt.status === 'PAID') {
    return { orderNumber: attempt.order.orderNumber, status: 'PAID', duplicate: true };
  }

  const validation = await validateSslCommerzTransaction(validationId);
  const validatedAmount = validation.currency_amount ?? validation.amount;
  if (
    !['VALID', 'VALIDATED'].includes(validation.status) ||
    validation.tran_id !== attempt.merchantTransactionId ||
    validation.val_id !== validationId ||
    validation.currency_type !== 'BDT' ||
    validation.currency !== 'BDT' ||
    amountInCents(validatedAmount) !== amountInCents(attempt.amount)
  ) {
    throw new Error('Payment validation did not match the order.');
  }

  const flaggedRisk = String(validation.risk_level || '0') !== '0';
  const nextStatus = flaggedRisk ? 'PENDING_VERIFICATION' : 'PAID';
  const eventNote = flaggedRisk
    ? 'SSLCommerz marked this transaction as high risk; manual review is required.'
    : 'SSLCommerz payment validated.';

  const result = await prisma.$transaction(async (tx) => {
    const currentOrder = await tx.order.findUnique({
      where: { id: attempt.orderId },
      select: { id: true, orderNumber: true, userId: true, status: true, paymentStatus: true },
    });
    if (!currentOrder || currentOrder.status === 'CANCELLED' || currentOrder.paymentStatus === 'REFUNDED') {
      throw new Error('This order can no longer accept payment.');
    }

    const attemptUpdate = await tx.paymentAttempt.updateMany({
      where: { id: attempt.id, status: { in: ['CREATED', 'PENDING'] }, providerTransactionId: null },
      data: {
        status: flaggedRisk ? 'PENDING' : 'PAID',
        providerTransactionId: validationId,
        ...(!flaggedRisk ? { checkoutLockUserId: null } : {}),
      },
    });
    if (!attemptUpdate.count) {
      const latestAttempt = await tx.paymentAttempt.findUnique({ where: { id: attempt.id } });
      return { orderNumber: currentOrder.orderNumber, status: latestAttempt?.status || 'PENDING', duplicate: true };
    }

    const orderUpdate = await tx.order.updateMany({
      where: { id: currentOrder.id, paymentStatus: { in: ['PENDING', 'PENDING_VERIFICATION'] }, status: { not: 'CANCELLED' } },
      data: {
        paymentStatus: nextStatus,
        paymentTransactionId: validation.bank_tran_id || validationId,
      },
    });
    if (!orderUpdate.count) throw new Error('The order payment status changed before verification completed.');

    await tx.paymentEvent.create({
      data: {
        orderId: currentOrder.id,
        status: nextStatus,
        source: 'GATEWAY',
        note: eventNote,
        externalReference: validationId,
      },
    });

    if (currentOrder.userId) {
      const [orderItems, cart] = await Promise.all([
        tx.orderItem.findMany({ where: { orderId: currentOrder.id }, select: { productId: true, variantId: true, quantity: true, attributeValueIds: true } }),
        tx.cart.findUnique({ where: { userId: currentOrder.userId }, include: { items: true } }),
      ]);
      if (cart && orderCartSignature(orderItems) === orderCartSignature(cart.items)) {
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
        await tx.cart.delete({ where: { userId: currentOrder.userId } });
      }
    }

    return { orderNumber: currentOrder.orderNumber, status: nextStatus, duplicate: false };
  });

  return result;
}

export async function verifySslCommerzFailure({ merchantTransactionId }) {
  const attempt = await prisma.paymentAttempt.findUnique({
    where: { merchantTransactionId },
  });
  if (!attempt || attempt.provider !== 'SSLCOMMERZ') {
    throw new Error('Payment attempt not found.');
  }
  if (['PAID', 'FAILED', 'CANCELLED'].includes(attempt.status)) {
    return { status: attempt.status, duplicate: true };
  }

  const query = await querySslCommerzTransaction(merchantTransactionId);
  const transactions = Array.isArray(query.element) ? query.element : [];
  const transaction = transactions.find((item) =>
    item.tran_id === merchantTransactionId &&
    ['FAILED', 'CANCELLED', 'EXPIRED', 'UNATTEMPTED'].includes(String(item.status).toUpperCase())
  );
  if (
    query.APIConnect !== 'DONE' ||
    !transaction ||
    (transaction.currency_type || transaction.currency) !== 'BDT' ||
    amountInCents(transaction.currency_amount ?? transaction.amount) !== amountInCents(attempt.amount)
  ) {
    throw new Error('Payment failure could not be confirmed by the provider.');
  }

  const status = ['CANCELLED', 'EXPIRED', 'UNATTEMPTED'].includes(String(transaction.status).toUpperCase())
    ? 'CANCELLED'
    : 'FAILED';

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: attempt.orderId },
      select: { id: true, paymentStatus: true, status: true },
    });
    if (!order || order.paymentStatus !== 'PENDING' || order.status === 'CANCELLED') {
      throw new Error('The order can no longer be changed by this payment attempt.');
    }

    const attemptUpdate = await tx.paymentAttempt.updateMany({
      where: { id: attempt.id, status: { in: ['CREATED', 'PENDING'] }, providerTransactionId: null },
      data: { status, inventoryReserved: false, checkoutLockUserId: null },
    });
    if (!attemptUpdate.count) {
      const latestAttempt = await tx.paymentAttempt.findUnique({ where: { id: attempt.id } });
      return { status: latestAttempt?.status || status, duplicate: true };
    }

    if (attempt.inventoryReserved) {
      await releaseReservedInventory(tx, attempt.orderId);
    }

    const orderUpdate = await tx.order.updateMany({
      where: { id: attempt.orderId, paymentStatus: 'PENDING', status: { not: 'CANCELLED' } },
      data: { paymentStatus: 'FAILED' },
    });
    if (!orderUpdate.count) throw new Error('The order payment status changed before failure confirmation completed.');

    await tx.paymentEvent.create({
      data: {
        orderId: attempt.orderId,
        status: 'FAILED',
        source: 'GATEWAY',
        note: `SSLCommerz confirmed payment ${status.toLowerCase()}.`,
        externalReference: merchantTransactionId,
      },
    });
    return { status: 'FAILED', duplicate: false };
  });
}

export async function reconcileSslCommerzAttempt({ merchantTransactionId }) {
  const attempt = await prisma.paymentAttempt.findUnique({ where: { merchantTransactionId } });
  if (!attempt || attempt.provider !== 'SSLCOMMERZ') throw new Error('Payment attempt not found.');

  const query = await querySslCommerzTransaction(merchantTransactionId);
  if (query.APIConnect !== 'DONE' || !Array.isArray(query.element)) {
    throw new Error('The payment provider status is temporarily unavailable.');
  }

  const transaction = query.element.find((item) => item.tran_id === merchantTransactionId);
  if (!transaction && Date.now() - attempt.createdAt.getTime() >= 30 * 60 * 1000) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: attempt.orderId }, select: { id: true, paymentStatus: true, status: true } });
      if (!order || order.paymentStatus !== 'PENDING' || order.status === 'CANCELLED') {
        return { status: order?.paymentStatus || 'FAILED', duplicate: true };
      }

      const claimed = await tx.paymentAttempt.updateMany({
        where: { id: attempt.id, status: { in: ['CREATED', 'PENDING'] }, providerTransactionId: null },
        data: { status: 'FAILED', inventoryReserved: false, checkoutLockUserId: null },
      });
      if (!claimed.count) {
        const latestAttempt = await tx.paymentAttempt.findUnique({ where: { id: attempt.id } });
        return { status: latestAttempt?.status || 'FAILED', duplicate: true };
      }

      const orderUpdate = await tx.order.updateMany({ where: { id: order.id, paymentStatus: 'PENDING' }, data: { paymentStatus: 'FAILED' } });
      if (!orderUpdate.count) throw new Error('The order changed while expiring the payment attempt.');
      if (attempt.inventoryReserved) await releaseReservedInventory(tx, order.id);
      await tx.paymentEvent.create({
        data: {
          orderId: order.id,
          status: 'FAILED',
          source: 'SYSTEM',
          note: 'SSLCommerz reported no transaction for this checkout after the retry window. Inventory was released.',
          externalReference: merchantTransactionId,
        },
      });
      return { status: 'FAILED', duplicate: false };
    });
  }

  const status = String(transaction?.status || '').toUpperCase();
  if (['VALID', 'VALIDATED'].includes(status) && transaction.val_id) {
    return verifySslCommerzPayment({ merchantTransactionId, validationId: transaction.val_id });
  }
  if (['FAILED', 'CANCELLED', 'EXPIRED', 'UNATTEMPTED'].includes(status)) {
    return verifySslCommerzFailure({ merchantTransactionId });
  }
  return { status: 'PENDING', duplicate: false };
}
