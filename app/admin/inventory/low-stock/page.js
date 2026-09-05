import { prisma } from '@/lib/prisma';

export default async function LowStockInventory() {
	const products = await prisma.product.findMany({ where: { active: true, stock: { lte: 5 } }, include: { category: true }, orderBy: { stock: 'asc' } });
	return <><div className="eyebrow">Inventory</div><h1>Low stock</h1><div className="admin-table-wrap"><table className="table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Current stock</th><th>Threshold</th></tr></thead><tbody>{products.map(product => <tr key={product.id}><td><strong>{product.name}</strong></td><td>{product.sku}</td><td>{product.category.name}</td><td className="low-stock">{product.stock}</td><td>{product.lowStock}</td></tr>)}</tbody></table>{!products.length && <p className="muted">No low-stock products.</p>}</div></>;
}
