import { prisma } from '@/lib/prisma';

export default async function InventoryHistory() {
	const movements = await prisma.inventoryMovement.findMany({ orderBy: { createdAt: 'desc' }, include: { product: { select: { name: true, sku: true } } } });
	return <><div className="eyebrow">Inventory</div><h1>Inventory history</h1><div className="admin-table-wrap"><table className="table"><thead><tr><th>Product</th><th>SKU</th><th>Change</th><th>Previous</th><th>New stock</th><th>Reason</th><th>Date</th></tr></thead><tbody>{movements.map(movement => <tr key={movement.id}><td>{movement.product.name}</td><td>{movement.product.sku}</td><td className={movement.quantityChange < 0 ? 'low-stock' : 'positive'}>{movement.quantityChange > 0 ? '+' : ''}{movement.quantityChange}</td><td>{movement.previousStock}</td><td>{movement.newStock}</td><td>{movement.reason || movement.type}</td><td>{movement.createdAt.toLocaleDateString()}</td></tr>)}</tbody></table>{!movements.length && <p className="muted">No inventory movements yet.</p>}</div></>;
}
