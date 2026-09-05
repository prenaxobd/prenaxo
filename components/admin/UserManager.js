'use client';

import { useState } from 'react';

export default function UserManager({ initialUsers, roles = [] }) {
  const [users, setUsers] = useState(initialUsers);
  const [query, setQuery] = useState('');
  const [message, setMessage] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const visible = users.filter(user => `${user.name} ${user.email} ${user.phone || ''}`.toLowerCase().includes(query.toLowerCase())).filter(user => roleFilter === 'ALL' || user.role === roleFilter);
  async function updateRole(id, role, roleKey) {
    const response = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, role, roleKey }) });
    const data = await response.json();
    if (!response.ok) return setMessage(data.error || 'Unable to update role.');
    setUsers(items => items.map(user => user.id === id ? { ...user, role: data.role, adminRoles: role === 'ADMIN' ? [{ role: { key: roleKey, name: roles.find(item => item.key === roleKey)?.name || roleKey } }] : [] } : user));
    setMessage('Role updated.');
  }
  return <><div className="section-head"><div><div className="eyebrow">Access control</div><h1>Users</h1><p className="muted">Manage worker access without changing customer account data.</p></div></div><div className="admin-toolbar"><input placeholder="Search users" value={query} onChange={event => setQuery(event.target.value)} /><select aria-label="Filter users by role" value={roleFilter} onChange={event => setRoleFilter(event.target.value)}><option value="ALL">All roles</option><option value="ADMIN">Admin users</option><option value="USER">Customers</option></select><span>{visible.length} users</span></div>{message && <p className="admin-message">{message}</p>}<div className="admin-table-wrap"><table className="table"><thead><tr><th>User</th><th>Phone</th><th>Orders</th><th>Joined</th><th>Access role</th></tr></thead><tbody>{visible.map(user => { const assignedRole = user.adminRoles?.[0]?.role?.key || ''; return <tr key={user.id}><td><div className="admin-user-cell">{user.image ? <img className="admin-avatar" src={user.image} alt="" onError={event => { event.currentTarget.style.display = 'none'; }} /> : <span className="admin-avatar admin-avatar-fallback">{user.name?.charAt(0).toUpperCase()}</span>}<span><strong>{user.name}</strong><small className="muted">{user.email}</small></span></div></td><td>{user.phone || '—'}</td><td>{user._count.orders}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td><select value={user.role === 'ADMIN' ? assignedRole : 'USER'} onChange={event => updateRole(user.id, event.target.value === 'USER' ? 'USER' : 'ADMIN', event.target.value)}><option value="USER">Customer / no admin access</option>{roles.map(role => <option key={role.key} value={role.key}>{role.name}</option>)}</select></td></tr>; })}</tbody></table>{!visible.length && <p className="muted">No users found.</p>}</div></>;
}
