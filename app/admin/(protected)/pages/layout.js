import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function PagesLayout({ children }) {
  try { await requirePermission('pages.view'); } catch { redirect('/admin'); }
  return children;
}