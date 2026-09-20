import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import crypto from 'crypto';
import { deleteImage, publicIdFromCloudinaryUrl, uploadImage } from '@/lib/cloudinary';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export async function POST(request) {
  try {
    // =====================================================
    // AUTH
    // =====================================================

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized.',
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // FORM DATA
    // =====================================================

    const formData = await request.formData();

    // IMPORTANT:
    // ProfileForm sends "file"
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Please select an image.',
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // TYPE
    // =====================================================

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Only JPG, PNG and WebP images are allowed.',
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // SIZE
    // =====================================================

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Image size must be less than 5MB.',
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // UPLOAD DIRECTORY
    // =====================================================

    // =====================================================
    // FILE NAME
    // =====================================================

    const randomName = crypto
      .randomBytes(12)
      .toString('hex');

    const fileName =
      `${user.id}-${Date.now()}-${randomName}.${extension}`;

    const uploaded = await uploadImage(file, 'prenaxo/user', fileName.replace(`.${extension}`, ''));
    const imageUrl = uploaded.url;
    const previousImage = user.image;

    // =====================================================
    // DATABASE
    // =====================================================

    const updatedUser =
      await prisma.user.update({
        where: {
          id: user.id,
        },

        data: {
          image: imageUrl,
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
          role: true,
        },
      });

    // =====================================================
    // RESPONSE
    // =====================================================

    const previousPublicId = publicIdFromCloudinaryUrl(previousImage);
    if (previousPublicId && previousPublicId !== uploaded.publicId) {
      await deleteImage(previousPublicId).catch(() => {});
    }

    return NextResponse.json(
      {
        success: true,
        image: imageUrl,
        user: updatedUser,
      },
      {
        status: 200,
      }
    );

  } catch (error) {

    console.error(
      'PROFILE_IMAGE_UPLOAD_ERROR:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'Unable to upload profile image.',
      },
      {
        status: 500,
      }
    );
  }
}