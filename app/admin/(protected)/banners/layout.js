import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function BannersLayout({ children }) {
  try { await requirePermission('banners.view'); } catch { redirect('/admin'); }
  return children;
}