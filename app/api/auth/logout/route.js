import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logSecurityEvent, revokeAdminSession } from '@/lib/auth';

export async function POST() {

  try {
    await revokeAdminSession();
  } catch (error) {
    console.error('POST /api/auth/logout admin session revocation failed:', error);
  }
  await logSecurityEvent('logout').catch(() => {});

  const cookieStore = await cookies();

  cookieStore.set(
    'prenaxo_session',
    '',
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
      path: '/',
    }
  );
  cookieStore.set('khatibazar_session', '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' });
  for (const { name } of cookieStore.getAll()) {
    if (
      name === 'next-auth.session-token' ||
      name.startsWith('next-auth.session-token.') ||
      name === '__Secure-next-auth.session-token' ||
      name.startsWith('__Secure-next-auth.session-token.')
    ) {
      cookieStore.set(name, '', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
      });
    }
  }

  return NextResponse.json({
    success: true,
  });
}