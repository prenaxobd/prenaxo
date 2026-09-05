import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();
    const normalizedCode = String(code || '').trim().toUpperCase();
    const orderSubtotal = Number(subtotal || 0);
    const coupon = await prisma.coupon.findUnique({ where: { code: normalizedCode } });

    if (!coupon?.active || (coupon.expiresAt && coupon.expiresAt <= new Date())) {
      return NextResponse.json({ error: 'এই কুপনটি বৈধ নয়।' }, { status: 400 });
    }
    if (orderSubtotal < Number(coupon.minimumOrder || 0)) {
      return NextResponse.json({ error: `এই কুপনের জন্য ন্যূনতম অর্ডার ${Number(coupon.minimumOrder).toLocaleString('en-BD')} টাকা।` }, { status: 400 });
    }

    const discount = coupon.type === 'PERCENTAGE'
      ? Math.min(orderSubtotal * Number(coupon.value) / 100, orderSubtotal)
      : Math.min(Number(coupon.value), orderSubtotal);
    return NextResponse.json({ code: coupon.code, subtotal: orderSubtotal, discount });
  } catch {
    return NextResponse.json({ error: 'কুপন যাচাই করা যায়নি।' }, { status: 400 });
  }
}