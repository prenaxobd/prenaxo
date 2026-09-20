import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function AnalyticsLayout({ children }) {
  try { await requirePermission('analytics.view'); } catch { redirect('/admin'); }
  return children;
}