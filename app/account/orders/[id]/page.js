import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AccountSidebar from '@/components/account/AccountSidebar';

export default async function OrderDetailsPage({ params }) {

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/account/orders');
  }

  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      items: {
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
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="account-page">

      <div className="account-container">

        <AccountSidebar user={user} />

        <section className="account-main">

          <div className="account-page-header">

            <div>
              <span className="account-eyebrow">
                ORDER DETAILS
              </span>

              <h1>
                {order.orderNumber}
              </h1>

              <p>
                {new Date(
                  order.createdAt
                ).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>

            <Link
              href="/account/orders"
              className="account-back-btn"
            >
              ← My Orders
            </Link>

          </div>

          <div className="account-card">

            <div className="order-detail-status">
              <span>Status</span>

              <strong
                className={`order-status status-${order.status.toLowerCase()}`}
              >
                {order.status}
              </strong>
            </div>

            <div className="order-detail-items">

              {order.items.map((item) => {

                const image =
                  item.product?.images?.[0]?.url;

                return (
                  <div
                    className="order-detail-item"
                    key={item.id}
                  >

                    <div className="order-detail-image">

                      {image ? (
                        <img
                          src={image}
                          alt={item.productName}
                        />
                      ) : (
                        <span>🛍</span>
                      )}

                    </div>

                    <div className="order-detail-info">

                      <strong>
                        {item.productName}
                      </strong>

                      <span>
                        Quantity: {item.quantity}
                      </span>

                    </div>

                    <strong>
                      ৳{(
                        Number(item.unitPrice) *
                        item.quantity
                      ).toLocaleString()}
                    </strong>

                  </div>
                );
              })}

            </div>

            <div className="order-total-box">

              <div>
                <span>Subtotal</span>
                <strong>
                  ৳{Number(order.subtotal).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Discount</span>
                <strong>
                  -৳{Number(order.discount).toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Shipping</span>
                <strong>
                  ৳{Number(
                    order.shippingCharge
                  ).toLocaleString()}
                </strong>
              </div>

              <div className="grand-total">
                <span>Total</span>
                <strong>
                  ৳{Number(order.total).toLocaleString()}
                </strong>
              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}