import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';

const schema = z.object({
  productId: z.string().min(1),
  metaTitle: z.string().max(191).nullable().optional(),
  metaDescription: z.string().max(191).nullable().optional(),
  focusKeyword: z.string().max(191).nullable().optional(),
  canonicalUrl: z.string().max(191).nullable().optional(),
  robotsIndex: z.enum(['INDEX', 'NOINDEX']).default('INDEX'),
  robotsFollow: z.enum(['FOLLOW', 'NOFOLLOW']).default('FOLLOW'),
  ogTitle: z.string().max(191).nullable().optional(),
  ogDescription: z.string().max(191).nullable().optional(),
  ogImage: z.string().max(191).nullable().optional(),
});

export async function GET() {
  try {
    await requirePermission('seo.view');
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    });
    const rows = await prisma.productSEO.findMany({ where: { productId: { in: products.map(product => product.id) } } });
    const byProduct = new Map(rows.map(row => [row.productId, row]));
    return Response.json(products.map(product => ({ ...product, seo: byProduct.get(product.id) || null })));
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request) {
  try {
    await requirePermission('seo.edit');
    const input = schema.parse(await request.json());
    const { productId, ...data } = input;
    return Response.json(await prisma.productSEO.upsert({
      where: { productId },
      create: { productId, ...data },
      update: data,
    }));
  } catch (error) {
    return jsonError(error);
  }
}
