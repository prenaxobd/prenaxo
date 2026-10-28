'use client';

import { useEffect, useRef } from 'react';
import { createMetaCommerceParameters, trackMetaEvent } from '@/lib/meta-pixel';

export default function MetaProductView({ productId, productName, price }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current || !productId) return;
    tracked.current = true;
    trackMetaEvent('ViewContent', {
      ...createMetaCommerceParameters(
        [{ productId, quantity: 1, unitPrice: price }],
        price
      ),
      content_name: productName,
      content_type: 'product',
    });
  }, [price, productId, productName]);

  return null;
}
