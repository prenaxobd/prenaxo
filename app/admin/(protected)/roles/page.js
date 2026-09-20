import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ADMIN_ROLE_TEMPLATES } from '@/lib/permissions';
import { requirePermission } from '@/lib/admin';

export default async function RolesPage() {
  try {
    await requirePermission('admin_users.manage_permissions');
  } catch {
    redirect('/admin/login?next=/admin/roles');
  }

  const roles = Object.entries(ADMIN_ROLE_TEMPLATES);

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <div className="eyebrow">Access control</div>
          <h1>Roles & permissions</h1>
          <p className="muted">Template roles for admin access and custom permission control.</p>
        </div>
      </div>

      <div className="stats-row">
        {roles.map(([key, role]) => (
          <div key={key} className="stats-card">
            <div className="stats-icon purple"><span>R</span></div>
            <div className="stats-text">
              <label>{role.label}</label>
              <strong>{role.permissions.length}</strong>
              <small className="muted">{role.description}</small>
            </div>
          </div>
        ))}
      </div>

      <section className="panel">
        <div className="panel-header">
          <div><h2>Role templates</h2></div>
          <Link href="/admin/users/new">Create worker</Link>
        </div>

        <div className="classic-table-wrap">
          <table className="classic-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Summary</th>
                <th>Permission count</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(([key, role]) => (
                <tr key={key}>
                  <td><strong>{role.label}</strong></td>
                  <td>{role.description}</td>
                  <td>{role.permissions.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
