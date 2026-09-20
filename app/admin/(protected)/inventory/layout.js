import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function InventoryLayout({ children }) {
  try { await requirePermission('inventory.view'); } catch { redirect('/admin'); }
  return children;
}