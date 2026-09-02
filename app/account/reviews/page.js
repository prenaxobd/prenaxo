import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AccountSidebar from '@/components/account/AccountSidebar';

export default async function ReviewsPage() {

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/account/reviews');
  }

  const reviews = await prisma.review.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      product: {
        include: {
          images: {
            orderBy: {
              sortOrder: 'asc',
            },
          },
        },
      },
    },
  });

  return (
    <main className="account-page">

      <div className="account-container">

        <AccountSidebar user={user} />

        <section className="account-main">

          <div className="account-page-header">

            <div>
              <span className="account-eyebrow">FEEDBACK</span>
              <h1>My Reviews</h1>
              <p>Your reviews and ratings.</p>
            </div>

            <Link
              href="/account"
              className="account-back-btn"
            >
              ← Account
            </Link>

          </div>

          <div className="account-card">

            {reviews.length === 0 ? (

              <div className="account-empty">

                <div>☆</div>

                <h3>No reviews yet</h3>

                <p>
                  Your product reviews will appear here.
                </p>

                <Link
                  href="/shop"
                  className="account-primary-btn"
                >
                  Browse Products
                </Link>

              </div>

            ) : (

              <div className="reviews-list">

                {reviews.map((review) => {

                  const image =
                    review.product?.images?.[0]?.url;

                  return (
                    <div
                      className="review-item"
                      key={review.id}
                    >

                      <div className="review-product-image">

                        {image ? (
                          <img
                            src={image}
                            alt={review.product.name}
                          />
                        ) : (
                          <span>🛍</span>
                        )}

                      </div>

                      <div className="review-content">

                        <Link
                          href={`/product/${review.product.slug}`}
                          className="review-product-name"
                        >
                          {review.product.name}
                        </Link>

                        <div className="review-stars">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>

                        {review.comment && (
                          <p>
                            {review.comment}
                          </p>
                        )}

                        <small>
                          {new Date(
                            review.createdAt
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </small>

                      </div>

                      <span
                        className={
                          review.approved
                            ? 'review-approved'
                            : 'review-pending'
                        }
                      >
                        {review.approved
                          ? 'Approved'
                          : 'Pending'}
                      </span>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

        </section>

      </div>

    </main>
  );
}