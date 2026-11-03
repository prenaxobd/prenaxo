'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrderStatusRefresh() {
  const router = useRouter();

  useEffect(() => {
    const interval = window.setInterval(() => router.refresh(), 20000);
    return () => window.clearInterval(interval);
  }, [router]);

  return null;
}
