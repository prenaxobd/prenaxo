import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requirePermission, recordAdminActivity, jsonError } from '@/lib/admin';

export async function GET() {
  try {
    await requirePermission('admin_users.view');
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true, adminRoles: { where: { isActive: true }, select: { role: { select: { key: true, name: true } } } }, _count: { select: { orders: true } } }, orderBy: { createdAt: 'desc' } });
    return Response.json(users);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request) {
  try {
    const admin = await requirePermission('admin_users.create');
    const { name, email, phone, password, role = 'ADMIN', roleKey = 'ADMINISTRATOR' } = await request.json();

    if (!name || !email || !password) throw new Error('Name, email, and password are required.');
    if (!['ADMIN', 'USER'].includes(role)) throw new Error('Invalid role.');
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error('A user with this email already exists.');

    const selectedRole = await prisma.adminRole.findUnique({ where: { key: roleKey } });
    if (role === 'ADMIN' && !selectedRole) throw new Error('Select a valid admin role.');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash: await bcrypt.hash(password, 12),
        role,
      },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });
    if (selectedRole) await prisma.adminUserRole.create({ data: { userId: user.id, adminRoleId: selectedRole.id } });
    await recordAdminActivity(admin.id, 'create', 'admin_user', user.id, { role, roleKey });

    return Response.json(user, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(request) {
  try {
    const admin = await requirePermission('admin_users.manage_permissions');
    const { id, role, roleKey } = await request.json();
    if (!['USER', 'ADMIN'].includes(role)) throw new Error('Invalid role.');
    if (id === admin.id && role !== 'ADMIN') throw new Error('You cannot remove your own admin access.');
    const updated = await prisma.user.update({ where: { id }, data: { role }, select: { id: true, name: true, email: true, role: true } });
    if (role === 'ADMIN') {
      const selectedRole = await prisma.adminRole.findUnique({ where: { key: roleKey || 'ADMINISTRATOR' } });
      if (!selectedRole) throw new Error('Select a valid admin role.');
      await prisma.adminUserRole.updateMany({ where: { userId: id }, data: { isActive: false } });
      await prisma.adminUserRole.upsert({ where: { userId_adminRoleId: { userId: id, adminRoleId: selectedRole.id } }, update: { isActive: true }, create: { userId: id, adminRoleId: selectedRole.id } });
    }
    await recordAdminActivity(admin.id, 'update', 'admin_user', id, { role, roleKey });
    return Response.json(updated);
  } catch (error) {
    return jsonError(error);
  }
}
