'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function UserManager({ initialUsers, roles = [] }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const visible = users.filter(user => `${user.name} ${user.email} ${user.phone || ''}`.toLowerCase().includes(query.toLowerCase())).filter(user => roleFilter === 'ALL' || user.adminRoles?.[0]?.role?.key === roleFilter);

  async function updateUser(id, changes) {
    const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...changes }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || 'Unable to update admin user.');
    setUsers(items => items.map(user => user.id === id ? data : user));
    setMessage('Admin user updated.');
  }

  return <>
    <div className="admin-page-heading"><div><div className="eyebrow">Access control</div><h1>Admin Users</h1><p className="muted">Only intentional admin and staff accounts appear here.</p></div><Link className="btn" href="/admin/users/new">+ Add New User</Link></div>
    <div className="admin-toolbar"><input placeholder="Search admin users" value={query} onChange={event => setQuery(event.target.value)} /><select aria-label="Filter admin users by role" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}><option value="ALL">All roles</option>{roles.map(role => <option key={role.key} value={role.key}>{role.name}</option>)}</select><span>{visible.length} admin users</span></div>
    {message && <p className="admin-message">{message}</p>}
    <div className="admin-table-wrap admin-users-table-wrap"><table className="table admin-users-table"><thead><tr><th>User</th><th>Phone</th><th>Orders</th><th>Joined</th><th>Role</th><th>Status</th></tr></thead><tbody>{visible.map(user => { const assignedRole = user.adminRoles?.[0]?.role?.key || ''; return <tr key={user.id}><td><div className="admin-user-cell">{user.image ? <img className="admin-avatar" src={user.image} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <span className="admin-avatar admin-avatar-fallback">{user.name?.charAt(0).toUpperCase()}</span>}<span><strong>{user.name}</strong><small className="muted">{user.email}</small></span></div></td><td>{user.phone || '—'}</td><td>{user._count.orders}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td><select disabled={user.email.toLowerCase() === 'prenaxo@gmail.com'} value={assignedRole} onChange={event => updateUser(user.id, { roleKey: event.target.value })}>{roles.filter(role => role.key !== 'SUPER_ADMIN').map(role => <option key={role.key} value={role.key}>{role.name}</option>)}</select></td><td><button className={`admin-user-status ${user.adminActive ? 'is-active' : ''}`} type="button" disabled={user.email.toLowerCase() === 'prenaxo@gmail.com'} onClick={() => updateUser(user.id, { adminActive: !user.adminActive })}>{user.adminActive ? 'Active' : 'Inactive'}</button></td></tr>; })}</tbody></table>{!visible.length && <p className="muted">No admin users found.</p>}</div>
  </>;
}