import { NextResponse } from 'next/server';
import { verifySslCommerzFailure, verifySslCommerzPayment } from '@/lib/payment-attempts';

export async function POST(request) {
  try {
    const body = await request.formData();
    const status = String(body.get('status') || '').toUpperCase();
    const merchantTransactionId = String(body.get('tran_id') || '');
    const validationId = String(body.get('val_id') || '');

    if (!merchantTransactionId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    if (['VALID', 'VALIDATED'].includes(status) && validationId) {
      await verifySslCommerzPayment({ merchantTransactionId, validationId });
    } else if (['FAILED', 'CANCELLED', 'EXPIRED', 'UNATTEMPTED'].includes(status)) {
      await verifySslCommerzFailure({ merchantTransactionId });
    } else {
      return NextResponse.json({ received: true, ignored: true });
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Payment notification could not be verified.' }, { status: 400 });
  }
}
