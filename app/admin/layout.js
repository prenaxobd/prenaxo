
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

const navigation = [
  ['Dashboard', '/admin'],
  ['Products', '/admin/products'],
  ['Categories', '/admin/categories'],
  ['Orders', '/admin/orders'],
  ['Reviews', '/admin/reviews'],
  ['Customers', '/admin/customers'],
  ['Coupons', '/admin/coupons'],
  ['Banners', '/admin/banners'],
  ['Delivery', '/admin/delivery'],
  ['Settings', '/admin/settings'],
];

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/login?next=/admin');
  }

  return (
    <div className="admin">

      <aside className="admin-side">

        <Link className="logo" href="/admin">
          k<span>h</span>atibazar
        </Link>

        <p className="admin-caption">
          ADMIN CONSOLE
        </p>

        <nav>
          {navigation.map(([label, href]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>

      </aside>

      <section className="admin-content">

        <header className="admin-header">

          <span>
            Store administration
          </span>

          <div>
            <Link href="/" target="_blank">
              View store
            </Link>

            <Link href="/admin/settings">
              Settings
            </Link>

            <span className="admin-user">
              {user.name}
            </span>
          </div>

        </header>

        <main className="admin-main">
          {children}
        </main>

      </section>

    </div>
  );
}

