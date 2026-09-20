import { getCurrentUser, createAdminSession, isPermanentAdminEmail } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const user = await getCurrentUser();
  if (!user || !isPermanentAdminEmail(user.email)) {
    return Response.json({ error: 'Admin authentication required.' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN', adminAuthRole: 'main_admin', adminActive: true },
  });
  await createAdminSession(user.id);

  return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: 'main_admin' } });
}