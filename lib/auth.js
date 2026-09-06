import crypto from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';
const secretValue = process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV === 'production' ? null : 'development-only-secret');
const secret = secretValue ? new TextEncoder().encode(secretValue) : null;
export async function createSession(userId) {
	if (!secret) throw new Error('NEXTAUTH_SECRET is required in production.');
	const token = await new SignJWT({ userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret);
	(await cookies()).set('khatibazar_session', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 604800, path: '/' });
}
export async function getCurrentUser() { try { if (!secret) return null; const token = (await cookies()).get('khatibazar_session')?.value; if (!token) return null; const { payload } = await jwtVerify(token, secret); if (typeof payload.userId !== 'string') return null; return prisma.user.findUnique({ where: { id: payload.userId } }); } catch { return null; } }

const ADMIN_SESSION_COOKIE = 'ponnomela_admin_session';

function hashToken(token) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

async function requestContext() {
	const requestHeaders = await headers();
	return {
		ipAddress: requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim() || requestHeaders.get('x-real-ip') || null,
		userAgent: requestHeaders.get('user-agent') || null,
	};
}

export async function createAdminSession(userId, rememberMe = false) {
	const token = crypto.randomBytes(32).toString('base64url');
	const context = await requestContext();
	const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
	await prisma.adminAuthSession.create({ data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + maxAge * 1000), rememberMe, ...context } });
	(await cookies()).set(ADMIN_SESSION_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge, path: '/' });
}

export async function getAdminSession() {
	try {
		const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
		if (!token) return null;
		const session = await prisma.adminAuthSession.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
		if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.role !== 'ADMIN') return null;
		await prisma.adminAuthSession.update({ where: { id: session.id }, data: { lastUsedAt: new Date() } });
		return session;
	} catch { return null; }
}

export async function revokeAdminSession() {
	const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
	if (token) await prisma.adminAuthSession.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
	(await cookies()).set(ADMIN_SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 0, path: '/' });
}

export async function revokeAllAdminSessions(userId) {
	await prisma.adminAuthSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function logSecurityEvent(eventType, userId = null, metadata = null) {
	return prisma.securityEvent.create({ data: { eventType, userId, metadata, ...(await requestContext()) } });
}

export async function getThrottle(key) { return prisma.adminLoginThrottle.findUnique({ where: { key } }); }

export async function recordThrottleFailure(key) {
	const current = await prisma.adminLoginThrottle.upsert({ where: { key }, update: {}, create: { key } });
	const failures = current.failures + 1;
	const lockedUntil = failures >= 5 ? new Date(Date.now() + Math.min(15 * 60 * 1000, 2 ** Math.min(failures - 5, 5) * 30 * 1000)) : null;
	return prisma.adminLoginThrottle.update({ where: { key }, data: { failures, lockedUntil } });
}

export async function clearThrottle(key) { await prisma.adminLoginThrottle.deleteMany({ where: { key } }); }

export { ADMIN_SESSION_COOKIE, hashToken };
