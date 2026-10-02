import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });

  try {
    const { orderNumber } = await params;
    const order = await prisma.order.findFirst({
      where: { orderNumber, userId: user.id },
      select: { orderNumber: true, paymentMethod: true, paymentStatus: true },
    });
    if (!order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    const method = await prisma.paymentMethod.findUnique({ where: { code: order.paymentMethod }, select: { type: true, name: true } });
    return NextResponse.json({ ...order, paymentMethodType: method?.type || 'MANUAL_WALLET', paymentMethodName: method?.name || order.paymentMethod }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ error: 'Unable to load payment status.' }, { status: 500 });
  }
}
