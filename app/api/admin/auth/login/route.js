import bcrypt from 'bcryptjs';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { clearThrottle, createAdminSession, getThrottle, isPermanentAdminEmail, logSecurityEvent, recordThrottleFailure } from '@/lib/auth';
import { ensureDefaultAdminRBAC } from '@/lib/admin';
import { getAdminInvite, consumeAdminInvite } from '@/lib/admin-invites';

const GENERIC_ERROR = 'Invalid email or password.';

export async function POST(request) {
  const requestHeaders = await headers();
  const ip = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || 'unknown';
  const keyPrefix = `admin-login:${ip}`;

  try {
    await ensureDefaultAdminRBAC();
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const invite = await getAdminInvite(body.inviteToken);
    const rememberMe = body.rememberMe === true;
    const throttleKey = `${keyPrefix}:${email || 'unknown'}`;
    const throttle = await getThrottle(throttleKey);

    if (throttle?.lockedUntil && throttle.lockedUntil > new Date()) {
      await logSecurityEvent('admin_login_rate_limited');
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const user = invite?.user || (email ? await prisma.user.findUnique({
      where: { email },
      include: { adminRoles: { where: { isActive: true }, include: { role: { select: { isActive: true } } } } },
    }) : null);
    if (invite && user.email.toLowerCase() !== email) {
      await recordThrottleFailure(throttleKey);
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }
    const hasActiveRole = user?.adminRoles?.some(assignment => assignment.role?.isActive);
    const valid = Boolean(user?.passwordHash) && (user.adminAuthRole || isPermanentAdminEmail(user?.email)) && user.adminActive && user.role === 'ADMIN' && (hasActiveRole || isPermanentAdminEmail(user.email)) && await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await recordThrottleFailure(throttleKey);
      await logSecurityEvent('admin_login_failed', user?.id || null);
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    if (body.inviteToken && !await consumeAdminInvite(body.inviteToken)) {
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    await clearThrottle(throttleKey);
    await createAdminSession(user.id, rememberMe);
    await logSecurityEvent('admin_login_success', user.id);
    return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.adminAuthRole } });
  } catch {
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }
}