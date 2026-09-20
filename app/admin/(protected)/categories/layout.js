import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function CategoriesLayout({ children }) {
  try { await requirePermission('categories.view'); } catch { redirect('/admin'); }
  return children;
}