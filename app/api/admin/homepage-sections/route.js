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
  useManualProducts: z.boolean().default(false),
  productIds: z.array(z.string().min(1)).max(24).default([]).superRefine((ids, context) => {
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: 'custom',
        message: 'A product can only be selected once.',
      });
    }
  }),
  active: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

const sectionInclude = {
  category: true,
  products: {
    orderBy: { sortOrder: 'asc' },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          sku: true,
          categoryId: true,
          active: true,
        },
      },
    },
  },
};

async function saveSection(id, input) {
  const { productIds, useManualProducts, ...fields } = input;

  return prisma.$transaction(async (tx) => {
    const existing = id
      ? await tx.homepageSection.findUnique({
          where: { id },
          include: { products: true },
        })
      : null;

    if (id && !existing) {
      throw new Error('Homepage section not found.');
    }

    const type = fields.type ?? existing?.type;
    const categoryId = Object.hasOwn(fields, 'categoryId')
      ? fields.categoryId
      : existing?.categoryId;
    const manualSelection = useManualProducts ?? existing?.useManualProducts ?? false;
    const selectedIds = productIds ?? existing?.products
      ?.slice()
      .sort((first, second) => first.sortOrder - second.sortOrder)
      .map((item) => item.productId) ?? [];

    if (manualSelection && type !== 'CATEGORY') {
      throw new Error('Manual product selection is only available for category sections.');
    }

    if (manualSelection) {
      if (!categoryId) {
        throw new Error('Select a category before choosing products.');
      }
      if (!selectedIds.length) {
        throw new Error('Choose at least one product or switch back to automatic products.');
      }

      const matchingProducts = await tx.product.findMany({
        where: {
          id: { in: selectedIds },
          categoryId,
        },
        select: { id: true },
      });
      if (matchingProducts.length !== selectedIds.length) {
        throw new Error('Every selected product must belong to this category.');
      }
    }

    const sectionData = {
      ...fields,
      useManualProducts: manualSelection,
    };
    const section = id
      ? await tx.homepageSection.update({ where: { id }, data: sectionData })
      : await tx.homepageSection.create({ data: sectionData });

    await tx.homepageSectionProduct.deleteMany({
      where: { sectionId: section.id },
    });

    if (manualSelection) {
      await tx.homepageSectionProduct.createMany({
        data: selectedIds.map((productId, sortOrder) => ({
          sectionId: section.id,
          productId,
          sortOrder,
        })),
      });
    }

    return tx.homepageSection.findUnique({
      where: { id: section.id },
      include: sectionInclude,
    });
  });
}

export async function GET(request) {
  try {
    await requirePermission('marketing.view');
    const searchParams = new URL(request.url).searchParams;
    const categoryId = searchParams.get('categoryId');

    if (categoryId) {
      const search = searchParams.get('search')?.trim() || '';
      const products = await prisma.product.findMany({
        where: {
          active: true,
          categoryId,
          ...(search
            ? {
                OR: [
                  { name: { contains: search } },
                  { sku: { contains: search } },
                ],
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          sku: true,
          stock: true,
        },
        orderBy: { name: 'asc' },
        take: 80,
      });
      return Response.json(products);
    }

    return Response.json(await prisma.homepageSection.findMany({
      include: sectionInclude,
      orderBy: { sortOrder: 'asc' },
    }));
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('marketing.create');
    const section = await saveSection(null, schema.parse(await request.json()));
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
    if (typeof id !== 'string' || !id) {
      throw new Error('Homepage section id is required.');
    }
    const section = await saveSection(id, schema.partial().parse(input));
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
