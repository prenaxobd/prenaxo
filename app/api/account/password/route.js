import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(request) {

  try {

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const currentPassword =
      String(body.currentPassword || '');

    const newPassword =
      String(body.newPassword || '');

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'All password fields are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        {
          error:
            'New password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            'This account does not have a password. Please use another login method.',
        },
        { status: 400 }
      );
    }

    const valid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!valid) {
      return NextResponse.json(
        {
          error: 'Current password is incorrect',
        },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(
      newPassword,
      12
    );

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully',
    });

  } catch (error) {

    console.error('PASSWORD ERROR:', error);

    return NextResponse.json(
      {
        error: 'Failed to change password',
      },
      { status: 500 }
    );
  }
}