import { prisma } from '@/lib/prisma';
import AnalyticsReport from '@/components/admin/AnalyticsReport';
import { requirePermission } from '@/lib/admin';
import { redirect } from 'next/navigation';

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function dateInputValue(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function parseDateInput(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : startOfDay(date);
}

function getDateRange(range, fromInput, toInput) {
  const now = new Date();
  const today = startOfDay(now);

  if (range === 'custom') {
    const from = parseDateInput(fromInput);
    const to = parseDateInput(toInput);
    if (from && to && from <= to) {
      return { from, to: endOfDay(to), label: `${dateInputValue(from)} - ${dateInputValue(to)}`, range };
    }
  }
  if (range === 'today') return { from: today, to: endOfDay(now), label: 'Today', range };
  if (range === 'yesterday') {
    const from = new Date(today.getTime() - DAY);
    return { from, to: endOfDay(from), label: 'Yesterday', range };
  }
  if (range === '7days') {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from, to: endOfDay(now), label: 'Last 7 Days', range };
  }
  if (range === '90days') {
    const from = new Date(today);
    from.setDate(from.getDate() - 89);
    return { from, to: endOfDay(now), label: 'Last 90 Days', range };
  }
  if (range === 'this-month') return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now), label: 'This Month', range };
  if (range === 'last-month') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0);
    return { from, to: endOfDay(to), label: 'Last Month', range };
  }
  const from = new Date(today);
  from.setDate(from.getDate() - 29);
  return { from, to: endOfDay(now), label: 'Last 30 Days', range: '30days' };
}

function getComparisonRange(from, to) {
  const days = Math.max(1, Math.round((startOfDay(to) - startOfDay(from)) / DAY) + 1);
  const previousTo = new Date(startOfDay(from).getTime() - DAY);
  return { from: new Date(previousTo.getTime() - (days - 1) * DAY), to: endOfDay(previousTo) };
}

function money(value) { return Number(value || 0); }
function round(value) { return Math.round(Number(value || 0)); }

function percentageChange(current, previous) {
  if (!previous) return current ? null : 0;
  return round(((current - previous) / previous) * 1000) / 10;
}

function getAddressPart(address) {
  if (!address || typeof address !== 'object') return 'Unknown';
  for (const key of ['division', 'state', 'region', 'city', 'district']) {
    if (typeof address[key] === 'string' && address[key].trim()) return address[key].trim();
  }
  return 'Unknown';
}

function customerKey(order) {
  return order.userId || `email:${String(order.customerEmail || '').trim().toLowerCase()}`;
}

function formatStatus(status) {
  return String(status || '').toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function calculatePeriod(orders, firstCustomerDates, from, to) {
  const paidOrders = orders.filter((order) => order.paymentStatus === 'PAID');
  const revenue = paidOrders.reduce((sum, order) => sum + money(order.total), 0);
  const customers = new Set(paidOrders.map(customerKey).filter(Boolean));
  const productMap = new Map();
  const categoryMap = new Map();
  const geographicMap = new Map();
  let units = 0;
  let profit = 0;
  let profitComplete = true;

  paidOrders.forEach((order) => {
    const division = getAddressPart(order.shippingAddress);
    const location = geographicMap.get(division) || { division, orders: 0, revenue: 0 };
    location.orders += 1;
    location.revenue += money(order.total);
    geographicMap.set(division, location);

    order.items.forEach((item) => {
      const quantity = Number(item.quantity || 0);
      const itemRevenue = quantity * money(item.unitPrice);
      const productData = item.product;
      units += quantity;
      if (productData?.costPrice === null || productData?.costPrice === undefined) profitComplete = false;
      else profit += quantity * (money(item.unitPrice) - money(productData.costPrice));

      const product = productMap.get(item.productId) || {
        id: item.productId,
        name: productData?.name || item.productName,
        quantity: 0,
        revenue: 0,
        category: productData?.category?.name || 'Uncategorized',
        categoryId: productData?.category?.id || null,
        brand: productData?.brandRelation?.name || productData?.brand || 'Unbranded',
        brandId: productData?.brandRelation?.id || null,
        image: productData?.images?.[0]?.url || null,
        imageAlt: productData?.images?.[0]?.alt || productData?.name || item.productName,
        stock: productData?.stock ?? null,
        lowStock: productData?.lowStock ?? 5,
        productType: productData?.productType || 'SINGLE',
      };
      product.quantity += quantity;
      product.revenue += itemRevenue;
      productMap.set(item.productId, product);

      const category = categoryMap.get(product.category) || { name: product.category, quantity: 0, revenue: 0 };
      category.quantity += quantity;
      category.revenue += itemRevenue;
      categoryMap.set(product.category, category);
    });
  });

  const products = Array.from(productMap.values()).map((product) => ({ ...product, revenue: round(product.revenue) }));
  const productPerformance = products.slice().sort((a, b) => b.revenue - a.revenue).map((product) => ({
    ...product,
    performance: product.quantity >= 20 || product.revenue >= 50000 ? 'Excellent' : product.quantity >= 10 || product.revenue >= 20000 ? 'Very Good' : product.quantity >= 3 || product.revenue >= 5000 ? 'Good' : 'Average',
  }));
  const categories = Array.from(categoryMap.values()).sort((a, b) => b.revenue - a.revenue).map((category) => ({
    ...category,
    revenue: round(category.revenue),
    percentage: revenue ? round((category.revenue / revenue) * 1000) / 10 : 0,
  }));
  const statusMap = new Map();
  orders.forEach((order) => statusMap.set(order.status, (statusMap.get(order.status) || 0) + 1));
  const orderStatus = Array.from(statusMap.entries()).sort((a, b) => b[1] - a[1]).map(([status, count]) => ({
    status,
    label: formatStatus(status),
    count,
    percentage: orders.length ? round((count / orders.length) * 1000) / 10 : 0,
  }));

  const newCustomerIds = new Set();
  const returningCustomerIds = new Set();
  paidOrders.forEach((order) => {
    const key = customerKey(order);
    const firstDate = firstCustomerDates.get(key);
    if (firstDate && firstDate >= from && firstDate <= to) newCustomerIds.add(key);
    else if (key) returningCustomerIds.add(key);
  });

  const daily = [];
  const seenNewCustomers = new Set();
  const cursor = new Date(startOfDay(from));
  const days = Math.max(1, Math.round((startOfDay(to) - startOfDay(from)) / DAY) + 1);
  for (let index = 0; index < days; index += 1) {
    const dayStart = new Date(cursor);
    const dayEnd = endOfDay(dayStart);
    const dayOrders = paidOrders.filter((order) => new Date(order.createdAt) >= dayStart && new Date(order.createdAt) <= dayEnd);
    const dayCustomers = new Set();
    dayOrders.forEach((order) => {
      const key = customerKey(order);
      if (newCustomerIds.has(key) && !seenNewCustomers.has(key)) dayCustomers.add(key);
      seenNewCustomers.add(key);
    });
    daily.push({
      label: dayStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      shortLabel: dayStart.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      revenue: round(dayOrders.reduce((sum, order) => sum + money(order.total), 0)),
      orders: dayOrders.length,
      customers: dayCustomers.size,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  const comboProducts = productPerformance.filter((product) => product.productType === 'COMBO');
  const comboRevenue = comboProducts.reduce((sum, product) => sum + product.revenue, 0);
  return {
    revenue: round(revenue),
    orders: paidOrders.length,
    customers: customers.size,
    units,
    average: paidOrders.length ? round(revenue / paidOrders.length) : 0,
    profit: profitComplete && paidOrders.length ? round(profit) : null,
    daily,
    products,
    productPerformance,
    categories,
    orderStatus,
    geographicSales: Array.from(geographicMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 7).map((item) => ({ ...item, revenue: round(item.revenue) })),
    comboProducts,
    comboRevenue: round(comboRevenue),
    singleRevenue: round(Math.max(revenue - comboRevenue, 0)),
    comboOrders: comboProducts.reduce((sum, product) => sum + product.quantity, 0),
    newCustomers: newCustomerIds.size,
    returningCustomers: returningCustomerIds.size,
  };
}

function buildFirstCustomerDates(userRows, emailRows) {
  const dates = new Map();
  userRows.forEach((row) => { if (row.userId && row._min.createdAt) dates.set(row.userId, row._min.createdAt); });
  emailRows.forEach((row) => { if (row.customerEmail && row._min.createdAt) dates.set(`email:${row.customerEmail.trim().toLowerCase()}`, row._min.createdAt); });
  return dates;
}

const productSelect = {
  id: true,
  name: true,
  brand: true,
  productType: true,
  stock: true,
  lowStock: true,
  costPrice: true,
  category: { select: { id: true, name: true } },
  brandRelation: { select: { id: true, name: true } },
  images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true, alt: true } },
};

const orderInclude = { items: { include: { product: { select: productSelect } } } };

export default async function Analytics({ searchParams }) {
  try { await requirePermission('analytics.view'); } catch { redirect('/admin'); }
  const params = await searchParams;
  const { from, to, label, range: activeRange } = getDateRange(params?.range || '30days', params?.from, params?.to);
  const comparison = getComparisonRange(from, to);
  const categoryId = params?.categoryId || '';
  const brandId = params?.brandId || '';
  const stockStatus = params?.stockStatus || 'all';

  const [orders, previousOrders, firstUserRows, firstEmailRows, categories, brands] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: from, lte: to } }, include: orderInclude, orderBy: { createdAt: 'asc' } }),
    prisma.order.findMany({ where: { createdAt: { gte: comparison.from, lte: comparison.to } }, include: orderInclude }),
    prisma.order.groupBy({ by: ['userId'], where: { paymentStatus: 'PAID', userId: { not: null } }, _min: { createdAt: true } }),
    prisma.order.groupBy({ by: ['customerEmail'], where: { paymentStatus: 'PAID' }, _min: { createdAt: true } }),
    prisma.category.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
    prisma.brand.findMany({ where: { active: true }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  const firstCustomerDates = buildFirstCustomerDates(firstUserRows, firstEmailRows);
  const current = calculatePeriod(orders, firstCustomerDates, from, to);
  const previous = calculatePeriod(previousOrders, firstCustomerDates, comparison.from, comparison.to);
  const changes = {
    revenue: percentageChange(current.revenue, previous.revenue),
    orders: percentageChange(current.orders, previous.orders),
    customers: percentageChange(current.customers, previous.customers),
    units: percentageChange(current.units, previous.units),
    average: percentageChange(current.average, previous.average),
  };
  const filteredProducts = current.productPerformance.filter((product) => {
    if (categoryId && product.categoryId !== categoryId) return false;
    if (brandId && product.brandId !== brandId) return false;
    if (stockStatus === 'out' && product.stock !== 0) return false;
    if (stockStatus === 'low' && !(product.stock > 0 && product.stock <= product.lowStock)) return false;
    if (stockStatus === 'in' && !(product.stock > product.lowStock)) return false;
    return true;
  });

  const insights = [];
  if (current.revenue || previous.revenue) {
    const change = changes.revenue;
    insights.push({ type: 'revenue', title: 'Revenue performance', text: change === null ? `Revenue reached ৳${current.revenue.toLocaleString()} with no prior-period baseline.` : `Revenue ${change >= 0 ? 'increased' : 'decreased'} ${Math.abs(change)}% versus the previous period.` });
  }
  if (current.categories[0]) insights.push({ type: 'category', title: 'Leading category', text: `${current.categories[0].name} generated ৳${current.categories[0].revenue.toLocaleString()} in sales.` });
  if (current.products[0]) insights.push({ type: 'product', title: 'Top selling product', text: `${current.products[0].name} led sales with ${current.products[0].quantity} units.` });
  if (current.geographicSales[0] && current.geographicSales[0].division !== 'Unknown') insights.push({ type: 'location', title: 'Top location', text: `${current.geographicSales[0].division} generated the highest revenue at ৳${current.geographicSales[0].revenue.toLocaleString()}.` });
  if (!insights.length) insights.push({ type: 'info', title: 'No significant insights', text: 'There is not enough paid-order data for this period yet.' });

  return (
    <AnalyticsReport
      summary={{ ...current, previous, changes }}
      daily={current.daily}
      topProducts={current.products.slice().sort((a, b) => b.quantity - a.quantity).slice(0, 8)}
      categorySales={current.categories}
      orderStatus={current.orderStatus}
      productPerformance={filteredProducts}
      geographicSales={current.geographicSales}
      comboProducts={current.comboProducts}
      insights={insights}
      range={activeRange}
      rangeLabel={label}
      filters={{ categoryId, brandId, stockStatus, from: params?.from || dateInputValue(from), to: params?.to || dateInputValue(to) }}
      filterOptions={{ categories, brands }}
    />
  );
}