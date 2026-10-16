import { permanentRedirect } from 'next/navigation';
import { getCategoryCollectionUrl } from '@/lib/category-navigation';

export default async function CategorySubcategoryPage({ params, searchParams }) {
  const routeParams = await params;
  const query = await searchParams;
  permanentRedirect(
    getCategoryCollectionUrl(routeParams.slug, routeParams.subcategory, query)
  );
}
