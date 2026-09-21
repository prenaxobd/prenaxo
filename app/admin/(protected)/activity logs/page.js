import { prisma } from '@/lib/prisma';

export default async function ActivityLogs() {
  const logs = await prisma.adminActivity.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { admin: { select: { name: true, email: true } } } });
  return <><div className="admin-page-heading"><div><div className="eyebrow">Security</div><h1>Activity logs</h1><p className="muted">Recent administrator actions recorded by the store.</p></div></div><div className="admin-table-wrap"><table className="table"><thead><tr><th>Admin</th><th>Action</th><th>Entity</th><th>Details</th><th>Date</th></tr></thead><tbody>{logs.map(log => <tr key={log.id}><td><strong>{log.admin.name}</strong><br /><small className="muted">{log.admin.email}</small></td><td>{log.action}</td><td>{log.entity}{log.entityId ? ` · ${log.entityId}` : ''}</td><td>{log.metadata ? JSON.stringify(log.metadata) : '—'}</td><td>{log.createdAt.toLocaleString()}</td></tr>)}</tbody></table>{!logs.length && <p className="muted">No activity recorded yet.</p>}</div></>;
}
