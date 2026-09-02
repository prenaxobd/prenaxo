import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import AccountSidebar from '@/components/account/AccountSidebar';

export default async function OrdersPage() {

  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/account/orders');
  }

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: 'desc',
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

  return (
    <main className="account-page">

      <div className="account-container">

        <AccountSidebar user={user} />

        <section className="account-main">

          <div className="account-page-header">

            <div>
              <span className="account-eyebrow">
                SHOPPING
              </span>

              <h1>My Orders</h1>

              <p>
                View and manage all your orders.
              </p>
            </div>

            <Link
              href="/account"
              className="account-back-btn"
            >
              ← Account
            </Link>

          </div>

          {orders.length === 0 ? (

            <div className="account-card">
              <div className="account-empty">

                <div>🛍</div>

                <h3>No orders found</h3>

                <p>
                  You haven't placed an order yet.
                </p>

                <Link
                  href="/shop"
                  className="account-primary-btn"
                >
                  Start Shopping
                </Link>

              </div>
            </div>

          ) : (

            <div className="orders-list">

              {orders.map((order) => {

                const firstItem = order.items?.[0];

                const image =
                  firstItem?.product?.images?.[0]?.url;

                return (
                  <div
                    className="account-card order-card"
                    key={order.id}
                  >

                    <div className="order-card-top">

                      <div>
                        <span className="account-eyebrow">
                          ORDER
                        </span>

                        <h2>
                          {order.orderNumber}
                        </h2>

                        <p>
                          {new Date(
                            order.createdAt
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>

                      <span
                        className={`order-status status-${order.status.toLowerCase()}`}
                      >
                        {order.status}
                      </span>

                    </div>

                    <div className="order-items-preview">

                      {order.items.slice(0, 4).map((item) => {

                        const itemImage =
                          item.product?.images?.[0]?.url;

                        return (
                          <div
                            className="order-item-preview"
                            key={item.id}
                          >

                            {itemImage ? (
                              <img
                                src={itemImage}
                                alt={item.productName}
                              />
                            ) : (
                              <div>
                                🛍
                              </div>
                            )}

                            <span>
                              ×{item.quantity}
                            </span>

                          </div>
                        );
                      })}

                    </div>

                    <div className="order-card-bottom">

                      <div>
                        <span>
                          {order.items.length} item
                          {order.items.length !== 1
                            ? 's'
                            : ''}
                        </span>

                        <strong>
                          ৳{Number(
                            order.total
                          ).toLocaleString()}
                        </strong>
                      </div>

                      <Link
                        href={`/account/orders/${order.id}`}
                        className="account-primary-btn"
                      >
                        View Order
                      </Link>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}