import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';
import { invalidatePublicCache } from '@/lib/cache-tags';

const schema = z.object({
  id: z.string().optional(), division: z.string().min(1), district: z.string().min(1),
  charge: z.coerce.number().nonnegative(), estimatedDelivery: z.string().min(1),
  insideDhaka: z.coerce.boolean(), active: z.coerce.boolean(),
});

export async function GET() {
  try { await requirePermission('settings.view'); return Response.json(await prisma.deliveryZone.findMany({ orderBy: [{ division: 'asc' }, { district: 'asc' }] })); }
  catch (error) { return jsonError(error); }
}

export async function PUT(request) {
  try {
    await requirePermission('settings.edit');
    const { id, ...data } = schema.parse(await request.json());
    const zone = id
      ? await prisma.deliveryZone.update({ where: { id }, data })
      : await prisma.deliveryZone.upsert({ where: { district: data.district }, create: data, update: data });
    invalidatePublicCache('delivery', 'site-settings');
    return Response.json({ ...zone, charge: Number(zone.charge) });
  } catch (error) { return jsonError(error); }
}
