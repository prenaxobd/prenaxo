import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import UserManager from '@/components/admin/UserManager';
import { requirePermission } from '@/lib/admin';

export default async function Users() {
  try {
    await requirePermission('admin_users.view');
  } catch {
    redirect('/admin/login?next=/admin/users');
  }

  const [users, roles] = await Promise.all([
    prisma.user.findMany({ where: { adminAuthRole: { not: null } }, select: { id: true, name: true, email: true, phone: true, image: true, role: true, adminActive: true, adminAuthRole: true, createdAt: true, adminRoles: { where: { isActive: true }, select: { role: { select: { key: true, name: true } } } }, _count: { select: { orders: true } } }, orderBy: { createdAt: 'desc' } }),
    prisma.adminRole.findMany({ where: { isActive: true }, select: { key: true, name: true }, orderBy: { name: 'asc' } }),
  ]);
  return <UserManager initialUsers={users} roles={roles} />;
}
