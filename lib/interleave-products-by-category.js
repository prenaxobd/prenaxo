export function interleaveProductsByCategory(products) {
  const categoryQueues = new Map();

  for (const product of products) {
    const categoryId = product.categoryId || '__uncategorized__';
    const queue = categoryQueues.get(categoryId) || { items: [], index: 0 };
    queue.items.push(product);
    categoryQueues.set(categoryId, queue);
  }

  const mixedProducts = [];
  const queues = [...categoryQueues.values()];

  while (queues.length) {
    const remainingQueues = [];
    for (const queue of queues) {
      mixedProducts.push(queue.items[queue.index]);
      queue.index += 1;
      if (queue.index < queue.items.length) remainingQueues.push(queue);
    }
    queues.splice(0, queues.length, ...remainingQueues);
  }

  return mixedProducts;
}
