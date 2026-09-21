import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { deleteImage, publicIdFromCloudinaryUrl } from '@/lib/cloudinary';
import { z } from 'zod';
import { invalidatePublicCache } from '@/lib/cache-tags';

const comboItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive(),
});

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  price: z.preprocess((value) => value === '' || value === null || value === undefined ? null : value, z.coerce.number().nonnegative().nullable()).optional(),
  stock: z.coerce.number().int().nonnegative(),
  sku: z.preprocess((value) => typeof value === 'string' && value.trim() === '' ? undefined : value, z.string().min(1).optional()),
  attributeValueIds: z.array(z.string()).default([]),
});

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),

  slug: z.string().min(2, 'Slug must be at least 2 characters'),

  // SKU is OPTIONAL.
  // Empty string/null/undefined becomes undefined.
  sku: z.preprocess(
    (value) => {
      if (value === null || value === undefined) return undefined;

      if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? undefined : trimmed;
      }

      return value;
    },
    z.string().min(2, 'SKU must be at least 2 characters').optional()
  ),

  categoryId: z.string().min(1, 'Category is required'),

  regularPrice: z.preprocess(
    (value) => value === '' || value === null || value === undefined ? undefined : value,
    z.coerce.number().nonnegative('Regular price must be zero or greater.')
  ),

  salePrice: z.preprocess(
    (value) => value === '' || value === null || value === undefined ? null : value,
    z.coerce.number().nonnegative().nullable()
  ).optional(),

  costPrice: z.preprocess(
    (value) => value === '' || value === null || value === undefined ? null : value,
    z.coerce.number().nonnegative().nullable()
  ).optional(),

  stock: z.coerce.number().int().nonnegative(),

  lowStock: z.coerce.number().int().nonnegative().default(5),

  brand: z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? null : value,
    z.string().trim().nullable().optional()
  ),

  brandId: z.string().nullable().optional(),

  shortDescription: z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? null : value,
    z.string().max(191, 'Short description must be 191 characters or fewer.').nullable().optional()
  ),

  description: z.preprocess(
    (value) => typeof value === 'string' && value.trim() === '' ? null : value,
    z.string().nullable().optional()
  ),

  active: z.boolean().default(true),

  featured: z.boolean().default(false),

  // BOTH product types remain available.
  productType: z.enum(['SINGLE', 'COMBO']).default('SINGLE'),

  comboItems: z.array(comboItemSchema).default([]),

  variants: z.array(variantSchema).default([]),

  attributeValueIds: z.array(z.string()).default([]),

  images: z.array(
    z.object({
      id: z.string().optional(),
      url: z.string().min(1),
      alt: z.string().optional().nullable(),
      isPrimary: z.boolean().optional(),
    })
  ).default([]),
});

const detailInclude = {
  category: true,
  brandRelation: true,
  images: {
    orderBy: {
      sortOrder: 'asc',
    },
  },
  comboItems: {
    include: {
      includedProduct: {
        include: {
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      },
    },
  },
  variants: true,
  attributeValues: {
    include: {
      attributeValue: {
        include: { attribute: true },
      },
    },
  },
};

const imageRows = (images = []) =>
  images.map((image, index) => ({
    url: image.url,
    alt: image.alt || null,
    sortOrder: index,
  }));

/**
 * Generate a unique SKU.
 *
 * Existing manually entered SKUs are never changed.
 * This is only used when the admin leaves SKU empty.
 */
async function generateUniqueSku(tx) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    const sku = `KHB-${randomPart}`;

    const exists = await tx.product.findUnique({
      where: {
        sku,
      },
      select: {
        id: true,
      },
    });

    if (!exists) {
      return sku;
    }
  }

  throw new Error('Unable to generate a unique SKU. Please try again.');
}

async function generateUniqueVariantSku(tx, productSku) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const sku = `${productSku}-OPT-${attempt + 1}`;
    const exists = await tx.productVariant.findUnique({ where: { sku }, select: { id: true } });
    if (!exists) return sku;
  }
  throw new Error('Unable to generate a unique variant SKU.');
}

/**
 * Validate combo products.
 *
 * SINGLE:
 *   comboItems must be empty.
 *
 * COMBO:
 *   at least one product is required.
 */
async function validateComboItems(
  tx,
  type,
  comboItems = [],
  comboProductId = null
) {
  if (type === 'SINGLE' && comboItems.length > 0) {
    throw new Error('Single products cannot contain combo items.');
  }

  if (type === 'COMBO' && comboItems.length === 0) {
    throw new Error('A combo product must contain at least one product.');
  }

  const ids = comboItems.map((item) => item.productId);

  if (new Set(ids).size !== ids.length) {
    throw new Error('Duplicate combo products are not allowed.');
  }

  if (comboProductId && ids.includes(comboProductId)) {
    throw new Error('A product cannot be included in itself.');
  }

  if (!ids.length) {
    return;
  }

  const matches = await tx.product.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    select: {
      id: true,
      productType: true,
    },
  });

  if (matches.length !== ids.length) {
    throw new Error('One or more included products do not exist.');
  }

  // A combo should contain SINGLE products only.
  const comboInsideCombo = matches.some(
    (product) => product.productType === 'COMBO'
  );

  if (comboInsideCombo) {
    throw new Error('A combo product cannot contain another combo product.');
  }
}

async function validateAttributeSelections(tx, categoryId, attributeValueIds, variants = []) {
  const selectedIds = [...new Set(attributeValueIds)];
  if (!selectedIds.length && !variants.length) return;

  const values = await tx.attributeValue.findMany({
    where: { id: { in: [...new Set([...selectedIds, ...variants.flatMap((variant) => variant.attributeValueIds || [])])] }, active: true },
    select: { id: true, attribute: { select: { categories: { where: { categoryId }, select: { categoryId: true } } } } },
  });
  const categoryValueIds = new Set(values.filter((value) => value.attribute.categories.length > 0).map((value) => value.id));
  if (selectedIds.some((valueId) => !categoryValueIds.has(valueId))) {
    throw new Error('One or more selected product options are not configured for this category.');
  }

  for (const variant of variants) {
    if ((variant.attributeValueIds || []).some((valueId) => !selectedIds.includes(valueId))) {
      throw new Error('Each combination must use selected product options.');
    }
  }
}

/**
 * GET PRODUCTS
 *
 * Supports:
 * - search
 * - category
 * - brand
 * - productType
 *
 * Example:
 * /api/admin/products?productType=COMBO
 */
export async function GET(request) {
  try {
    await requirePermission('products.view');

    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q') || undefined;
    const categoryId = searchParams.get('categoryId') || undefined;
    const brandId = searchParams.get('brandId') || undefined;

    const productTypeParam = searchParams.get('productType');

    const productType =
      productTypeParam === 'SINGLE' || productTypeParam === 'COMBO'
        ? productTypeParam
        : undefined;

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(brandId ? { brandId } : {}),
        ...(productType ? { productType } : {}),

        ...(q
          ? {
              OR: [
                {
                  name: {
                    contains: q,
                  },
                },
                {
                  sku: {
                    contains: q,
                  },
                },
              ],
            }
          : {}),
      },

      include: detailInclude,

      orderBy: {
        createdAt: 'desc',
      },
    });

    return Response.json(products);
  } catch (error) {
    return jsonError(error);
  }
}

/**
 * CREATE PRODUCT
 */
export async function POST(request) {
  try {
    await requirePermission('products.create');

    const body = await request.json();

    const parsed = productSchema.parse(body);

    const {
      images,
      comboItems,
      variants,
      attributeValueIds,
      ...data
    } = parsed;

    const productId = await prisma.$transaction(async (tx) => {
      /**
       * SKU OPTIONAL
       *
       * If empty -> generate automatically.
       */
      const sku =
        data.sku ||
        await generateUniqueSku(tx);

      await validateComboItems(
        tx,
        data.productType,
        comboItems,
        null
      );

      await validateAttributeSelections(tx, data.categoryId, attributeValueIds, variants);

      /**
       * IMPORTANT:
       *
       * comboItems is NOT passed into product.create().
       */
      const created = await tx.product.create({
        data: {
          ...data,
          sku,

          images: {
            create: imageRows(images),
          },
          attributeValues: {
            create: attributeValueIds.map((attributeValueId) => ({ attributeValueId })),
          },
        },
      });

      for (const { id, attributeValueIds: variantValueIds = [], ...variant } of variants) {
        const createdVariant = await tx.productVariant.create({ data: { ...variant, sku: variant.sku || await generateUniqueVariantSku(tx, sku), productId: created.id } });
        if (variantValueIds.length) await tx.productVariantAttributeValue.createMany({ data: variantValueIds.map((attributeValueId) => ({ variantId: createdVariant.id, attributeValueId })) });
      }

      /**
       * Combo relation is stored separately.
       */
      if (
        data.productType === 'COMBO' &&
        comboItems.length > 0
      ) {
        await tx.productComboItem.createMany({
          data: comboItems.map((item) => ({
            comboProductId: created.id,
            includedProductId: item.productId,
            quantity: item.quantity,
          })),
        });
      }

      return created.id;
    }, {
      maxWait: 10000,
      timeout: 15000,
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: detailInclude,
    });

    invalidatePublicCache('products', 'homepage', 'seo');
    return Response.json(product, {
      status: 201,
    });
  } catch (error) {
    return jsonError(error);
  }
}

/**
 * UPDATE PRODUCT
 */
export async function PATCH(request) {
  try {
    await requirePermission('products.edit');

    const body = await request.json();

    const {
      id,
      images,
      comboItems: submittedComboItems,
      variants: submittedVariants,
      attributeValueIds: submittedAttributeValueIds,
      ...input
    } = body;

    if (!id) {
      throw new Error('Product id is required.');
    }

    /**
     * Parse normal Product fields.
     *
     * comboItems and images are intentionally removed
     * before parsing Product data.
     */
    const data = productSchema
      .omit({
        comboItems: true,
        images: true,
        variants: true,
        attributeValueIds: true,
      })
      .partial()
      .parse(input);

    const removedImageUrls = new Set();
    const productId = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({
        where: {
          id,
        },
        select: {
          productType: true,
          sku: true,
          categoryId: true,
        },
      });

      if (!existing) {
        throw new Error('Product not found.');
      }

      const nextType =
        data.productType || existing.productType;

      /**
       * comboItems:
       *
       * null = frontend didn't submit comboItems.
       * array = frontend intentionally submitted comboItems.
       */
      const items =
        submittedComboItems === undefined
          ? null
          : z.array(comboItemSchema).parse(
              submittedComboItems
            );

      const variants = submittedVariants === undefined ? null : z.array(variantSchema).parse(submittedVariants);
      const attributeValueIds = submittedAttributeValueIds === undefined ? null : z.array(z.string()).parse(submittedAttributeValueIds);

      const categoryId = data.categoryId || existing.categoryId;

      /**
       * Validate only when comboItems were submitted.
       */
      if (items !== null) {
        await validateComboItems(
          tx,
          nextType,
          items,
          id
        );
      }

      if (attributeValueIds !== null || variants !== null || data.categoryId) {
        await validateAttributeSelections(tx, categoryId, attributeValueIds || [], variants || []);
      }

      /**
       * If changing to SINGLE, comboItems must not remain.
       */
      if (
        data.productType === 'SINGLE'
      ) {
        await validateComboItems(
          tx,
          'SINGLE',
          [],
          id
        );
      }

      /**
       * SKU handling:
       *
       * - New valid SKU -> update it.
       * - Empty SKU -> preserve existing SKU.
       * - Undefined SKU -> preserve existing SKU.
       */
      const updateData = {
        ...data,
      };

      if (
        updateData.sku === undefined ||
        updateData.sku === null ||
        updateData.sku === ''
      ) {
        delete updateData.sku;
      }

      /**
       * IMPORTANT:
       *
       * comboItems NEVER enters product.update().
       */
      await tx.product.update({
        where: {
          id,
        },
        data: updateData,
      });

      /**
       * IMAGE UPDATE
       *
       * Only replace images if images were explicitly
       * submitted by the frontend.
       *
       * If images is undefined:
       * existing images stay untouched.
       */
      if (images !== undefined) {
        const parsedImages = z.array(
          z.object({
            id: z.string().optional(),
            url: z.string().min(1),
            alt: z.string().optional().nullable(),
            isPrimary: z.boolean().optional(),
          })
        ).parse(images);

        const existingImages = await tx.productImage.findMany({
          where: { productId: id },
          select: { id: true, url: true },
        });
        const existingImageIds = new Set(existingImages.map((image) => image.id));
        const submittedExistingIds = new Set(
          parsedImages
            .map((image) => image.id)
            .filter((imageId) => imageId && existingImageIds.has(imageId))
        );

        for (const image of existingImages) {
          if (!submittedExistingIds.has(image.id)) removedImageUrls.add(image.url);
        }

        await tx.productImage.deleteMany({
          where: {
            productId: id,
            ...(submittedExistingIds.size > 0
              ? { id: { notIn: [...submittedExistingIds] } }
              : {}),
          },
        });

        for (const [sortOrder, image] of parsedImages.entries()) {
          const imageData = {
            url: image.url,
            alt: image.alt || null,
            sortOrder,
          };

          if (image.id && existingImageIds.has(image.id)) {
            await tx.productImage.update({
              where: { id: image.id },
              data: imageData,
            });
          } else {
            await tx.productImage.create({
              data: { ...imageData, productId: id },
            });
          }
        }
      }

      if (variants !== null) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length) {
          for (const { id: variantId, attributeValueIds: variantValueIds = [], ...variant } of variants) {
            const createdVariant = await tx.productVariant.create({ data: { ...variant, sku: variant.sku || await generateUniqueVariantSku(tx, existing.sku), productId: id } });
            if (variantValueIds.length) await tx.productVariantAttributeValue.createMany({ data: variantValueIds.map((attributeValueId) => ({ variantId: createdVariant.id, attributeValueId })) });
          }
        }
      }

      if (attributeValueIds !== null) {
        await tx.productAttributeValue.deleteMany({ where: { productId: id } });
        if (attributeValueIds.length) await tx.productAttributeValue.createMany({ data: attributeValueIds.map((attributeValueId) => ({ productId: id, attributeValueId })) });
      }

      /**
       * COMBO ITEMS
       *
       * Only replace them when frontend explicitly
       * submitted comboItems.
       */
      if (items !== null) {
        await tx.productComboItem.deleteMany({
          where: {
            comboProductId: id,
          },
        });

        if (
          nextType === 'COMBO' &&
          items.length > 0
        ) {
          await tx.productComboItem.createMany({
            data: items.map((item) => ({
              comboProductId: id,
              includedProductId: item.productId,
              quantity: item.quantity,
            })),
          });
        }
      }

      /**
       * If product was changed to SINGLE,
       * remove any old combo relations.
       */
      if (nextType === 'SINGLE') {
        await tx.productComboItem.deleteMany({
          where: {
            comboProductId: id,
          },
        });
      }

      return id;
    }, {
      maxWait: 10000,
      timeout: 15000,
    });

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: detailInclude,
    });

    for (const imageUrl of removedImageUrls) {
      const publicId = publicIdFromCloudinaryUrl(imageUrl);
      if (publicId) await deleteImage(publicId).catch(() => {});
    }

    invalidatePublicCache('products', 'homepage', 'seo');
    return Response.json(product);
  } catch (error) {
    return jsonError(error);
  }
}

/**
 * SOFT DELETE
 */
export async function DELETE(request) {
  try {
    await requirePermission('products.delete');

    const id = new URL(request.url).searchParams.get('id');

    if (!id) {
      throw new Error('Product id is required.');
    }

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
    });

    invalidatePublicCache('products', 'homepage', 'seo');
    return Response.json(product);
  } catch (error) {
    return jsonError(error);
  }
}