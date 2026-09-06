import { prisma } from '@/lib/prisma';
import ReviewManager from '@/components/admin/ReviewManager';

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },

      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <ReviewManager
      initialReviews={reviews}
    />
  );
}