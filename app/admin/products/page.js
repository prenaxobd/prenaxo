import { prisma } from '@/lib/prisma';
import ProductManager from '@/components/admin/ProductManager';

export default async function ProductsPage() {
  const [products, categories, brands] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        brandRelation: {
          select: {
            id: true,
            name: true,
          },
        },
        images: {
          orderBy: {
            sortOrder: 'asc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),

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

  const serializedProducts = products.map((product) => ({
    ...product,

    regularPrice:
      product.regularPrice == null
        ? null
        : Number(product.regularPrice),

    salePrice:
      product.salePrice == null
        ? null
        : Number(product.salePrice),

    costPrice:
      product.costPrice == null
        ? null
        : Number(product.costPrice),

    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),

    images: product.images.map((image) => ({
      ...image,
    })),
  }));

  return (
    <ProductManager
      initialProducts={serializedProducts}
      categories={categories}
      brands={brands}
    />
  );
}