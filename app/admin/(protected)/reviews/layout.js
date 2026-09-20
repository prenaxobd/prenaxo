import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function ReviewsLayout({ children }) {
  try { await requirePermission('reviews.view'); } catch { redirect('/admin'); }
  return children;
}