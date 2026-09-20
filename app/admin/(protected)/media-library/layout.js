import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function MediaLibraryLayout({ children }) {
  try { await requirePermission('media.view'); } catch { redirect('/admin'); }
  return children;
}