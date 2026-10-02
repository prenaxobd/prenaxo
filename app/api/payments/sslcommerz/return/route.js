import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySslCommerzFailure, verifySslCommerzPayment } from '@/lib/payment-attempts';

async function handleReturn(request) {
  const url = new URL(request.url);
  let payload = Object.fromEntries(url.searchParams.entries());
  if (request.method === 'POST') {
    const body = await request.formData();
    payload = { ...payload, ...Object.fromEntries(body.entries()) };
  }

  const merchantTransactionId = String(payload.tran_id || '');
  const validationId = String(payload.val_id || '');
  let orderNumber = '';

  if (merchantTransactionId) {
    const attempt = await prisma.paymentAttempt.findUnique({
      where: { merchantTransactionId },
      include: { order: { select: { orderNumber: true } } },
    });
    orderNumber = attempt?.order.orderNumber || '';
  }

  if (merchantTransactionId && validationId && url.searchParams.get('result') === 'success') {
    try {
      const verified = await verifySslCommerzPayment({ merchantTransactionId, validationId });
      orderNumber = verified.orderNumber;
    } catch {
      // The receipt shows the stored status; an unverified browser return never marks payment as paid.
    }
  }

  if (merchantTransactionId && ['failed', 'cancelled'].includes(url.searchParams.get('result'))) {
    try {
      await verifySslCommerzFailure({ merchantTransactionId });
    } catch {
      // The receipt keeps the last verified status if the provider query is unavailable.
    }
  }

  const destination = new URL('/order-success', request.url);
  if (orderNumber) destination.searchParams.set('order', orderNumber);
  destination.searchParams.set('payment', url.searchParams.get('result') || 'pending');
  return NextResponse.redirect(destination, 303);
}

export async function GET(request) {
  return handleReturn(request);
}

export async function POST(request) {
  return handleReturn(request);
}
