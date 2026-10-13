'use client';

import Link, { useLinkStatus } from 'next/link';

function PendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`category-navigation-pending ${pending ? 'is-visible' : ''}`}
      aria-hidden="true"
    />
  );
}

export default function CategoryNavigationLink({
  children,
  className,
  ...props
}) {
  return (
    <Link className={className} {...props}>
      {children}
      <PendingIndicator />
    </Link>
  );
}
