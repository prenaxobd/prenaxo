import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const query = new URL(request.url).searchParams.get('q')?.trim() || '';
  const contains = query ? { contains: query } : undefined;

  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, ...(contains ? { OR: [{ name: contains }, { brand: contains }] } : {}) },
      select: { id: true, name: true, slug: true, brand: true, category: { select: { id: true, name: true, slug: true } } },
      orderBy: { name: 'asc' },
      take: query ? 6 : 100,
    }),
    prisma.category.findMany({
      where: { active: true, ...(query ? { name: contains } : {}) },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
      take: query ? 5 : 100,
    }),
    prisma.brand.findMany({
      where: { active: true, ...(query ? { name: contains } : {}) },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
      take: query ? 5 : 100,
    }),
  ]);

  return NextResponse.json({ products, categories, brands }, { headers: { 'Cache-Control': 'no-store' } });
}