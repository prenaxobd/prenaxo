import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function BrandsLayout({ children }) {
  try { await requirePermission('brands.view'); } catch { redirect('/admin'); }
  return children;
}