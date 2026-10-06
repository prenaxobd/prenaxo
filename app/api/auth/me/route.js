import { NextResponse } from 'next/server';
import { createSession, getCurrentUser } from '@/lib/auth';

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

    await createSession(user.id, { rememberMe: true });

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
        headers: {
          'Cache-Control': 'no-store',
        },
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