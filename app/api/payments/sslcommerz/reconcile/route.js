import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { reconcileSslCommerzAttempt } from '@/lib/payment-attempts';

function isAuthorized(request) {
  const configuredSecret = process.env.PAYMENT_RECONCILE_SECRET;
  const suppliedSecret = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!configuredSecret || !suppliedSecret) return false;

  const expected = Buffer.from(configuredSecret);
  const actual = Buffer.from(suppliedSecret);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const staleBefore = new Date(Date.now() - 30 * 60 * 1000);
  const attempts = await prisma.paymentAttempt.findMany({
    where: {
      provider: 'SSLCOMMERZ',
      status: { in: ['CREATED', 'PENDING'] },
      checkoutLockUserId: { not: null },
      createdAt: { lt: staleBefore },
    },
    orderBy: { createdAt: 'asc' },
    take: 50,
    select: { merchantTransactionId: true },
  });

  let reconciled = 0;
  let pending = 0;
  let failed = 0;
  for (const attempt of attempts) {
    try {
      const result = await reconcileSslCommerzAttempt({ merchantTransactionId: attempt.merchantTransactionId });
      if (result.status === 'PENDING') pending += 1;
      else reconciled += 1;
    } catch {
      failed += 1;
    }
  }

  return NextResponse.json({ checked: attempts.length, reconciled, pending, failed });
}
