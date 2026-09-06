import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logSecurityEvent, revokeAdminSession } from '@/lib/auth';

export async function POST() {

  await revokeAdminSession();
  await logSecurityEvent('logout').catch(() => {});

  const cookieStore = await cookies();

  cookieStore.set(
    'khatibazar_session',
    '',
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    }
  );

  return NextResponse.json({
    success: true,
  });
}