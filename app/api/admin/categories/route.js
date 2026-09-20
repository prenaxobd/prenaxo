import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { z } from 'zod';

const schema = z.object({
	name: z.string().trim().min(2),
	slug: z.string().trim().min(2),
	description: z.string().nullable().optional(),
	image: z.string().nullable().optional(),
	parentId: z.string().nullable().optional().or(z.literal('')).transform(value => value || null),
	active: z.boolean().default(true),
	attributeIds: z.array(z.string()).default([]),
});

const include = {
	_count: { select: { products: true } },
	attributes: { include: { attribute: true } },
	parent: { select: { id: true, name: true } },
};

async function validateParent(tx, categoryId, parentId) {
	if (!parentId) return;
	if (categoryId && categoryId === parentId) {
		throw new Error('A category cannot be its own parent.');
	}

	const visited = new Set();
	let currentId = parentId;

	while (currentId) {
		if (visited.has(currentId)) {
			throw new Error('The category hierarchy contains a cycle.');
		}
		visited.add(currentId);

		const parent = await tx.category.findUnique({
			where: { id: currentId },
			select: { id: true, parentId: true },
		});

		if (!parent) throw new Error('Parent category not found.');
		if (categoryId && parent.id === categoryId) {
			throw new Error('A category cannot be moved below one of its children.');
		}
		currentId = parent.parentId;
	}
}

export async function GET(){try{await requirePermission('categories.view');return Response.json(await prisma.category.findMany({include,orderBy:{name:'asc'}}))}catch(error){return jsonError(error)}}
export async function POST(request){try{await requirePermission('categories.create');const parsed=schema.parse(await request.json());const {attributeIds,...data}=parsed;const category=await prisma.$transaction(async tx=>{await validateParent(tx,null,data.parentId);const created=await tx.category.create({data});if(attributeIds.length)await tx.categoryAttribute.createMany({data:attributeIds.map(attributeId=>({categoryId:created.id,attributeId}))});return tx.category.findUnique({where:{id:created.id},include})});return Response.json(category,{status:201})}catch(error){return jsonError(error)}}
export async function PATCH(request){try{await requirePermission('categories.edit');const {id,...input}=await request.json();const parsed=schema.partial().parse(input);const {attributeIds,...data}=parsed;const category=await prisma.$transaction(async tx=>{await validateParent(tx,id,data.parentId);await tx.category.update({where:{id},data});if(attributeIds){await tx.categoryAttribute.deleteMany({where:{categoryId:id}});if(attributeIds.length)await tx.categoryAttribute.createMany({data:attributeIds.map(attributeId=>({categoryId:id,attributeId}))});}return tx.category.findUnique({where:{id},include})});return Response.json(category)}catch(error){return jsonError(error)}}
export async function DELETE(request){try{await requirePermission('categories.delete');const id=new URL(request.url).searchParams.get('id');const count=await prisma.product.count({where:{categoryId:id,active:true}});if(count)throw new Error('Archive or move products before deleting this category.');return Response.json(await prisma.category.update({where:{id},data:{active:false}}))}catch(error){return jsonError(error)}}
