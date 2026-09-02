import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          user: null,
        },
        {
          status: 200,
        }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image || null,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error('GET /api/auth/me error:', error);

    return NextResponse.json(
      {
        user: null,
      },
      {
        status: 500,
      }
    );
  }
}