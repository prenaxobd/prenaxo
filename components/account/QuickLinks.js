import Link from 'next/link';

const links = [
  {
    title: 'Track Your Order',
    text: 'Check your order status',
    href: '/track-order',
    icon: '🚚',
  },
  {
    title: 'Return & Refund',
    text: 'Easy return process',
    href: '/contact',
    icon: '↩',
  },
  {
    title: 'My Reviews',
    text: 'View your product reviews',
    href: '/account/reviews',
    icon: '☆',
  },
  {
    title: 'Help & Support',
    text: 'Get help when you need',
    href: '/contact',
    icon: '?',
  },
];

export default function QuickLinks() {
  return (
    <div className="account-panel quick-links">
      <div className="panel-heading">
        <div>
          <span className="panel-eyebrow">HELPFUL</span>
          <h3>Quick Links</h3>
        </div>
      </div>

      <div className="quick-links-list">
        {links.map((item) => (
          <Link
            href={item.href}
            key={item.title}
            className="quick-link"
          >
            <span className="quick-link-icon">
              {item.icon}
            </span>

            <span className="quick-link-text">
              <strong>{item.title}</strong>
              <small>{item.text}</small>
            </span>

            <span className="quick-link-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}