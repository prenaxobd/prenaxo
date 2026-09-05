import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function Marketing() {
  const [coupons, banners] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { code: 'asc' }, take: 8 }),
    prisma.banner.findMany({ orderBy: { sortOrder: 'asc' }, take: 8 }),
  ]);
  const safeCoupons = coupons.map(coupon => ({ id: coupon.id, code: coupon.code, type: coupon.type, value: Number(coupon.value), active: coupon.active }));
  const activeCoupons = safeCoupons.filter(coupon => coupon.active).length;
  const activeBanners = banners.filter(banner => banner.active).length;
  return <>
    <div className="admin-page-heading"><div><div className="eyebrow">Growth</div><h1>Marketing</h1><p className="muted">Manage promotions already connected to your store.</p></div><Link className="btn" href="/admin/coupons">Create coupon</Link></div>
    <div className="stat-grid"><div className="stat"><span className="muted">Active coupons</span><strong>{activeCoupons}</strong><small className="positive">Live promotions</small></div><div className="stat"><span className="muted">Active banners</span><strong>{activeBanners}</strong><small className="muted">Homepage placements</small></div><div className="stat"><span className="muted">Subscribers</span><strong>N/A</strong><small className="muted">Newsletter table unavailable</small></div><div className="stat"><span className="muted">Campaigns</span><strong>N/A</strong><small className="muted">No live campaign persistence</small></div></div>
    <div className="admin-dashboard-grid"><section className="section"><div className="section-head"><div><h2>Promotions</h2><p className="muted">Existing coupon codes</p></div><Link href="/admin/coupons">Manage</Link></div><div className="admin-table-wrap"><table className="table"><thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Status</th></tr></thead><tbody>{safeCoupons.map(coupon => <tr key={coupon.id}><td><strong>{coupon.code}</strong></td><td>{coupon.type}</td><td>{coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `৳${coupon.value}`}</td><td><span className={coupon.active ? 'status active' : 'status'}>{coupon.active ? 'Active' : 'Inactive'}</span></td></tr>)}</tbody></table>{!safeCoupons.length && <p className="muted">No coupons yet.</p>}</div></section><section className="section"><div className="section-head"><div><h2>Promotional banners</h2><p className="muted">Existing banner placements</p></div><Link href="/admin/banners">Manage</Link></div><div className="top-products">{banners.map(banner => <div className="top-product" key={banner.id}><span className="top-product-rank">{banner.sortOrder + 1}</span><span><strong>{banner.title}</strong><small>{banner.link || 'No destination link'}</small></span><span className={banner.active ? 'positive' : 'muted'}>{banner.active ? 'Live' : 'Off'}</span></div>)}</div>{!banners.length && <p className="muted">No banners yet.</p>}</section></div>
  </>;
}
