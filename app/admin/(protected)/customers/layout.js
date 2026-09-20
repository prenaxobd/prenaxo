import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function CustomersLayout({ children }) {
  try { await requirePermission('customers.view'); } catch { redirect('/admin'); }
  return children;
}