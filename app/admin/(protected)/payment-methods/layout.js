import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function PaymentMethodsLayout({ children }) {
  try { await requirePermission('settings.view'); } catch { redirect('/admin'); }
  return children;
}