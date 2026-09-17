import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { jsonError, requirePermission } from '@/lib/admin';

const valueSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().min(1),
  hexValue: z.string().nullable().optional(),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const attributeSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  kind: z.string().default('TEXT'),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
  values: z.array(valueSchema).default([]),
});

const include = { values: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } };

export async function GET() {
  try {
    await requirePermission('categories.view');
    return Response.json(await prisma.attribute.findMany({ include, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('categories.edit');
    const parsed = attributeSchema.parse(await request.json());
    const attribute = await prisma.attribute.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        kind: parsed.kind,
        active: parsed.active,
        sortOrder: parsed.sortOrder,
        values: {
          create: parsed.values.map(({ id, ...value }) => value),
        },
      },
      include,
    });
    return Response.json(attribute, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    await requirePermission('categories.edit');
    const { id, ...input } = await request.json();
    if (!id) throw new Error('Attribute id is required.');
    const parsed = attributeSchema.partial().parse(input);
    const attribute = await prisma.$transaction(async (tx) => {
      await tx.attribute.update({ where: { id }, data: { ...parsed, values: undefined } });
      if (parsed.values) {
        await tx.attributeValue.deleteMany({ where: { attributeId: id, id: { notIn: parsed.values.filter((value) => value.id).map((value) => value.id) } } });
        for (const value of parsed.values) {
          const { id: valueId, ...data } = value;
          if (valueId) await tx.attributeValue.update({ where: { id: valueId }, data });
          else await tx.attributeValue.create({ data: { ...data, attributeId: id } });
        }
      }
      return tx.attribute.findUnique({ where: { id }, include });
    });
    return Response.json(attribute);
  } catch (error) {
    return jsonError(error);
  }
}
