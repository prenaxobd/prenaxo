import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session?.user) return Response.json({ user: null }, { status: 401 });
  return Response.json({ user: { id: session.user.id, name: session.user.name, email: session.user.email, role: session.user.adminAuthRole } });
}