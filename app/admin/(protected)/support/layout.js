import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function SupportLayout({ children }) {
  try { await requirePermission('support.view'); } catch { redirect('/admin'); }
  return children;
}