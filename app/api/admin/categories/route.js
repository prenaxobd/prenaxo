import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';
const schema=z.object({name:z.string().min(2),slug:z.string().min(2),description:z.string().nullable().optional(),image:z.string().nullable().optional(),parentId:z.string().nullable().optional(),active:z.boolean().default(true)});
export async function GET(){try{await requirePermission('categories.view');return Response.json(await prisma.category.findMany({include:{_count:{select:{products:true}}},orderBy:{name:'asc'}}))}catch(error){return jsonError(error)}}
export async function POST(request){try{await requirePermission('categories.create');return Response.json(await prisma.category.create({data:schema.parse(await request.json())}),{status:201})}catch(error){return jsonError(error)}}
export async function PATCH(request){try{await requirePermission('categories.edit');const {id,...input}=await request.json();return Response.json(await prisma.category.update({where:{id},data:schema.partial().parse(input)}))}catch(error){return jsonError(error)}}
export async function DELETE(request){try{await requirePermission('categories.delete');const id=new URL(request.url).searchParams.get('id');const count=await prisma.product.count({where:{categoryId:id,active:true}});if(count)throw new Error('Archive or move products before deleting this category.');return Response.json(await prisma.category.update({where:{id},data:{active:false}}))}catch(error){return jsonError(error)}}
