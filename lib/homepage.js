import { prisma } from '@/lib/prisma';

function serializeProduct(product) {
  return { ...product, regularPrice: Number(product.regularPrice), salePrice: product.salePrice === null ? null : Number(product.salePrice), reviews: product.reviews || [], orderItems: undefined };
}

export async function getHomepageData() {
  const baseInclude = { category: true, images: true, reviews: { where: { approved: true }, include: { user: { select: { name: true, image: true } } }, orderBy: { createdAt: 'desc' }, take: 3 } };
  const [banners, categories, products, reviews] = await Promise.all([
    prisma.banner.findMany({ where: { active: true, AND: [{ OR: [{ startAt: null }, { startAt: { lte: new Date() } }] }, { OR: [{ endAt: null }, { endAt: { gte: new Date() } }] }] }, orderBy: { sortOrder: 'asc' } }).catch(() => []),
    prisma.category.findMany({ where: { active: true }, include: { _count: { select: { products: true } } }, orderBy: { name: 'asc' } }).catch(() => []),
    prisma.product.findMany({ where: { active: true }, include: { ...baseInclude, orderItems: { select: { quantity: true, order: { select: { status: true } } } } }, orderBy: { createdAt: 'desc' }, take: 48 }).catch(() => []),
    prisma.review.findMany({ where: { approved: true }, include: { user: { select: { name: true, image: true } }, product: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 8 }).catch(() => []),
  ]);
  const serialized = products.map(serializeProduct);
  const topSelling = products.map(product => ({ product: serializeProduct(product), quantity: product.orderItems.reduce((sum, item) => item.order.status === 'CANCELLED' ? sum : sum + item.quantity, 0) })).sort((a, b) => b.quantity - a.quantity).map(item => item.product).slice(0, 8);
  const featured = serialized.filter(product => product.featured).slice(0, 8);
  const deals = serialized.filter(product => product.salePrice !== null && product.salePrice < product.regularPrice).sort((a, b) => (1 - b.salePrice / b.regularPrice) - (1 - a.salePrice / a.regularPrice)).slice(0, 8);
  const categorySections = categories.map(category => ({ ...category, products: serialized.filter(product => product.categoryId === category.id).slice(0, 8) })).filter(section => section.products.length);
  const sections = await prisma.homepageSection.findMany({ where: { active: true }, include: { category: true }, orderBy: { sortOrder: 'asc' } }).catch(() => []);
  return { banners, categories, featured, topSelling: topSelling.length ? topSelling : serialized.slice(0, 8), deals, newArrivals: serialized.slice(0, 8), categorySections, reviews, sections, products: serialized };
}
