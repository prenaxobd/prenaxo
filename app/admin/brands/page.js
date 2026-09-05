import { prisma } from '@/lib/prisma';
import BrandManager from '@/components/admin/BrandManager';

export default async function Brands() {
	const brands = await prisma.brand.findMany({
		include: { _count: { select: { products: true } } },
		orderBy: { name: 'asc' },
	});
	return <BrandManager initialBrands={brands} />;
}
