import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function MarketingLayout({ children }) {
  try { await requirePermission('marketing.view'); } catch { redirect('/admin'); }
  return children;
}