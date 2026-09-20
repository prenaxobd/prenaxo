import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function AttributesLayout({ children }) {
  try { await requirePermission('categories.view'); } catch { redirect('/admin'); }
  return children;
}