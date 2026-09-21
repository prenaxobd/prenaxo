import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { invalidatePublicCache } from '@/lib/cache-tags';

const schema = z.object({
  type: z.enum(['FEATURED', 'TOP_SELLING', 'DEALS', 'NEW_ARRIVALS', 'CATEGORY']),
  title: z.string().min(2),
  subtitle: z.string().nullable().optional(),
  eyebrow: z.string().nullable().optional(),
  href: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  productLimit: z.coerce.number().int().min(1).max(24).default(8),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export async function GET() {
  try {
    await requirePermission('marketing.view');
    return Response.json(await prisma.homepageSection.findMany({ include: { category: true }, orderBy: { sortOrder: 'asc' } }));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('marketing.create');
    const section = await prisma.homepageSection.create({ data: schema.parse(await request.json()), include: { category: true } });
    invalidatePublicCache('homepage', 'categories');
    return Response.json(section, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    await requirePermission('marketing.edit');
    const { id, ...input } = await request.json();
    const section = await prisma.homepageSection.update({ where: { id }, data: schema.partial().parse(input), include: { category: true } });
    invalidatePublicCache('homepage', 'categories');
    return Response.json(section);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    await requirePermission('marketing.delete');
    const id = new URL(request.url).searchParams.get('id');
    const section = await prisma.homepageSection.update({ where: { id }, data: { active: false } });
    invalidatePublicCache('homepage', 'categories');
    return Response.json(section);
  } catch (error) {
    return jsonError(error);
  }
}
