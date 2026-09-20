import readline from 'node:readline';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { ALL_ADMIN_PERMISSIONS } from '../lib/permissions.js';
import { createAdminInvite } from '../lib/admin-invites.js';

const email = (process.env.ADMIN_EMAIL || 'prenaxo@gmail.com').trim().toLowerCase();
const legacyEmail = 'ponnomela5@gmail.com';

if (!email) {
  throw new Error('ADMIN_EMAIL is required.');
}

function readPassword() {
  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;
    const rl = readline.createInterface({ input, output });
    const muted = Boolean(input.isTTY && input.setRawMode);
    let password = '';

    output.write('Admin password: ');
    if (!muted) {
      rl.question('', (answer) => {
        rl.close();
        output.write('\n');
        resolve(answer);
      });
      return;
    }

    input.setRawMode(true);
    input.resume();
    input.on('data', (chunk) => {
      const key = chunk.toString('utf8');
      if (key === '\u0003') {
        input.setRawMode(false);
        rl.close();
        reject(new Error('Setup cancelled.'));
      } else if (key === '\r' || key === '\n') {
        input.setRawMode(false);
        rl.close();
        output.write('\n');
        resolve(password);
      } else if (key === '\u0008' || key === '\u007f') {
        password = password.slice(0, -1);
      } else {
        password += key;
      }
    });
  });
}

async function main() {
  const password = await readPassword();
  if (password.length < 8) throw new Error('Password must be at least 8 characters.');

  const permissions = await Promise.all(ALL_ADMIN_PERMISSIONS.map((key) => prisma.adminPermission.upsert({
    where: { key },
    update: {},
    create: {
      key,
      label: key.replace(/\./g, ' ').replace(/\b\w/g, (value) => value.toUpperCase()),
      module: key.split('.')[0],
      description: `Permission for ${key}`,
    },
  })));
  const superAdminRole = await prisma.adminRole.upsert({
    where: { key: 'SUPER_ADMIN' },
    update: { isActive: true },
    create: { key: 'SUPER_ADMIN', name: 'Super Admin', description: 'Full access over the platform.', isSystem: true, isActive: true },
  });
  await Promise.all(permissions.map((permission) => prisma.adminRolePermission.upsert({
    where: { adminRoleId_permissionId: { adminRoleId: superAdminRole.id, permissionId: permission.id } },
    update: {},
    create: { adminRoleId: superAdminRole.id, permissionId: permission.id },
  })));
  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = existing
    ? await prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, role: 'ADMIN', adminAuthRole: 'main_admin', adminActive: true },
        select: { id: true, email: true, role: true },
      })
    : await prisma.user.create({
        data: { name: 'Prenaxo Admin', email, passwordHash, role: 'ADMIN', adminAuthRole: 'main_admin', adminActive: true },
        select: { id: true, email: true, role: true },
      });

  await prisma.adminUserRole.upsert({
    where: { userId_adminRoleId: { userId: user.id, adminRoleId: superAdminRole.id } },
    update: { isActive: true },
    create: { userId: user.id, adminRoleId: superAdminRole.id, isActive: true },
  });

  const inviteToken = await createAdminInvite(user.id);

  if (legacyEmail !== email) {
    const legacy = await prisma.user.findUnique({ where: { email: legacyEmail } });
    if (legacy) {
      await prisma.user.update({ where: { id: legacy.id }, data: { role: 'USER', adminAuthRole: null, adminActive: false } });
      await prisma.adminUserRole.updateMany({ where: { userId: legacy.id }, data: { isActive: false } });
      await prisma.adminAuthSession.updateMany({ where: { userId: legacy.id, revokedAt: null }, data: { revokedAt: new Date() } });
    }
  }

  console.log(JSON.stringify({
    existsBeforeSetup: Boolean(existing),
    userExists: true,
    email: user.email,
    role: user.role,
    accountActive: true,
    adminRoleAssigned: true,
    inviteUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/login?invite=${encodeURIComponent(inviteToken)}`,
  }));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});