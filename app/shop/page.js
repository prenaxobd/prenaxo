import { getProducts } from '@/lib/products';
import { prisma } from '@/lib/prisma';
import ShopBrowser from '@/components/shop/ShopBrowser';

export default async function Shop() {
	const [products, brands] = await Promise.all([
		getProducts(),
		prisma.brand.findMany({ where: { active: true, products: { some: { active: true } } }, orderBy: { name: 'asc' } }),
	]);
	return <ShopBrowser products={products} brands={brands} />;
}
