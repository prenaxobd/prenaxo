import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function OrdersLayout({ children }) {
  try { await requirePermission('orders.view'); } catch { redirect('/admin'); }
  return children;
}