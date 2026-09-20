import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/admin';

export default async function SettingsLayout({ children }) {
  try { await requirePermission('settings.view'); } catch { redirect('/admin'); }
  return children;
}