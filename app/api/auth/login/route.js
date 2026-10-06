import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
export async function POST(request) {
  try {
    const { identifier, email, password, rememberMe } = await request.json();
    const value = String(identifier || email || '').trim();
    const phoneVariants = [...new Set([
      value,
      value.replace(/[^0-9+]/g, ''),
      value.replace(/\D/g, ''),
    ])].filter(Boolean);
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: value.toLowerCase() },
          ...phoneVariants.map(phone => ({ phone })),
        ],
      },
    });

    if (!user?.passwordHash || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
      return NextResponse.json(
        { error: 'Invalid email/mobile number or password.' },
        { status: 401 }
      );
    }

    await createSession(user.id, { rememberMe: rememberMe === true });
    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error('POST /api/auth/login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 400 });
  }
}
