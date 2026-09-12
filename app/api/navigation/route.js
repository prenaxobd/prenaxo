import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizeSearchTokens(rawQuery) {
  const trimmed = (rawQuery || '').trim();
  if (!trimmed) return [];

  return Array.from(
    new Set(
      trimmed
        .split(/\s+/)
        .map((token) => token.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '').trim())
        .filter(Boolean)
    )
  );
}

export async function GET(request) {
  const rawQuery = new URL(request.url).searchParams.get('q')?.trim() || '';
  const terms = normalizeSearchTokens(rawQuery);

  const productOr = rawQuery
    ? [
        ...terms.flatMap((term) => [
          { name: { contains: term } },
          { sku: { contains: term } },
          { brand: { contains: term } },
          { shortDescription: { contains: term } },
          { description: { contains: term } },
          { category: { is: { name: { contains: term } } } },
          { brandRelation: { is: { name: { contains: term } } } },
        ]),
      ]
    : [];

  const productWhere = rawQuery
    ? {
        active: true,
        OR: productOr,
      }
    : { active: true };

  const categoryWhere = rawQuery
    ? {
        active: true,
        OR: terms.map((term) => ({ name: { contains: term } })),
      }
    : { active: true };

  const brandWhere = rawQuery
    ? {
        active: true,
        OR: terms.map((term) => ({ name: { contains: term } })),
      }
    : { active: true };

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: productWhere,
      select: {
        id: true,
        name: true,
        slug: true,
        regularPrice: true,
        salePrice: true,
        brand: true,
        shortDescription: true,
        category: { select: { id: true, name: true, slug: true } },
        brandRelation: { select: { id: true, name: true, slug: true } },
        images: {
          select: { id: true, url: true, alt: true },
          orderBy: { sortOrder: 'asc' },
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
      take: rawQuery ? 8 : 100,
    }),
    prisma.category.findMany({
      where: categoryWhere,
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
      take: rawQuery ? 5 : 100,
    }),
    prisma.brand.findMany({
      where: brandWhere,
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
      take: rawQuery ? 5 : 100,
    }),
  ]);

  return NextResponse.json({ products, categories, brands }, { headers: { 'Cache-Control': 'no-store' } });
}