import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function ProductsLayout({ children }) {
  try { await requirePermission('products.view'); } catch { redirect('/admin'); }
  return children;
}