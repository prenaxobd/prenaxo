import { NextResponse } from 'next/server';
import { getDeliveryConfig } from '@/lib/delivery';

export async function GET() {
  try {
    const { threshold, zones } = await getDeliveryConfig();
    return NextResponse.json({ threshold, zones: zones.map(zone => ({ ...zone, charge: Number(zone.charge) })) });
  } catch {
    return NextResponse.json({ error: 'ডেলিভারি তথ্য পাওয়া যায়নি।' }, { status: 500 });
  }
}
