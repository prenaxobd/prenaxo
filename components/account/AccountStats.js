import Link from 'next/link';

export default function AccountStats({ stats }) {
  const items = [
    {
      label: 'Total Orders',
      value: stats.orders,
      href: '/account/orders',
      icon: '🛍',
      className: 'green',
    },
    {
      label: 'Pending Orders',
      value: stats.pending,
      href: '/account/orders',
      icon: '🚚',
      className: 'orange',
    },
    {
      label: 'Completed Orders',
      value: stats.completed,
      href: '/account/orders',
      icon: '✓',
      className: 'blue',
    },
    {
      label: 'Wishlist Items',
      value: stats.wishlist,
      href: '/wishlist',
      icon: '♡',
      className: 'pink',
    },
  ];

  return (
    <div className="account-stats">
      {items.map((item) => (
        <Link
          href={item.href}
          className={`account-stat-card ${item.className}`}
          key={item.label}
        >
          <div className="stat-icon">
            {item.icon}
          </div>

          <div>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        </Link>
      ))}
    </div>
  );
}