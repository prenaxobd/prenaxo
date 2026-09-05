import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export async function GET() {
  try {
    await requirePermission('brands.view');
    return Response.json(await prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    }));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('brands.create');
    return Response.json(await prisma.brand.create({ data: schema.parse(await request.json()) }), { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    await requirePermission('brands.edit');
    const { id, ...input } = await request.json();
    return Response.json(await prisma.brand.update({ where: { id }, data: schema.partial().parse(input) }));
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    await requirePermission('brands.delete');
    const id = new URL(request.url).searchParams.get('id');
    if (!id) throw new Error('Brand id is required.');
    return Response.json(await prisma.brand.update({ where: { id }, data: { active: false } }));
  } catch (error) {
    return jsonError(error);
  }
}
