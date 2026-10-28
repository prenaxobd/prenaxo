'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initializeMetaPixel, trackMetaEvent } from '@/lib/meta-pixel';

export default function MetaPixel() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    initializeMetaPixel();
  }, []);

  useEffect(() => {
    if (!pathname || pathname === previousPathname.current) return;
    previousPathname.current = pathname;
    trackMetaEvent('PageView');
  }, [pathname]);

  return null;
}
