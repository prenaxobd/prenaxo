import { prisma } from '@/lib/prisma';
import AttributeManager from '@/components/admin/AttributeManager';

export default async function AttributesPage() {
  const attributes = await prisma.attribute.findMany({ include: { values: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] } }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  return <AttributeManager initialAttributes={attributes} />;
}
