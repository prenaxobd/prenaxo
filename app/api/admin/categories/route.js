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

async function getCategoryHierarchy(tx) {
	return tx.category.findMany({
		select: { id: true, parentId: true, active: true },
	});
}

function validateParent(categories, categoryId, parentId) {
	if (!parentId) return;
	if (categoryId && categoryId === parentId) {
		throw new Error('A category cannot be its own parent.');
	}

	const categoriesById = new Map(categories.map(category => [category.id, category]));
	const visited = new Set();
	let currentId = parentId;

	while (currentId) {
		if (visited.has(currentId)) {
			throw new Error('The category hierarchy contains a cycle.');
		}
		visited.add(currentId);

		const parent = categoriesById.get(currentId);
		if (!parent) throw new Error('Parent category not found.');
		if (!parent.active) throw new Error('Choose an active parent category.');
		if (categoryId && parent.id === categoryId) {
			throw new Error('A category cannot be moved below one of its children.');
		}
		currentId = parent.parentId;
	}
}

async function validateCategoryArchive(tx, categoryId, categories) {
	const productCount = await tx.product.count({ where: { categoryId } });
	if (productCount) throw new Error('Move all products before archiving this category.');

	const childrenByParent = new Map();
	for (const category of categories) {
		if (!category.parentId) continue;
		const children = childrenByParent.get(category.parentId) || [];
		children.push(category);
		childrenByParent.set(category.parentId, children);
	}

	const visited = new Set([categoryId]);
	const pending = [categoryId];
	while (pending.length) {
		const children = childrenByParent.get(pending.pop()) || [];
		if (children.some(child => child.active)) {
			throw new Error('Archive or move active subcategories before archiving this category.');
		}
		for (const child of children) {
			if (visited.has(child.id)) continue;
			visited.add(child.id);
			pending.push(child.id);
		}
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
		if (data.parentId) {
			const categories = await getCategoryHierarchy(prisma);
			validateParent(categories, null, data.parentId);
		}
		const category = await prisma.category.create({
			data: {
				...data,
				attributes: {
					create: attributeIds.map(attributeId => ({
						attribute: { connect: { id: attributeId } },
					})),
				},
			},
			include,
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
		const changesParent = Object.hasOwn(data, 'parentId');
		const parentId = changesParent ? data.parentId : existing.parentId;
		const isArchiving = data.active === false && existing.active;
		const categoryHierarchy = (changesParent && parentId) || isArchiving
			? await getCategoryHierarchy(prisma)
			: null;
		if (changesParent && parentId) validateParent(categoryHierarchy, id, parentId);
		if (isArchiving) await validateCategoryArchive(prisma, id, categoryHierarchy);
		const category = await prisma.category.update({
			where: { id },
			data: {
				...data,
				...(attributeIds !== undefined
					? {
						attributes: {
							deleteMany: {},
							create: attributeIds.map(attributeId => ({
								attribute: { connect: { id: attributeId } },
							})),
						},
					}
					: {}),
			},
			include,
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
			if (existing.active) {
				const categoryHierarchy = await getCategoryHierarchy(tx);
				await validateCategoryArchive(tx, id, categoryHierarchy);
			}
			return tx.category.update({ where: { id }, data: { active: false } });
		}, permanent ? { timeout: 15000 } : undefined);
		invalidatePublicCache('categories', 'products', 'homepage', 'seo');
		return Response.json(category);
	} catch (error) {
		return categoryError(error);
	}
}
