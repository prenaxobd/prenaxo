import { prisma } from '@/lib/prisma';
import { requirePermission, jsonError } from '@/lib/admin';
import { deleteImage, publicIdFromCloudinaryUrl } from '@/lib/cloudinary';
import { z } from 'zod';
import { invalidatePublicCache } from '@/lib/cache-tags';

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
	_count: { select: { products: { where: { active: true } } } },
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
			select: { id: true, parentId: true, active: true },
		});

		if (!parent) throw new Error('Parent category not found.');
		if (!parent.active) throw new Error('Choose an active parent category.');
		if (categoryId && parent.id === categoryId) {
			throw new Error('A category cannot be moved below one of its children.');
		}
		currentId = parent.parentId;
	}
}

async function validateCategoryArchive(tx, categoryId) {
	const productCount = await tx.product.count({ where: { categoryId } });
	if (productCount) throw new Error('Move all products before archiving this category.');

	const visited = new Set([categoryId]);
	let parentIds = [categoryId];
	while (parentIds.length) {
		const children = await tx.category.findMany({
			where: { parentId: { in: parentIds } },
			select: { id: true, active: true },
		});
		if (children.some(child => child.active)) {
			throw new Error('Archive or move active subcategories before archiving this category.');
		}
		parentIds = children.map(child => child.id).filter(id => !visited.has(id));
		parentIds.forEach(id => visited.add(id));
	}
}

async function validateCategoryDeletion(tx, categoryId) {
	const [activeProduct, child, homepageSection, analyticsEvent] = await Promise.all([
		tx.product.findFirst({ where: { categoryId, active: true }, select: { id: true } }),
		tx.category.findFirst({ where: { parentId: categoryId }, select: { id: true } }),
		tx.homepageSection.findFirst({ where: { categoryId }, select: { id: true } }),
		tx.analyticsEvent.findFirst({ where: { categoryId }, select: { id: true } }),
	]);

	if (activeProduct) throw new Error('Move all active products before permanently deleting this category.');
	if (child) throw new Error('Move or delete all subcategories before permanently deleting this category.');
	if (homepageSection) throw new Error('Remove this category from homepage sections before permanently deleting it.');
	if (analyticsEvent) throw new Error('This category has analytics history and cannot be permanently deleted. Archive it instead.');
}

function categoryError(error) {
	const targets = Array.isArray(error?.meta?.target) ? error.meta.target : [error?.meta?.target];
	if (error?.code === 'P2002' && targets.some(target => String(target).includes('slug'))) {
		return Response.json({ error: 'A category with this slug already exists.' }, { status: 400 });
	}
	return jsonError(error);
}

export async function GET() {
	try {
		await requirePermission('categories.view');
		return Response.json(await prisma.category.findMany({ include, orderBy: { name: 'asc' } }));
	} catch (error) {
		return categoryError(error);
	}
}

export async function POST(request) {
	try {
		await requirePermission('categories.create');
		const parsed = schema.parse(await request.json());
		const { attributeIds, ...data } = parsed;
		const category = await prisma.$transaction(async tx => {
			await validateParent(tx, null, data.parentId);
			const created = await tx.category.create({ data });
			if (attributeIds.length) {
				await tx.categoryAttribute.createMany({ data: attributeIds.map(attributeId => ({ categoryId: created.id, attributeId })) });
			}
			return tx.category.findUnique({ where: { id: created.id }, include });
		});
		invalidatePublicCache('categories', 'products', 'homepage');
		return Response.json(category, { status: 201 });
	} catch (error) {
		return categoryError(error);
	}
}

export async function PATCH(request) {
	try {
		await requirePermission('categories.edit');
		const { id, ...input } = await request.json();
		if (!id) throw new Error('Category id is required.');
		const parsed = schema.partial().parse(input);
		const { attributeIds, ...data } = parsed;
		const existing = await prisma.category.findUnique({ where: { id }, select: { image: true, active: true, parentId: true } });
		if (!existing) throw new Error('Category not found.');
		if (data.active === false && existing.active) await requirePermission('categories.delete');
		const category = await prisma.$transaction(async tx => {
			await validateParent(tx, id, Object.hasOwn(data, 'parentId') ? data.parentId : existing.parentId);
			if (data.active === false && existing.active) await validateCategoryArchive(tx, id);
			await tx.category.update({ where: { id }, data });
			if (attributeIds) {
				await tx.categoryAttribute.deleteMany({ where: { categoryId: id } });
				if (attributeIds.length) {
					await tx.categoryAttribute.createMany({ data: attributeIds.map(attributeId => ({ categoryId: id, attributeId })) });
				}
			}
			return tx.category.findUnique({ where: { id }, include });
		});
		if (existing.image && existing.image !== category.image) {
			const publicId = publicIdFromCloudinaryUrl(existing.image);
			if (publicId) await deleteImage(publicId).catch(() => {});
		}
		invalidatePublicCache('categories', 'products', 'homepage', 'seo');
		return Response.json(category);
	} catch (error) {
		return categoryError(error);
	}
}

export async function DELETE(request) {
	try {
		await requirePermission('categories.delete');
		const searchParams = new URL(request.url).searchParams;
		const id = searchParams.get('id');
		const permanent = searchParams.get('permanent') === 'true';
		if (!id) throw new Error('Category id is required.');
		const category = await prisma.$transaction(async tx => {
			const existing = await tx.category.findUnique({ where: { id }, select: { id: true, active: true } });
			if (!existing) throw new Error('Category not found.');
			if (permanent) {
				await validateCategoryDeletion(tx, id);
				await tx.product.updateMany({
					where: { categoryId: id, active: false },
					data: { categoryId: null },
				});
				await tx.categoryAttribute.deleteMany({ where: { categoryId: id } });
				await tx.categorySEO.deleteMany({ where: { categoryId: id } });
				return tx.category.delete({ where: { id } });
			}
			if (existing.active) await validateCategoryArchive(tx, id);
			return tx.category.update({ where: { id }, data: { active: false } });
		}, permanent ? { timeout: 15000 } : undefined);
		invalidatePublicCache('categories', 'products', 'homepage', 'seo');
		return Response.json(category);
	} catch (error) {
		return categoryError(error);
	}
}
