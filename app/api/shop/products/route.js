import { NextResponse } from 'next/server';
import { getShopProducts } from '@/lib/products';

const allowedSorts = new Set([
  'best-sellers',
  'newest',
  'price-low',
  'price-high',
  'top-rated',
  'featured',
]);

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const min = params.get('min') || '';
  const max = params.get('max') || '';
  const rating = Number(params.get('rating') || 0);
  const page = Number(params.get('page') || 1);
  const availability = params.get('availability') || 'all';
  const sort = params.get('sort') || 'newest';
  const category = params.get('category') || 'all';
  const subcategory = params.get('subcategory') || 'all';

  if (
    category.length > 100 ||
    subcategory.length > 100 ||
    (min && (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
    (max && (!Number.isFinite(Number(max)) || Number(max) < 0)) ||
    !Number.isFinite(rating) || rating < 0 || rating > 5 ||
    !Number.isSafeInteger(page) || page < 1 ||
    !['all', 'in-stock', 'out-of-stock'].includes(availability) ||
    !allowedSorts.has(sort)
  ) {
    return NextResponse.json({ error: 'Invalid product filters' }, { status: 400 });
  }

  try {
    const result = await getShopProducts({
      category,
      subcategory,
      brand: (params.get('brand') || 'all').slice(0, 100),
      search: (params.get('search') || '').slice(0, 120),
      min,
      max,
      rating,
      availability,
      sort,
      page,
      perPage: 16,
    });

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Shop product filter request failed:', error);
    return NextResponse.json(
      { error: 'Unable to update products' },
      { status: 500 }
    );
  }
}
