import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function Pages() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: 'desc' } });
  return <><div className="admin-page-heading"><div><div className="eyebrow">Content</div><h1>Pages</h1><p className="muted">Manage published static content using the existing Page model.</p></div></div><div className="admin-table-wrap"><table className="table"><thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Updated</th><th>SEO</th></tr></thead><tbody>{pages.map(page => <tr key={page.id}><td><strong>{page.title}</strong></td><td>/{page.slug}</td><td><span className={page.published && page.active ? 'status active' : 'status'}>{page.published && page.active ? 'Published' : 'Draft'}</span></td><td>{page.updatedAt.toLocaleDateString()}</td><td><Link href="/admin/seo/pages">Edit SEO</Link></td></tr>)}</tbody></table>{!pages.length && <p className="muted">No pages yet. The Page model is ready for content creation.</p>}</div></>;
}
