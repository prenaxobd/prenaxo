
import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { requireAdmin, getUserPermissions, isAuthorizedAdminIdentity } from '@/lib/admin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export default async function AdminLayout({ children }) {
  let user;

  try {
    user = await requireAdmin();
  } catch (error) {
    const identity = await getCurrentUser();
    if (!await isAuthorizedAdminIdentity(identity)) notFound();
    redirect('/admin/login?next=/admin');
  }

  const permissions = [...await getUserPermissions(user.id)];

  return (
    <div className="admin-shell">
      <AdminSidebar permissions={permissions} />

      <div className="admin-content-shell">
        <AdminHeader user={user} />

        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}

