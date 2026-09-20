import { prisma } from '@/lib/prisma';
import {
  requirePermission,
  jsonError,
} from '@/lib/admin';
import { z } from 'zod';
import { deleteImage, publicIdFromCloudinaryUrl } from '@/lib/cloudinary';

const schema = z.object({
  image: z.string().min(1),
  link: z.string().nullable().optional(),
  sortOrder: z.coerce
    .number()
    .int()
    .min(0)
    .default(0),
  active: z.boolean().default(true),
});

async function requireBannerPermission(
  action
) {
  /*
   * Prefer dedicated banner permissions.
   *
   * If your current permission seed has not
   * created banners.* yet, temporarily use
   * the existing homepage/banner permission
   * that your project already defines.
   */
  return requirePermission(
    `banners.${action}`
  );
}

export async function GET() {
  try {
    await requireBannerPermission('view');

    const banners =
      await prisma.banner.findMany({
        orderBy: {
          sortOrder: 'asc',
        },
      });

    return Response.json(banners);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requireBannerPermission(
      'create'
    );

    const input = schema.parse(
      await request.json()
    );

    const banner =
      await prisma.banner.create({
        data: {
          image: input.image,
          desktopImage: input.image,
          link:
            input.link || null,
          sortOrder:
            input.sortOrder,
          active:
            input.active,

          /*
           * Legacy fields remain in DB for
           * compatibility but are intentionally
           * empty.
           */
          title: '',
          subtitle: null,
          mobileImage: null,
          buttonText: null,
          startAt: null,
          endAt: null,
        },
      });

    return Response.json(
      banner,
      { status: 201 }
    );
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    await requireBannerPermission(
      'edit'
    );

    const body =
      await request.json();

    const id = body.id;

    if (!id) {
      throw new Error(
        'Banner id is required.'
      );
    }

    const input =
      schema.partial().parse(body);

    const data = {};

    if (
      Object.prototype.hasOwnProperty.call(
        input,
        'image'
      )
    ) {
      data.image = input.image;
      data.desktopImage =
        input.image;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        input,
        'link'
      )
    ) {
      data.link =
        input.link || null;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        input,
        'sortOrder'
      )
    ) {
      data.sortOrder =
        input.sortOrder;
    }

    if (
      Object.prototype.hasOwnProperty.call(
        input,
        'active'
      )
    ) {
      data.active =
        input.active;
    }

    const existing = await prisma.banner.findUnique({ where: { id }, select: { image: true, desktopImage: true } });
    const banner =
      await prisma.banner.update({
        where: { id },
        data,
      });

    const previousUrls = new Set([existing?.image, existing?.desktopImage].filter(Boolean));
    const nextUrls = new Set([banner.image, banner.desktopImage].filter(Boolean));
    for (const previousUrl of previousUrls) {
      if (!nextUrls.has(previousUrl)) {
        const publicId = publicIdFromCloudinaryUrl(previousUrl);
        if (publicId) await deleteImage(publicId).catch(() => {});
      }
    }
    return Response.json(banner);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    await requireBannerPermission(
      'delete'
    );

    const id =
      new URL(request.url).searchParams.get(
        'id'
      );

    if (!id) {
      throw new Error(
        'Banner id is required.'
      );
    }

    const banner =
      await prisma.banner.findUnique({ where: { id }, select: { image: true, desktopImage: true } });
    const deleted =
      await prisma.banner.delete({
        where: { id },
      });

    for (const imageUrl of new Set([banner?.image, banner?.desktopImage].filter(Boolean))) {
      const publicId = publicIdFromCloudinaryUrl(imageUrl);
      if (publicId) await deleteImage(publicId).catch(() => {});
    }

    return Response.json(deleted);
  } catch (error) {
    return jsonError(error);
  }
}