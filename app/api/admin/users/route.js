import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ensureDefaultAdminRBAC, isMainAdmin, jsonError, requirePermission, requireSuperAdmin, recordAdminActivity } from '@/lib/admin';
import { revokeAllAdminSessions } from '@/lib/auth';
import { createAdminInvite, revokeAdminInvites } from '@/lib/admin-invites';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'STORE_MANAGER', 'STAFF', 'EDITOR', 'ADMINISTRATOR', 'MANAGER', 'CONTENT_MANAGER', 'ORDER_MANAGER'];

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    adminActive: user.adminActive,
    adminAuthRole: user.adminAuthRole,
    createdAt: user.createdAt,
    adminRoles: user.adminRoles,
    _count: user._count,
  };
}

export async function GET() {
  try {
    await requirePermission('admin_users.view');
    await ensureDefaultAdminRBAC();
    const users = await prisma.user.findMany({
      where: { adminAuthRole: { not: null } },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        adminActive: true, adminAuthRole: true, createdAt: true,
        adminRoles: { where: { isActive: true }, select: { role: { select: { key: true, name: true } } } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return Response.json(users);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const admin = await requireSuperAdmin();
    await ensureDefaultAdminRBAC();
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || '');
    const roleKey = String(body.roleKey || 'STAFF').trim().toUpperCase();

    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
      throw new Error('Name, valid email, and a password of at least 8 characters are required.');
    }
    if (!ADMIN_ROLES.includes(roleKey) || roleKey === 'SUPER_ADMIN') {
      throw new Error('Only the protected root account can hold the Super Admin role.');
    }
    if (email === 'prenaxo@gmail.com') throw new Error('The protected Super Admin email is reserved.');
    if (await prisma.user.findUnique({ where: { email } })) throw new Error('A user with this email already exists.');

    const selectedRole = await prisma.adminRole.findUnique({ where: { key: roleKey } });
    if (!selectedRole || !selectedRole.isActive) throw new Error('Select a valid active admin role.');

    const user = await prisma.user.create({
      data: {
        name, email, phone: body.phone ? String(body.phone).trim() : null,
        passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN',
        adminAuthRole: 'admin_user', adminActive: true,
        adminRoles: { create: { adminRoleId: selectedRole.id } },
      },
      include: { adminRoles: { where: { isActive: true }, select: { role: { select: { key: true, name: true } } } }, _count: { select: { orders: true } } },
    });
    const inviteToken = await createAdminInvite(user.id);
    await recordAdminActivity(admin.id, 'create', 'admin_user', user.id, { roleKey });
    return Response.json({
      ...publicUser(user),
      inviteUrl: `${process.env.NEXTAUTH_URL || new URL(request.url).origin}/admin/login?invite=${encodeURIComponent(inviteToken)}`,
    }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    const admin = await requireSuperAdmin();
    const body = await request.json();
    const id = String(body.id || '');
    const target = await prisma.user.findUnique({ where: { id }, include: { adminRoles: { where: { isActive: true }, include: { role: true } } } });
    if (!target || !target.adminAuthRole) throw new Error('Admin user not found.');
    if (isMainAdmin(target)) throw new Error('The protected Super Admin cannot be modified here.');

    const requestedRole = String(body.roleKey || target.adminRoles[0]?.role?.key || 'STAFF').toUpperCase();
    const active = body.adminActive !== false;
    const selectedRole = active ? await prisma.adminRole.findUnique({ where: { key: requestedRole } }) : null;
    if (active && (!selectedRole || !selectedRole.isActive || requestedRole === 'SUPER_ADMIN')) throw new Error('Select a valid non-root admin role.');

    const nextEmail = body.email ? normalizeEmail(body.email) : target.email;
    if (!/^\S+@\S+\.\S+$/.test(nextEmail)) throw new Error('Enter a valid email address.');
    if (body.password !== undefined && String(body.password).length < 8) throw new Error('Password must be at least 8 characters.');
    if (nextEmail === 'prenaxo@gmail.com') throw new Error('The protected Super Admin email is reserved.');
    const duplicate = await prisma.user.findFirst({ where: { email: nextEmail, NOT: { id } } });
    if (duplicate) throw new Error('A user with this email already exists.');
    const data = {
      ...(body.name ? { name: String(body.name).trim() } : {}),
      ...(body.email ? { email: nextEmail } : {}),
      ...(body.phone !== undefined ? { phone: body.phone ? String(body.phone).trim() : null } : {}),
      ...(body.password ? { passwordHash: await bcrypt.hash(String(body.password), 12) } : {}),
      role: 'ADMIN', adminAuthRole: 'admin_user', adminActive: active,
    };
    const updated = await prisma.$transaction(async tx => {
      const next = await tx.user.update({ where: { id }, data, include: { adminRoles: { where: { isActive: true }, select: { role: { select: { key: true, name: true } } } }, _count: { select: { orders: true } } } });
      await tx.adminUserRole.updateMany({ where: { userId: id }, data: { isActive: false } });
      if (active) await tx.adminUserRole.upsert({ where: { userId_adminRoleId: { userId: id, adminRoleId: selectedRole.id } }, update: { isActive: true }, create: { userId: id, adminRoleId: selectedRole.id } });
      return next;
    });
    if (!active || body.password || body.roleKey) await revokeAllAdminSessions(id);
    if (!active) await revokeAdminInvites(id);
    await recordAdminActivity(admin.id, 'update', 'admin_user', id, { active, roleKey: active ? requestedRole : null });
    return Response.json(publicUser(updated));
  } catch (error) {
    return jsonError(error);
  }
}