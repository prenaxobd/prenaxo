import { prisma } from '@/lib/prisma';
import SettingsForm from '@/components/admin/SettingsForm';
export default async function Settings(){const settings=await prisma.siteSettings.findFirst();return <><div className="eyebrow" style={{color:'var(--coral)'}}>Store control</div><h1>Settings</h1><SettingsForm initialSettings={{...settings,shippingCharge:settings?.shippingCharge?Number(settings.shippingCharge):80}}/></>}
