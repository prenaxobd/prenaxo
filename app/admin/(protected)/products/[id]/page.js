import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({ params }) {
  const { id } = await params;

  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({
      where: {
        id,
      },
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
        },
        variants: true,
        comboItems: {
          include: {
            includedProduct: {
              select: { id: true, name: true, sku: true, images: { orderBy: { sortOrder: 'asc' } } },
            },
          },
        },
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
    lowStock: Number(product.lowStock || 5),

    images: product.images.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt || '',
      sortOrder: image.sortOrder,
    })),

    variants: product.variants.map((variant) => ({
      ...variant,
      price:
        variant.price == null
          ? ''
          : String(variant.price),
    })),

    comboItems: product.comboItems.map((item) => ({
      includedProductId: item.includedProductId,
      quantity: item.quantity,
      includedProduct: {
        id: item.includedProduct.id,
        name: item.includedProduct.name,
        sku: item.includedProduct.sku,
        images: item.includedProduct.images,
      },
    })),
  };

  return (
    <ProductForm
      mode="edit"
      product={serializedProduct}
      categories={categories}
      brands={brands}
    />
  );
}