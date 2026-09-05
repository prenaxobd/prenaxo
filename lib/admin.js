import { getCurrentUser } from './auth';
import { prisma } from './prisma';
import { ALL_ADMIN_PERMISSIONS, ADMIN_ROLE_TEMPLATES } from './permissions';

const DEFAULT_ADMIN_ROLE_KEY = 'SUPER_ADMIN';

export async function ensureDefaultAdminRBAC() {
  const permissions = await Promise.all(
    ALL_ADMIN_PERMISSIONS.map(async (key) => {
      const existing = await prisma.adminPermission.findUnique({ where: { key } });
      if (existing) return existing;
      return prisma.adminPermission.create({
        data: {
          key,
          label: key.replace(/\./g, ' ').replace(/\b\w/g, (value) => value.toUpperCase()),
          module: key.split('.')[0],
          description: `Permission for ${key}`,
        },
      });
    })
  );

  const superAdminRole = await prisma.adminRole.upsert({
    where: { key: DEFAULT_ADMIN_ROLE_KEY },
    update: { isActive: true },
    create: {
      key: DEFAULT_ADMIN_ROLE_KEY,
      name: 'Super Admin',
      description: 'Full access over the platform.',
      isSystem: true,
      isActive: true,
    },
  });

  for (const permission of permissions) {
    const relationExists = await prisma.adminRolePermission.findUnique({
      where: {
        adminRoleId_permissionId: {
          adminRoleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
    });

    if (!relationExists) {
      await prisma.adminRolePermission.create({
        data: {
          adminRoleId: superAdminRole.id,
          permissionId: permission.id,
        },
      });
    }
  }

  for (const [key, template] of Object.entries(ADMIN_ROLE_TEMPLATES)) {
    const role = await prisma.adminRole.upsert({
      where: { key },
      update: { name: template.label, description: template.description, isActive: true },
      create: { key, name: template.label, description: template.description, isSystem: true },
    });
    for (const permissionKey of template.permissions) {
      const permission = permissions.find(item => item.key === permissionKey);
      if (!permission) continue;
      await prisma.adminRolePermission.upsert({
        where: { adminRoleId_permissionId: { adminRoleId: role.id, permissionId: permission.id } },
        update: {},
        create: { adminRoleId: role.id, permissionId: permission.id },
      });
    }
  }

  return { superAdminRole, permissions };
}

export async function recordAdminActivity(adminId, action, entity, entityId, metadata) {
  return prisma.adminActivity.create({ data: { adminId, action, entity, entityId, metadata } });
}

export async function ensureUserHasSuperAdminRole(user) {
  if (!user || user.role !== 'ADMIN') return;

  await ensureDefaultAdminRBAC();

  const superAdminRole = await prisma.adminRole.findUnique({
    where: { key: DEFAULT_ADMIN_ROLE_KEY },
  });

  if (!superAdminRole) return;

  await prisma.adminUserRole.upsert({
    where: {
      userId_adminRoleId: {
        userId: user.id,
        adminRoleId: superAdminRole.id,
      },
    },
    update: { isActive: true },
    create: {
      userId: user.id,
      adminRoleId: superAdminRole.id,
      isActive: true,
    },
  });
}

export async function getUserPermissions(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      adminRoles: {
        where: { isActive: true },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) return new Set();
  if (user.role === 'ADMIN') {
    return new Set(ALL_ADMIN_PERMISSIONS);
  }

  const permissionSet = new Set();

  for (const assignment of user.adminRoles || []) {
    if (!assignment.isActive || !assignment.role?.isActive) continue;
    for (const relation of assignment.role.permissions || []) {
      permissionSet.add(relation.permission.key);
    }
  }

  return permissionSet;
}

export async function hasPermission(user, permission) {
  if (!user) return false;
  if (user.role === 'ADMIN') return true;

  const permissions = await getUserPermissions(user.id);
  return permissions.has(permission);
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) throw new Error('ADMIN_REQUIRED');

  const hasAnyAdminAccess = user.role === 'ADMIN' || !!(await prisma.adminUserRole.findFirst({
    where: {
      userId: user.id,
      isActive: true,
      role: { isActive: true },
    },
  }));

  if (!hasAnyAdminAccess) {
    throw new Error('ADMIN_REQUIRED');
  }

  await ensureDefaultAdminRBAC();
  await ensureUserHasSuperAdminRole(user);
  return user;
}

export async function requirePermission(permission) {
  const user = await requireAdmin();
  if (user.role === 'ADMIN') return user;

  const permissionSet = await getUserPermissions(user.id);
  if (!permissionSet.has(permission)) {
    throw new Error('PERMISSION_REQUIRED');
  }

  return user;
}

export async function requirePermissionSet(permissions = []) {
  const user = await requireAdmin();
  if (user.role === 'ADMIN') return user;
  const granted = await getUserPermissions(user.id);
  if (!permissions.some(permission => granted.has(permission))) throw new Error('PERMISSION_REQUIRED');
  return user;
}

export async function requireAnyPermission(permissions = []) {
  const user = await requireAdmin();
  if (user.role === 'ADMIN') return user;

  const permissionSet = await getUserPermissions(user.id);
  const allowed = permissions.some((permission) => permissionSet.has(permission));

  if (!allowed) {
    throw new Error('PERMISSION_REQUIRED');
  }

  return user;
}

export function jsonError(error) {
  let message = String(error?.message || 'Request failed.');

  if (error?.name === 'ZodError' && Array.isArray(error.issues)) {
    message = error.issues
      .map((issue) => issue.message)
      .filter(Boolean)
      .join(' ') || 'Some product fields are invalid.';
  } else if (error?.code === 'P2002') {
    const fields = error.meta?.target;
    message = Array.isArray(fields) && fields.includes('sku')
      ? 'That SKU is already in use.'
      : 'A product with these details already exists.';
  }

  const status = message === 'ADMIN_REQUIRED' || message === 'PERMISSION_REQUIRED' ? 403 : 400;

  return Response.json({
    error: status === 403 ? 'You do not have permission to perform this action.' : message,
  }, { status });
}
