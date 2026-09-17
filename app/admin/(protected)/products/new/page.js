import { prisma } from '@/lib/prisma';
import ProductForm from '@/components/admin/ProductForm';

export default async function NewProductPage({
  searchParams,
}) {
  const params = await searchParams;

  const editId =
    params?.edit || '';

  const [categories, brands, product] =
    await Promise.all([
      prisma.category.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
        include: { attributes: { include: { attribute: { include: { values: { where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } } } } } },
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

      editId
        ? prisma.product.findUnique({
            where: {
              id: editId,
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
              variants: { include: { attributeValues: true } },
              attributeValues: true,
            },
          })
        : null,
    ]);

  if (
    editId &&
    !product
  ) {
    return (
      <div
        style={{
          padding: '40px',
        }}
      >
        <h1>
          Product not found
        </h1>

        <p>
          The product you are trying
          to edit does not exist.
        </p>
      </div>
    );
  }

  const serializedProduct =
    product
      ? {
          ...product,

          regularPrice:
            product.regularPrice ==
            null
              ? null
              : Number(
                  product.regularPrice
                ),

          salePrice:
            product.salePrice ==
            null
              ? null
              : Number(
                  product.salePrice
                ),

          costPrice:
            product.costPrice ==
            null
              ? null
              : Number(
                  product.costPrice
                ),

          createdAt:
            product.createdAt.toISOString(),

          updatedAt:
            product.updatedAt.toISOString(),

          images:
            product.images.map(
              (image, index) => ({
                ...image,

                sortOrder:
                  image.sortOrder ??
                  index,
              })
            ),
        }
      : null;

  return (
    <ProductForm
      mode={
        serializedProduct
          ? 'edit'
          : 'create'
      }
      product={
        serializedProduct
      }
      categories={
        categories
      }
      brands={brands}
    />
  );
}