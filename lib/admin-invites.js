import crypto from 'node:crypto';
import { prisma } from './prisma.js';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function hashAdminInviteToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

export async function createAdminInvite(userId) {
  const token = crypto.randomBytes(32).toString('base64url');
  await prisma.adminInviteToken.updateMany({
    where: { userId, usedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await prisma.adminInviteToken.create({
    data: {
      userId,
      tokenHash: hashAdminInviteToken(token),
      expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    },
  });
  return token;
}

export async function getAdminInvite(token) {
  if (!token) return null;
  const invite = await prisma.adminInviteToken.findUnique({
    where: { tokenHash: hashAdminInviteToken(token) },
    include: {
      user: {
        include: {
          adminRoles: { where: { isActive: true }, include: { role: { select: { isActive: true } } } },
        },
      },
    },
  });
  const hasActiveRole = invite?.user?.adminRoles?.some(assignment => assignment.role?.isActive);
  if (!invite || invite.usedAt || invite.revokedAt || invite.expiresAt <= new Date() || !invite.user.adminActive || invite.user.role !== 'ADMIN' || !invite.user.adminAuthRole || !hasActiveRole) return null;
  return invite;
}

export async function consumeAdminInvite(token) {
  if (!token) return false;
  const result = await prisma.adminInviteToken.updateMany({
    where: { tokenHash: hashAdminInviteToken(token), usedAt: null, revokedAt: null, expiresAt: { gt: new Date() } },
    data: { usedAt: new Date() },
  });
  return result.count === 1;
}

export async function revokeAdminInvites(userId) {
  return prisma.adminInviteToken.updateMany({
    where: { userId, usedAt: null, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}