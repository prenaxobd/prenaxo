import { prisma } from '@/lib/prisma';
import BannerManager from '@/components/admin/BannerManager';

export default async function Banners() {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  return <BannerManager initialBanners={banners} />;
}
