import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';
import { deleteImage, publicIdFromCloudinaryUrl } from '@/lib/cloudinary';

const schema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z
    .string()
    .nullable()
    .optional(),
  logo: z
    .string()
    .trim()
    .nullable()
    .optional(),
  website: z
    .string()
    .trim()
    .nullable()
    .optional(),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
});

export async function GET() {
  try {
    await requirePermission('brands.view');

    const brands = await prisma.brand.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return Response.json(brands);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requirePermission('brands.create');

    const body = await request.json();

    const input = schema.parse({
      ...body,
      logo:
        typeof body.logo === 'string' &&
        body.logo.trim()
          ? body.logo.trim()
          : null,
      website:
        typeof body.website === 'string' &&
        body.website.trim()
          ? body.website.trim()
          : null,
    });

    const brand = await prisma.brand.create({
      data: input,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return Response.json(brand, {
      status: 201,
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    await requirePermission('brands.edit');

    const body = await request.json();

    const { id, ...rawInput } = body;

    if (!id) {
      throw new Error('Brand id is required.');
    }

    const input = schema.partial().parse({
      ...rawInput,
      logo:
        rawInput.logo === ''
          ? null
          : rawInput.logo,
      website:
        rawInput.website === ''
          ? null
          : rawInput.website,
    });

    const existing = await prisma.brand.findUnique({ where: { id }, select: { logo: true, image: true } });
    const brand = await prisma.brand.update({
      where: {
        id,
      },
      data: input,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (existing?.logo && existing.logo !== brand.logo) {
      const publicId = publicIdFromCloudinaryUrl(existing.logo);
      if (publicId) await deleteImage(publicId).catch(() => {});
    }
    if (existing?.image && existing.image !== brand.image) {
      const publicId = publicIdFromCloudinaryUrl(existing.image);
      if (publicId) await deleteImage(publicId).catch(() => {});
    }
    return Response.json(brand);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    await requirePermission('brands.delete');

    const id = new URL(request.url).searchParams.get(
      'id'
    );

    if (!id) {
      throw new Error('Brand id is required.');
    }

    const brand = await prisma.brand.update({
      where: {
        id,
      },
      data: {
        active: false,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return Response.json(brand);
  } catch (error) {
    return jsonError(error);
  }
}

