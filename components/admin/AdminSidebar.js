'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faGauge,
  faBox,
  faLayerGroup,
  faTags,
  faImages,
  faCartShopping,
  faUsers,
  faTicket,
  faWarehouse,
  faStar,
  faBullhorn,
  faMagnifyingGlass,
  faFileLines,
  faChartLine,
  faChartColumn,
  faHeadset,
  faClockRotateLeft,
  faGear,
  faBars,
  faXmark,
  faArrowRight,
  faMoneyBillTransfer,
} from '@fortawesome/free-solid-svg-icons';

const navigation = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: faGauge,
    exact: true,
  },

  {
    label: 'Products',
    href: '/admin/products',
    icon: faBox,
    permission: 'products.view',
  },

  {
    label: 'Categories',
    href: '/admin/categories',
    icon: faLayerGroup,
    permission: 'categories.view',
  },

  {
    label: 'Brands',
    href: '/admin/brands',
    icon: faTags,
    permission: 'brands.view',
  },

  /* =========================
     BANNERS
  ========================== */
  {
    label: 'Banners',
    href: '/admin/banners',
    icon: faImages,
    permission: 'banners.view',
  },

  {
    label: 'Orders',
    href: '/admin/orders',
    icon: faCartShopping,
    permission: 'orders.view',
  },

  {
    label: 'Customers',
    href: '/admin/customers',
    icon: faUsers,
    permission: 'customers.view',
  },

  {
    label: 'Coupons',
    href: '/admin/coupons',
    icon: faTicket,
    permission: 'coupons.view',
  },

  {
    label: 'Inventory',
    href: '/admin/inventory',
    icon: faWarehouse,
    permission: 'inventory.view',
  },

  {
    label: 'Reviews',
    href: '/admin/reviews',
    icon: faStar,
    permission: 'reviews.view',
  },

  {
    label: 'Marketing',
    href: '/admin/marketing',
    icon: faBullhorn,
    permission: 'marketing.view',
  },

  {
    label: 'Media Library',
    href: '/admin/media',
    icon: faImages,
    permission: 'media.view',
  },

  {
    label: 'SEO',
    href: '/admin/seo',
    icon: faMagnifyingGlass,
    permission: 'seo.view',
  },

  {
    label: 'Pages',
    href: '/admin/pages',
    icon: faFileLines,
    permission: 'pages.view',
  },

  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: faChartLine,
    permission: 'analytics.view',
  },

  {
    label: 'Reports',
    href: '/admin/reports',
    icon: faChartColumn,
    permission: 'reports.view',
  },

  {
    label: 'Support',
    href: '/admin/support',
    icon: faHeadset,
    permission: 'support.view',
  },

  {
    label: 'Activity Logs',
    href: '/admin/activity',
    icon: faClockRotateLeft,
    permission: 'activity.view',
  },

  {
    label: 'Settings',
    href: '/admin/settings',
    icon: faGear,
    permission: 'settings.view',
  },
   {
    label: 'Payment Methods',
    href: '/admin/payment-methods',
    icon: faMoneyBillTransfer,
    permission: 'settings.view',
   },
  {
    label: 'Users',
    href: '/admin/users',
    icon: faUsers,
    permission: 'admin_users.view',
  },

  {
    label: 'Roles',
    href: '/admin/roles',
    icon: faUsers,
    permission: 'admin_users.manage_permissions',
  },
];

export default function AdminSidebar({
  permissions = [],
}) {
  const pathname = usePathname();

  const isActive = (item) =>
    item.exact
      ? pathname === item.href
      : pathname === item.href ||
        pathname.startsWith(`${item.href}/`);

  const visibleNavigation =
    navigation.filter(
      (item) =>
        !item.permission ||
        permissions.includes(item.permission)
    );

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="admin-mobile-menu"
        type="button"
        aria-label="Open admin navigation"
        aria-controls="admin-navigation"
        onClick={() =>
          document.body.classList.add(
            'admin-nav-open'
          )
        }
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      {/* Mobile overlay */}
      <div
        className="admin-nav-overlay"
        role="presentation"
        onClick={() =>
          document.body.classList.remove(
            'admin-nav-open'
          )
        }
      />

      {/* Sidebar */}
      <aside
        className="admin-side"
        id="admin-navigation"
      >
        <div className="admin-side-top">
          <Link
            className="logo"
            href="/admin"
            onClick={() =>
              document.body.classList.remove(
                'admin-nav-open'
              )
            }
          >
            <img
              src="/uploads/prenaxo-logo.png"
              alt="Prenaxo"
            />
          </Link>

          <button
            className="admin-nav-close"
            type="button"
            aria-label="Close admin navigation"
            onClick={() =>
              document.body.classList.remove(
                'admin-nav-open'
              )
            }
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <p className="admin-caption">
          Admin Panel
        </p>

        <nav aria-label="Admin navigation">
          {visibleNavigation.map((item) => {
            const active = isActive(item);

            return (
              <Link
                className={
                  active
                    ? 'admin-nav-link active'
                    : 'admin-nav-link'
                }
                href={item.href}
                key={item.href}
                aria-current={
                  active
                    ? 'page'
                    : undefined
                }
                onClick={() =>
                  document.body.classList.remove(
                    'admin-nav-open'
                  )
                }
              >
                <span className="admin-nav-icon">
                  <FontAwesomeIcon
                    icon={item.icon}
                    fixedWidth
                  />
                </span>

                <span>
                  {item.label}
                </span>

                {active ? (
                  <FontAwesomeIcon
                    icon={faArrowRight}
                    className="admin-nav-arrow"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="admin-side-footer">
          <div className="admin-store-card">
            <div className="admin-store-avatar">
              K
            </div>

            <div>
              <strong>
                Prenaxo Store
              </strong>

              <small>
                View Store
              </small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}