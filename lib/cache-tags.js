import { revalidatePath, revalidateTag } from 'next/cache';

export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  brands: 'brands',
  homepage: 'homepage',
  siteSettings: 'site-settings',
  seo: 'seo',
  delivery: 'delivery',
};

const PUBLIC_PATHS = [
  '/',
  '/shop',
  '/combos',
  '/flash-sale',
  '/category/[slug]',
  '/product/[slug]',
];

export function invalidatePublicCache(...tags) {
  for (const tag of new Set(tags)) {
    revalidateTag(tag, { expire: 0 });
  }

  revalidatePath('/', 'layout');

  for (const path of PUBLIC_PATHS) {
    revalidatePath(path, path.includes('[') ? 'page' : undefined);
  }
}
