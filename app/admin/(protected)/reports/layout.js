import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function ReportsLayout({ children }) {
  try { await requirePermission('reports.view'); } catch { redirect('/admin'); }
  return children;
}