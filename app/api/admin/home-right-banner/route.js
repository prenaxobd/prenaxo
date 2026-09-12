import { prisma } from '@/lib/prisma';
import {
  requirePermission,
  jsonError,
} from '@/lib/admin';
import { z } from 'zod';

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

    const banner =
      await prisma.homeRightBanner.findFirst({
        orderBy: {
          updatedAt: 'desc',
        },
      });

    return Response.json(
      banner
    );
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

    /*
     * Only one active right banner.
     * Deactivate any existing active banner
     * before saving the new one.
     */
    if (input.isActive) {
      await prisma.homeRightBanner.updateMany(
        {
          where: {
            isActive: true,
          },
          data: {
            isActive: false,
          },
        }
      );
    }

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

    if (input.isActive) {
      await prisma.homeRightBanner.updateMany(
        {
          where: {
            isActive: true,
            NOT: {
              id: body.id,
            },
          },
          data: {
            isActive: false,
          },
        }
      );
    }

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

    return Response.json(banner);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE() {
  try {
    await requireRightBannerPermission(
      'delete'
    );

    const banner =
      await prisma.homeRightBanner.findFirst({
        orderBy: {
          updatedAt: 'desc',
        },
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

    return Response.json({
      success: true,
    });
  } catch (error) {
    return jsonError(error);
  }
}