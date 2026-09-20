import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { hashToken, logSecurityEvent, revokeAllAdminSessions } from '@/lib/auth';

export async function POST(request) {
  try {
    const { token, password } = await request.json();
    if (typeof token !== 'string' || typeof password !== 'string' || password.length < 8) return Response.json({ error: 'Invalid or expired reset request.' }, { status: 400 });
    const reset = await prisma.adminPasswordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: { include: { adminRoles: { where: { isActive: true }, include: { role: { select: { isActive: true } } } } } } },
    });
    const hasActiveRole = reset?.user?.adminRoles?.some(assignment => assignment.role?.isActive);
    if (!reset || reset.usedAt || reset.expiresAt <= new Date() || reset.user.role !== 'ADMIN' || !reset.user.adminAuthRole || !reset.user.adminActive || !hasActiveRole) return Response.json({ error: 'Invalid or expired reset request.' }, { status: 400 });
    await prisma.user.update({ where: { id: reset.userId }, data: { passwordHash: await bcrypt.hash(password, 12) } });
    await prisma.adminPasswordResetToken.update({ where: { id: reset.id }, data: { usedAt: new Date() } });
    await revokeAllAdminSessions(reset.userId);
    await logSecurityEvent('admin_password_reset_completed', reset.userId);
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Unable to reset password.' }, { status: 400 });
  }
}