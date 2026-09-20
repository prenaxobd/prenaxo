import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function ActivityLayout({ children }) {
  try { await requirePermission('activity.view'); } catch { redirect('/admin'); }
  return children;
}