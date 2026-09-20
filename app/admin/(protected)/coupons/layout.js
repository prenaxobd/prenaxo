import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function CouponsLayout({ children }) {
  try { await requirePermission('coupons.view'); } catch { redirect('/admin'); }
  return children;
}