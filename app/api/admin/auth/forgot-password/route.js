import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';
import { hashToken, logSecurityEvent } from '@/lib/auth';

export async function POST(request) {
  const generic = { message: 'If an account matches that email, password reset instructions will be sent.' };
  try {
    const { email } = await request.json();
    const user = await prisma.user.findUnique({
      where: { email: String(email || '').trim().toLowerCase() },
      include: { adminRoles: { where: { isActive: true }, include: { role: { select: { isActive: true } } } } },
    });
    const hasActiveRole = user?.adminRoles?.some(assignment => assignment.role?.isActive);
    if (!user || user.role !== 'ADMIN' || !user.adminAuthRole || !user.adminActive || !hasActiveRole) return Response.json(generic);
    const rawToken = crypto.randomBytes(32).toString('base64url');
    await prisma.adminPasswordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    await prisma.adminPasswordResetToken.create({ data: { userId: user.id, tokenHash: hashToken(rawToken), expiresAt: new Date(Date.now() + 30 * 60 * 1000) } });
    if (process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
      const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } });
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      await transporter.sendMail({ from: process.env.SMTP_USER, to: user.email, subject: 'Prenaxo admin password reset', text: `Reset your password: ${baseUrl}/admin/reset-password?token=${rawToken}` });
    }
    await logSecurityEvent('admin_password_reset_requested', user.id);
    return Response.json(generic);
  } catch {
    return Response.json(generic);
  }
}