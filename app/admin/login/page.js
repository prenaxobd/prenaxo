import { notFound } from 'next/navigation';
import { getAdminSession, getCurrentUser } from '@/lib/auth';
import { isAuthorizedAdminIdentity } from '@/lib/admin';
import { getAdminInvite } from '@/lib/admin-invites';
import AdminLoginForm from '@/components/admin/AdminLoginForm';

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const [identity, adminSession] = await Promise.all([getCurrentUser(), getAdminSession()]);
  const invite = await getAdminInvite(params?.invite);
  const authorized = Boolean(invite) || await isAuthorizedAdminIdentity(identity) || Boolean(adminSession?.user);
  if (!authorized) notFound();
  return <AdminLoginForm inviteToken={params?.invite || ''} initialEmail={invite?.user?.email || ''} />;
}
