import { prisma } from '@/lib/prisma';
import BannerManager from '@/components/admin/BannerManager';

export default async function Banners() {
  const [banners, rightBanners] = await Promise.all([
    prisma.banner.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    }),

    prisma.homeRightBanner.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    }),
  ]);

  return (
    <BannerManager
      initialBanners={banners}
      initialRightBanners={rightBanners}
    />
  );
}