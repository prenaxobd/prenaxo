import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { clearThrottle, createAdminSession, getThrottle, logSecurityEvent, recordThrottleFailure } from '@/lib/auth';

const GENERIC_ERROR = 'Invalid email or password.';

export async function POST(request) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || 'unknown';
  const keyPrefix = `admin-login:${ip}`;

  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const rememberMe = body.rememberMe === true;
    const throttleKey = `${keyPrefix}:${email || 'unknown'}`;
    const throttle = await getThrottle(throttleKey);

    if (throttle?.lockedUntil && throttle.lockedUntil > new Date()) {
      await logSecurityEvent('admin_login_rate_limited');
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const user = email ? await prisma.user.findUnique({ where: { email } }) : null;
    const valid = Boolean(user?.passwordHash) && user.adminAuthRole === 'main_admin' && user.role === 'ADMIN' && await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await recordThrottleFailure(throttleKey);
      await logSecurityEvent('admin_login_failed', user?.id || null);
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    await clearThrottle(throttleKey);
    await createAdminSession(user.id, rememberMe);
    await logSecurityEvent('admin_login_success', user.id);
    return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: 'main_admin' } });
  } catch {
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }
}