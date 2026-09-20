import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function HomepageLayout({ children }) {
  try { await requirePermission('marketing.view'); } catch { redirect('/admin'); }
  return children;
}