import { prisma } from '@/lib/prisma';
import DeliveryManager from '@/components/admin/DeliveryManager';

export default async function DeliveryPage() {
  const zones = await prisma.deliveryZone.findMany({ orderBy: [{ division: 'asc' }, { district: 'asc' }] });
  return <><div className="eyebrow" style={{ color: 'var(--coral)' }}>Store control</div><h1>Delivery Charges</h1><DeliveryManager initialZones={zones.map(zone => ({ ...zone, charge: Number(zone.charge) }))} /></>;
}
