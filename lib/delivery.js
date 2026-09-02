import { prisma } from './prisma';
export { bangladeshDistricts } from './delivery-data';

export async function getDeliveryConfig() {
  const [settings, zones] = await Promise.all([
    prisma.siteSettings.findFirst({ select: { freeDeliveryThreshold: true } }),
    prisma.deliveryZone.findMany({ where: { active: true }, orderBy: [{ division: 'asc' }, { district: 'asc' }] }),
  ]);
  return { threshold: Number(settings?.freeDeliveryThreshold ?? 2000), zones };
}

export function calculateDelivery(subtotal, zone, threshold = 2000) {
  const free = subtotal >= threshold;
  return { charge: free ? 0 : Number(zone?.charge || 0), free, threshold, estimatedDelivery: zone?.estimatedDelivery || '২–৪ দিন' };
}