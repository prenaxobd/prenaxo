import { prisma } from '@/lib/prisma';
import ProductSEOManager from '@/components/admin/ProductSEOManager';

export default async function ProductSEO() {
	const products = await prisma.product.findMany({ where: { active: true }, select: { id: true, name: true, slug: true }, orderBy: { name: 'asc' } });
	const seoRows = await prisma.productSEO.findMany({ where: { productId: { in: products.map(product => product.id) } } });
	const seoByProduct = new Map(seoRows.map(row => [row.productId, row]));
	return <ProductSEOManager initialProducts={products.map(product => { const seo = seoByProduct.get(product.id); return { ...product, seo: seo ? { ...seo, createdAt: seo.createdAt.toISOString(), updatedAt: seo.updatedAt.toISOString() } : null }; })} />;
}
