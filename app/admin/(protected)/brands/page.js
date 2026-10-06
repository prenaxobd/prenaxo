import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getUserPermissions, requireAdmin } from '@/lib/admin';
import BrandManager from '@/components/admin/BrandManager';

export default async function Brands() {
	let admin;
	try {
		admin = await requireAdmin();
	} catch {
		redirect('/admin');
	}
	const permissions = await getUserPermissions(admin.id);
	if (!permissions.has('brands.view')) redirect('/admin');

	const brands = await prisma.brand.findMany({
		include: { _count: { select: { products: true } } },
		orderBy: { name: 'asc' },
	});
	return <BrandManager initialBrands={brands} permissions={[...permissions]} />;
}
