import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function SEOLayout({ children }) {
  try { await requirePermission('seo.view'); } catch { redirect('/admin'); }
  return children;
}