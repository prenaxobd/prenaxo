import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonError } from '@/lib/admin';
import { z } from 'zod';
const schema=z.object({siteName:z.string().min(2),contactEmail:z.string().email().optional().or(z.literal('')),contactPhone:z.string().optional(),currency:z.string().min(3).max(5),shippingCharge:z.coerce.number().nonnegative()});
export async function GET(){try{await requireAdmin();return Response.json(await prisma.siteSettings.findFirst())}catch(error){return jsonError(error)}}
export async function PUT(request){try{await requireAdmin();const data=schema.parse(await request.json());return Response.json(await prisma.siteSettings.upsert({where:{id:'default-settings'},create:{id:'default-settings',...data},update:data}))}catch(error){return jsonError(error)}}
