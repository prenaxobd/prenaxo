import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getUserPermissions, requireAdmin } from '@/lib/admin';
import CategoryManager from '@/components/admin/CategoryManager';

export default async function Categories() {
	let admin;
	try {
		admin = await requireAdmin();
	} catch {
		redirect('/admin');
	}
	const permissions = await getUserPermissions(admin.id);
	if (!permissions.has('categories.view')) redirect('/admin');
	const [categories, attributes] = await Promise.all([
		prisma.category.findMany({
			include: {
				_count: { select: { products: true } },
				attributes: { include: { attribute: true } },
				parent: { select: { id: true, name: true } },
			},
			orderBy: { name: 'asc' },
		}),
		prisma.attribute.findMany({
			where: { active: true },
			orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
		}),
	]);

	return (
		<CategoryManager
			initialCategories={categories}
			attributes={attributes}
			permissions={[...permissions]}
		/>
	);
}
