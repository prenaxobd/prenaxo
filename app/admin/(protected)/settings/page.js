import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/admin/SettingsForm';
import { requirePermission } from '@/lib/admin';
import { redirect } from 'next/navigation';
export default async function Settings(){try{await requirePermission('settings.view');}catch{redirect('/admin');}const settings=await prisma.siteSettings.findFirst();return <><div className="eyebrow" style={{color:'var(--coral)'}}>Store control</div><h1>Settings</h1><SettingsForm initialSettings={settings?{...settings,shippingCharge:settings.shippingCharge?Number(settings.shippingCharge):80,freeDeliveryThreshold:settings.freeDeliveryThreshold?Number(settings.freeDeliveryThreshold):2000,createdAt:settings.createdAt?.toISOString(),updatedAt:settings.updatedAt?.toISOString()}:null}/></>}
