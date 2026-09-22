let mergeRequest = null;

export function mergeGuestCart(items) {
  if (!items.length) return Promise.resolve(true);
  if (mergeRequest) return mergeRequest;

  mergeRequest = fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        attributeValueIds: item.attributeValueIds || [],
        quantity: item.quantity,
      })),
    }),
  }).then((response) => {
    if (!response.ok) throw new Error('Unable to merge guest cart.');
    return true;
  }).finally(() => {
    mergeRequest = null;
  });

  return mergeRequest;
}
