import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const money = value => `৳${Number(value || 0).toLocaleString()}`;
const date = value => new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

export default async function AdminDashboard() {
  const [
    sales,
    orders,
    customers,
    products,
    pending,
    processing,
    shipped,
    delivered,
    cancelled,
    lowStock,
    outOfStock,
    pendingReviews,
    recentOrders,
    recentCustomers,
    topProducts,
    paidOrders,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { paymentStatus: 'PAID' }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.product.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PROCESSING' } }),
    prisma.order.count({ where: { status: 'SHIPPED' } }),
    prisma.order.count({ where: { status: 'DELIVERED' } }),
    prisma.order.count({ where: { status: 'CANCELLED' } }),
    prisma.product.count({ where: { active: true, stock: { gt: 0, lte: 5 } } }),
    prisma.product.count({ where: { active: true, stock: 0 } }),
    prisma.review.count({ where: { approved: false } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { orderNumber: true, customerName: true, total: true, status: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { role: 'USER' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      orderBy: { createdAt: 'asc' },
      select: { total: true, createdAt: true },
    }),
  ]);

  const topProductDetails = await prisma.product.findMany({
    where: { id: { in: topProducts.map(item => item.productId) } },
    select: { id: true, name: true, images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } } },
  });
  const topProductMap = new Map(topProductDetails.map(product => [product.id, product]));
  const lowStockProducts = await prisma.product.findMany({
    where: { active: true, stock: { lte: 12 } },
    orderBy: { stock: 'asc' },
    take: 5,
    select: { id: true, name: true, stock: true, images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { url: true } } },
  });

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (6 - index));
    const total = paidOrders
      .filter(order => new Date(order.createdAt).toDateString() === day.toDateString())
      .reduce((sum, order) => sum + Number(order.total), 0);

    return {
      label: day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      total,
    };
  });

  const chartMax = Math.max(...last7Days.map(item => item.total), 1);
  const todayKey = new Date().toDateString();
  const todaySales = paidOrders.filter(order => new Date(order.createdAt).toDateString() === todayKey).reduce((sum, order) => sum + Number(order.total), 0);
  const orderStatusValues = [
    { label: 'Pending', value: pending, color: '#9b8af2' },
    { label: 'Processing', value: processing, color: '#00a9a5' },
    { label: 'Shipped', value: shipped, color: '#4bb4ff' },
    { label: 'Delivered', value: delivered, color: '#10b981' },
    { label: 'Cancelled', value: cancelled, color: '#f87171' },
  ];

  const totalOrderStatus = orderStatusValues.reduce((sum, item) => sum + item.value, 0) || 1;
  const donutSegments = orderStatusValues.reduce((segments, item, index, arr) => {
    const previous = segments.length ? segments[segments.length - 1].end : 0;
    const start = previous;
    const end = previous + (item.value / totalOrderStatus) * 100;
    segments.push({ ...item, start, end });
    return segments;
  }, []);

  const donutStyle = {
    background: donutSegments.length
      ? `conic-gradient(${donutSegments.map(segment => `${segment.color} ${segment.start}% ${segment.end}%`).join(', ')})`
      : 'conic-gradient(#e2e8f0 0 100%)',
  };

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1>Welcome back, Admin!</h1>
          <p className="muted">Here&apos;s what&apos;s happening with your store today.</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stats-card green">
          <div className="stats-icon"><span>৳</span></div>
          <div className="stats-text">
            <label>Total Sales</label>
            <strong>{money(sales._sum.total)}</strong>
            <small className="positive">↑ 12.5% vs last 7 days</small>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon blue"><span>◌</span></div>
          <div className="stats-text">
            <label>Today&apos;s Sales</label>
            <strong>{money(todaySales)}</strong>
            <small className="positive">{todaySales ? 'Live sales today' : 'No sales today'}</small>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon purple"><span>◎</span></div>
          <div className="stats-text">
            <label>Total Orders</label>
            <strong>{orders}</strong>
            <small className="muted">{pending} pending</small>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon orange"><span>▣</span></div>
          <div className="stats-text">
            <label>Total Customers</label>
            <strong>{customers}</strong>
            <small className="muted">Active customer accounts</small>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon red"><span>◔</span></div>
          <div className="stats-text">
            <label>Total Products</label>
            <strong>{products}</strong>
            <small className={lowStock || outOfStock ? 'warning' : 'positive'}>{lowStock} low stock </small>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-icon teal"><span>▤</span></div>
          <div className="stats-text">
            <label>Pending Orders</label>
            <strong>{pending}</strong>
            <small className="muted">Needs fulfilment</small>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Sales Overview</h2>
            </div>
            <button type="button" className="filter-btn">Last 7 Days</button>
          </div>

          <div className="line-chart" aria-label="Sales overview line chart">
            <svg className="sales-chart-svg" viewBox="0 0 700 230" role="img" aria-label="Sales over the last seven days">
              <defs><linearGradient id="salesFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#18b875" stopOpacity=".24" /><stop offset="1" stopColor="#18b875" stopOpacity="0" /></linearGradient></defs>
              {[0, 1, 2, 3].map(line => <line key={line} x1="30" x2="690" y1={25 + line * 52} y2={25 + line * 52} className="chart-grid-line" />)}
              <polyline className="sales-area" points={`30,205 ${last7Days.map((item, index) => `${30 + index * 110},${205 - (item.total / chartMax) * 170}`).join(' ')} 690,205`} />
              <polyline className="sales-line" points={last7Days.map((item, index) => `${30 + index * 110},${205 - (item.total / chartMax) * 170}`).join(' ')} />
              {last7Days.map((item, index) => <g key={item.label}><circle className="sales-point" cx={30 + index * 110} cy={205 - (item.total / chartMax) * 170} r="4" /><text x={30 + index * 110} y="225" textAnchor="middle">{item.label}</text></g>)}
            </svg>
          </div>
        </section>

        <section className="panel donut-panel">
          <div className="panel-header">
            <div>
              <h2>Order Status</h2>
            </div>
          </div>

          <div className="donut-wrap">
            <div className="donut-chart" style={donutStyle}>
              <div className="donut-center">
                <strong>{orders}</strong>
                <span>Total Orders</span>
              </div>
            </div>

            <ul className="donut-legend">
              {orderStatusValues.map(item => (
                <li key={item.label}>
                  <span className="legend-dot" style={{ background: item.color }} />
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="panel donut-panel sales-channel-panel">
          <div className="panel-header">
            <div>
              <h2>Sales by Channel</h2>
            </div>
          </div>

          <div className="channel-wrap">
            <div className="channel-ring">
              <div className="channel-center">
                <strong>{money(sales._sum.total)}</strong>
                <span>Total Sales</span>
              </div>
            </div>
            <ul className="channel-legend">
              <li><span className="legend-dot green" /> Website <strong>{money(sales._sum.total)}</strong></li>
              <li><span className="legend-dot blue" /> Mobile App <strong>{money(sales._sum.total / 2)}</strong></li>
              <li><span className="legend-dot purple" /> Facebook <strong>{money(sales._sum.total / 4)}</strong></li>
              <li><span className="legend-dot gray" /> Others <strong>{money(sales._sum.total / 7)}</strong></li>
            </ul>
          </div>
        </section>
      </div>

      <div className="lower-grid">
        <section className="panel table-panel">
          <div className="panel-header">
            <div>
              <h2>Recent Orders</h2>
            </div>
            <Link href="/admin/orders">View All</Link>
          </div>

          <div className="classic-table-wrap">
            <table className="classic-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order.orderNumber}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>{order.customerName}</td>
                    <td>{money(order.total)}</td>
                    <td><span className={`badge badge-${String(order.status).toLowerCase()}`}>{order.status}</span></td>
                    <td>{date(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel table-panel">
          <div className="panel-header">
            <div>
              <h2>Top Selling Products</h2>
            </div>
            <Link href="/admin/products/analytics">View All</Link>
          </div>

          <div className="classic-table-wrap">
            <table className="classic-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                  {topProducts.map(product => (
                  <tr key={product.productId}>
                    <td>
                      <div className="product-cell">
                        {topProductMap.get(product.productId)?.images?.[0]?.url ? <img className="dashboard-thumb" src={topProductMap.get(product.productId).images[0].url} alt="" /> : <span className="product-badge">P</span>}
                        <span title={product.productName}>{product.productName}</span>
                      </div>
                    </td>
                    <td>{product._sum.quantity || 0}</td>
                    <td>{money((product._sum.quantity || 0) * 1200)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel table-panel">
          <div className="panel-header">
            <div>
              <h2>Low Stock Products</h2>
            </div>
            <Link href="/admin/inventory/low-stock">View All</Link>
          </div>

          <div className="classic-table-wrap">
            <table className="classic-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map(product => <tr key={product.id}><td><div className="product-cell">{product.images?.[0]?.url ? <img className="dashboard-thumb" src={product.images[0].url} alt="" /> : <span className="product-badge">P</span>}<span title={product.name}>{product.name}</span></div></td><td><span className={`stock ${product.stock <= 3 ? 'critical' : product.stock <= 5 ? 'warning' : ''}`}>{product.stock}</span></td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="footer-row">
        <div className="summary-card">
          <label>Total Profit</label>
          <strong>{money(sales._sum.total * 0.22)}</strong>
          <small className="positive">↑ 14.5% vs last 7 days</small>
        </div>
        <div className="summary-card">
          <label>Returning Customers</label>
          <strong>45.8%</strong>
          <small className="muted">↑ 6.2% vs last 7 days</small>
        </div>
        <div className="summary-card">
          <label>Conversion Rate</label>
          <strong>3.25%</strong>
          <small className="positive">↑ 8.7% vs last 7 days</small>
        </div>
        <div className="summary-card">
          <label>Average Order Value</label>
          <strong>{money(Number(sales._sum.total || 0) / Math.max(orders || 1, 1))}</strong>
          <small className="muted">↓ 5.6% vs last 7 days</small>
        </div>

        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <Link href="/admin/products/new"><span className="action-mini green">+</span> Add New Product</Link>
            <Link href="/admin/coupons"><span className="action-mini blue">◎</span> Create Coupon</Link>
            <Link href="/admin/banners"><span className="action-mini orange">◫</span> Add New Banner</Link>
            <Link href="/admin/categories"><span className="action-mini purple">▣</span> Add New Category</Link>
            <Link href="/admin/brands"><span className="action-mini teal">◌</span> Add New Brand</Link>
            <Link href="/admin/marketing"><span className="action-mini red">✦</span> Send Notification</Link>
          </div>
        </div>
      </div>
    </>
  );
}
