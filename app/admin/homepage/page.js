import { prisma } from '@/lib/prisma';
import HomepageSectionManager from '@/components/admin/HomepageSectionManager';

export default async function HomepageSettings() {
  const [sections, categories] = await Promise.all([
    prisma.homepageSection.findMany({ include: { category: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ]);
  return <HomepageSectionManager initialSections={sections} categories={categories} />;
}
