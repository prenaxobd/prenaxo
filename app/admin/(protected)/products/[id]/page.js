import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductView from '@/components/admin/ProductView';

export default async function EditProductPage({ params }) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
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
      variants: {
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: {
                  attribute: true,
                },
              },
            },
          },
        },
      },
      attributeValues: {
        include: {
          attributeValue: {
            include: {
              attribute: true,
            },
          },
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
    },
  });

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

  };

  return <ProductView product={serializedProduct} />;
}