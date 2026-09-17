import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({
  params,
}) {
  const { id } = await params;

  const [product, categories, brands] =
    await Promise.all([
      prisma.product.findUnique({
        where: {
          id,
        },
        include: {
          category: true,
          brandRelation: true,
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
          variants: { include: { attributeValues: true } },
          attributeValues: { include: { attributeValue: true } },
        },
      }),

      prisma.category.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
        include: {
          attributes: {
            include: {
              attribute: {
                include: {
                  values: {
                    where: { active: true },
                    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
                  },
                },
              },
            },
          },
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

  if (!product) {
    notFound();
  }

  const serializedProduct = {
    ...product,

    regularPrice:
      product.regularPrice == null
        ? ''
        : String(product.regularPrice),

    salePrice:
      product.salePrice == null
        ? ''
        : String(product.salePrice),

    costPrice:
      product.costPrice == null
        ? ''
        : String(product.costPrice),

    stock: Number(product.stock || 0),

    lowStock: Number(
      product.lowStock || 5
    ),

    images: product.images.map(
      (image) => ({
        id: image.id,
        url: image.url,
        alt: image.alt || '',
        sortOrder:
          image.sortOrder,
      })
    ),
  };

  return (
    <ProductForm
      mode="edit"
      product={
        serializedProduct
      }
      categories={categories}
      brands={brands}
    />
  );
}