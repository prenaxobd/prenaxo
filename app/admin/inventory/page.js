import { prisma } from '@/lib/prisma';
import InventoryManager from '@/components/admin/InventoryManager';

export default async function Inventory() {
	const [products, movements] = await Promise.all([
		prisma.product.findMany({ where: { active: true }, orderBy: { stock: 'asc' }, select: { id: true, name: true, sku: true, stock: true, lowStock: true } }),
		prisma.inventoryMovement.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { product: { select: { name: true } } } }),
	]);
	return <InventoryManager initialProducts={products} initialMovements={movements.map(movement => ({ ...movement, createdAt: movement.createdAt.toISOString() }))} />;
}
