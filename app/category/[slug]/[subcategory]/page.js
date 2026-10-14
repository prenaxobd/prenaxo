import CategoryPage, { generateMetadata as generateCategoryMetadata } from '../page';

export async function generateMetadata({ params, searchParams }) {
  const routeParams = await params;
  const query = await searchParams;

  return generateCategoryMetadata({
    params: Promise.resolve(routeParams),
    searchParams: Promise.resolve({
      ...query,
      subcategory: routeParams.subcategory,
    }),
  });
}

export default async function CategorySubcategoryPage({ params, searchParams }) {
  return <CategoryPage params={params} searchParams={searchParams} />;
}
