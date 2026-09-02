import { prisma } from '@/lib/prisma';
import { requireAdmin, jsonError } from '@/lib/admin';
import { z } from 'zod';
const schema=z.object({code:z.string().min(3).transform(v=>v.toUpperCase()),type:z.enum(['PERCENTAGE','FIXED']),value:z.coerce.number().positive(),minimumOrder:z.coerce.number().nonnegative().nullable().optional(),expiresAt:z.coerce.date().nullable().optional(),active:z.boolean().default(true)});
export async function GET(){try{await requireAdmin();return Response.json(await prisma.coupon.findMany({orderBy:{code:'asc'}}))}catch(error){return jsonError(error)}}
export async function POST(request){try{await requireAdmin();return Response.json(await prisma.coupon.create({data:schema.parse(await request.json())}),{status:201})}catch(error){return jsonError(error)}}
export async function PATCH(request){try{await requireAdmin();const {id,...input}=await request.json();return Response.json(await prisma.coupon.update({where:{id},data:schema.partial().parse(input)}))}catch(error){return jsonError(error)}}
export async function DELETE(request){try{await requireAdmin();const id=new URL(request.url).searchParams.get('id');return Response.json(await prisma.coupon.update({where:{id},data:{active:false}}))}catch(error){return jsonError(error)}}
