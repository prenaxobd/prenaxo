import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonError } from '@/lib/admin';

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
    await requireAdmin();
    return Response.json(await prisma.homepageSection.findMany({ include: { category: true }, orderBy: { sortOrder: 'asc' } }));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requireAdmin();
    return Response.json(await prisma.homepageSection.create({ data: schema.parse(await request.json()), include: { category: true } }), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    await requireAdmin();
    const { id, ...input } = await request.json();
    return Response.json(await prisma.homepageSection.update({ where: { id }, data: schema.partial().parse(input), include: { category: true } }));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    const id = new URL(request.url).searchParams.get('id');
    return Response.json(await prisma.homepageSection.update({ where: { id }, data: { active: false } }));
  } catch (error) {
    return jsonError(error);
  }
}
