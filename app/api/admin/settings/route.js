import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';
import { invalidatePublicCache } from '@/lib/cache-tags';
const schema=z.object({siteName:z.string().min(2),contactEmail:z.string().email().optional().or(z.literal('')),contactPhone:z.string().optional(),currency:z.string().min(3).max(5),shippingCharge:z.coerce.number().nonnegative()});
export async function GET(){try{await requirePermission('settings.view');return Response.json(await prisma.siteSettings.findFirst())}catch(error){return jsonError(error)}}
export async function PUT(request){try{await requirePermission('settings.edit');const data=schema.parse(await request.json());const settings=await prisma.siteSettings.upsert({where:{id:'default-settings'},create:{id:'default-settings',...data},update:data});invalidatePublicCache('site-settings','seo','homepage');return Response.json(settings)}catch(error){return jsonError(error)}}
