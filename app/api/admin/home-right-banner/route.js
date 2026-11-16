import { prisma } from '@/lib/prisma';
import {
  requirePermission,
  jsonError,
} from '@/lib/admin';
import { z } from 'zod';
import { invalidatePublicCache } from '@/lib/cache-tags';

const schema = z.object({
  image: z.string().min(1),
  link: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

async function requireRightBannerPermission(
  action
) {
  return requirePermission(
    `banners.${action}`
  );
}

export async function GET() {
  try {
    await requireRightBannerPermission(
      'view'
    );

    const banners =
      await prisma.homeRightBanner.findMany({
        orderBy: {
          createdAt: 'asc',
        },
      });

    return Response.json(banners);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    await requireRightBannerPermission(
      'create'
    );

    const input = schema.parse(
      await request.json()
    );

    const banner =
      await prisma.homeRightBanner.create({
        data: {
          image: input.image,
          link:
            input.link || null,
          isActive:
            input.isActive,
        },
      });

    invalidatePublicCache('homepage');
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
    await requireRightBannerPermission(
      'edit'
    );

    const body =
      await request.json();

    if (!body.id) {
      throw new Error(
        'Right banner id is required.'
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
        'isActive'
      )
    ) {
      data.isActive =
        input.isActive;
    }

    const banner =
      await prisma.homeRightBanner.update({
        where: {
          id: body.id,
        },
        data,
      });

    invalidatePublicCache('homepage');
    return Response.json(banner);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request) {
  try {
    await requireRightBannerPermission(
      'delete'
    );

    const id = new URL(request.url).searchParams.get('id');
    const banner = id
      ? await prisma.homeRightBanner.findUnique({
          where: { id },
        })
      : await prisma.homeRightBanner.findFirst({
          orderBy: { updatedAt: 'desc' },
        });

    if (!banner) {
      return Response.json({
        success: true,
      });
    }

    await prisma.homeRightBanner.delete({
      where: {
        id: banner.id,
      },
    });

    invalidatePublicCache('homepage');
    return Response.json({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}