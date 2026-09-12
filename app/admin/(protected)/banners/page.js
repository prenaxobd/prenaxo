import { prisma } from '@/lib/prisma';
import BannerManager from '@/components/admin/BannerManager';

export default async function Banners() {
  const [banners, rightBanner] = await Promise.all([
    prisma.banner.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    }),

    prisma.homeRightBanner.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    }),
  ]);

  return (
    <BannerManager
      initialBanners={banners}
      initialRightBanner={rightBanner}
    />
  );
}