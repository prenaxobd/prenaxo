export function getCategorySubtreeIds(categories, rootId) {
  const childrenByParent = new Map();

  for (const category of categories) {
    if (!category.parentId) continue;
    const children = childrenByParent.get(category.parentId) || [];
    children.push(category.id);
    childrenByParent.set(category.parentId, children);
  }

  const visited = new Set([rootId]);
  const pending = [rootId];

  while (pending.length) {
    const parentId = pending.pop();
    for (const childId of childrenByParent.get(parentId) || []) {
      if (visited.has(childId)) continue;
      visited.add(childId);
      pending.push(childId);
    }
  }

  return [...visited];
}
