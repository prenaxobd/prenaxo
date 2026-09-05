import { prisma } from '@/lib/prisma';

import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const [categories, brands] =
    await Promise.all([
      prisma.category.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          name: true,
        },
      }),

      prisma.brand.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

  return (
    <ProductForm
      mode="create"
      categories={categories}
      brands={brands}
    />
  );
}