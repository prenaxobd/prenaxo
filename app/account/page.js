import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faBagShopping,
  faBoxOpen,
  faCheck,
  faCircleCheck,
  faCircleQuestion,
  faEnvelope,
  faHeart,
  faHouse,
  faLocationDot,
  faLock,
  faPen,
  faRightFromBracket,
  faRotateLeft,
  faStar,
  faTruckFast,
  faUser,
} from '@fortawesome/free-solid-svg-icons';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login?next=/account');
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

                take: 1,
              },
            },
          },
        },
      },
    },
  });

  const wishlist = await prisma.wishlist.findUnique({
    where: {
      userId: user.id,
    },

    include: {
      items: true,
    },
  });

  const totalOrders = orders.length;

  const pendingOrders = orders.filter(
    (order) =>
      order.status === 'PENDING' ||
      order.status === 'PROCESSING'
  ).length;

  const completedOrders = orders.filter(
    (order) =>
      order.status === 'DELIVERED'
  ).length;

  const wishlistCount =
    wishlist?.items?.length || 0;


  return (
    <main className="account-page">

      <div className="account-container">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="account-sidebar">

          <nav className="account-nav">

            <Link
              href="/account"
              className="account-nav-item active"
            >
              <span className="account-nav-icon"><FontAwesomeIcon icon={faHouse} aria-hidden="true" /></span>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/account/profile"
              className="account-nav-item"
            >
              <span className="account-nav-icon"><FontAwesomeIcon icon={faUser} aria-hidden="true" /></span>
              <span>Profile Information</span>
            </Link>

            <Link
              href="/account/orders"
              className="account-nav-item"
            >
              <span className="account-nav-icon"><FontAwesomeIcon icon={faBoxOpen} aria-hidden="true" /></span>
              <span>My Orders</span>
            </Link>

            <Link
              href="/wishlist"
              className="account-nav-item"
            >
              <span className="account-nav-icon"><FontAwesomeIcon icon={faHeart} aria-hidden="true" /></span>
              <span>Wishlist</span>

              {wishlistCount > 0 && (
                <b className="account-nav-count">
                  {wishlistCount}
                </b>
              )}
            </Link>

            <Link
              href="/account/addresses"
              className="account-nav-item"
            >
              <span className="account-nav-icon"><FontAwesomeIcon icon={faLocationDot} aria-hidden="true" /></span>
              <span>Addresses</span>
            </Link>

            <Link
              href="/account/password"
              className="account-nav-item"
            >
              <span className="account-nav-icon"><FontAwesomeIcon icon={faLock} aria-hidden="true" /></span>
              <span>Change Password</span>
            </Link>

            <Link
              href="/account/reviews"
              className="account-nav-item"
            >
              <span className="account-nav-icon"><FontAwesomeIcon icon={faStar} aria-hidden="true" /></span>
              <span>My Reviews</span>
            </Link>

            <div className="account-nav-divider" />

            <a
              href="/api/auth/logout"
              className="account-nav-item logout"
            >
              <span className="account-nav-icon"><FontAwesomeIcon icon={faRightFromBracket} aria-hidden="true" /></span>
              <span>Logout</span>
            </a>

          </nav>


          {/* HELP */}

          <div className="account-help-card">

            <div className="account-help-icon">
              <FontAwesomeIcon icon={faCircleQuestion} aria-hidden="true" />
            </div>

            <h3>
              Need Help?
            </h3>

            <p>
              We are here to help you with your
              shopping experience.
            </p>

            <Link href="/contact">
              Contact Support <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
            </Link>

          </div>

        </aside>


        {/* =================================================
            MAIN
        ================================================= */}

        <section className="account-main">


          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <div className="account-profile-header">

            <div className="account-profile-left">

              <div className="account-avatar">

                {user.image ? (

                  <img
                    src={user.image}
                    alt={user.name || 'Profile'}
                  />

                ) : (

                  <span>
                    {user.name
                      ?.charAt(0)
                      ?.toUpperCase() || 'U'}
                  </span>

                )}

              </div>


              <div className="account-profile-info">

                <div className="account-name-row">

                  <h1>
                    {user.name || 'Welcome'}
                  </h1>

                  <span className="verified-badge">
                    <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" /> Verified Account
                  </span>

                </div>

                <p>
                  <FontAwesomeIcon icon={faEnvelope} aria-hidden="true" /> {user.email}
                </p>

                <div className="account-motivation">
                  Good things take time, keep going.
                </div>

              </div>

            </div>


            <Link
              href="/account/profile"
              className="account-edit-button"
            >
              <FontAwesomeIcon icon={faPen} aria-hidden="true" /> Edit Profile
            </Link>

          </div>


          {/* =================================================
              STATS
          ================================================= */}

          <div className="account-stats">

            <div className="account-stat-card">

              <div className="account-stat-icon">
                <FontAwesomeIcon icon={faBagShopping} aria-hidden="true" />
              </div>

              <div>
                <span>Total Orders</span>
                <strong>{totalOrders}</strong>
              </div>

            </div>


            <div className="account-stat-card">

              <div className="account-stat-icon pending">
                <FontAwesomeIcon icon={faTruckFast} aria-hidden="true" />
              </div>

              <div>
                <span>Pending Orders</span>
                <strong>{pendingOrders}</strong>
              </div>

            </div>


            <div className="account-stat-card">

              <div className="account-stat-icon completed">
                <FontAwesomeIcon icon={faCheck} aria-hidden="true" />
              </div>

              <div>
                <span>Completed Orders</span>
                <strong>{completedOrders}</strong>
              </div>

            </div>


            <div className="account-stat-card">

              <div className="account-stat-icon wishlist">
                <FontAwesomeIcon icon={faHeart} aria-hidden="true" />
              </div>

              <div>
                <span>Wishlist Items</span>
                <strong>{wishlistCount}</strong>
              </div>

            </div>

          </div>


          {/* =================================================
              ALL ORDERS
          ================================================= */}

          <section className="account-orders-card">

            <div className="account-section-header">

              <div>

                <span className="account-eyebrow">
                  SHOPPING
                </span>

                <h2>
                  Recent Orders
                </h2>

                <p>
                  View all your orders and their current status.
                </p>

              </div>

              <Link href="/account/orders">
                View All Orders <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
              </Link>

            </div>


            {orders.length === 0 ? (

              <div className="account-empty-orders">

                <div>
                  <FontAwesomeIcon icon={faBagShopping} aria-hidden="true" />
                </div>

                <h3>
                  No orders yet
                </h3>

                <p>
                  You haven't placed any orders yet.
                </p>

                <Link href="/shop">
                  Start Shopping <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </Link>

              </div>

            ) : (

              <div className="orders-table-wrap">

                <div className="orders-table">

                  {/* TABLE HEADER */}

                  <div className="orders-row orders-header">

                    <div>
                      ORDER
                    </div>

                    <div>
                      DATE
                    </div>

                    <div>
                      STATUS
                    </div>

                    <div>
                      PAYMENT
                    </div>

                    <div>
                      TOTAL
                    </div>

                    <div>
                      ACTION
                    </div>

                  </div>


                  {/* ALL ORDERS */}

                  {orders.map((order) => {

                    const firstItem =
                      order.items?.[0];

                    const productImage =
                      firstItem
                        ?.product
                        ?.images?.[0]
                        ?.url;


                    return (

                      <div
                        className="orders-row"
                        key={order.id}
                      >

                        {/* ORDER */}

                        <div className="order-product-cell">

                          <div className="order-product-image">

                            {productImage ? (

                              <img
                                src={productImage}
                                alt={
                                  firstItem?.productName ||
                                  'Product'
                                }
                              />

                            ) : (

                              <span>
                                <FontAwesomeIcon icon={faBagShopping} aria-hidden="true" />
                              </span>

                            )}

                          </div>


                          <div>

                            <strong>
                              {order.orderNumber}
                            </strong>

                            <small>
                              {order.items.length}{' '}
                              {order.items.length === 1
                                ? 'item'
                                : 'items'}
                            </small>

                          </div>

                        </div>


                        {/* DATE */}

                        <div className="order-date">

                          {new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }
                          )}

                        </div>


                        {/* STATUS */}

                        <div>

                          <span
                            className={`order-status status-${order.status.toLowerCase()}`}
                          >
                            {order.status}
                          </span>

                        </div>


                        {/* PAYMENT */}

                        <div>

                          <span
                            className={`payment-status payment-${order.paymentStatus.toLowerCase()}`}
                          >
                            {order.paymentStatus}
                          </span>

                        </div>


                        {/* TOTAL */}

                        <div className="order-total">

                          ৳
                          {Number(
                            order.total
                          ).toLocaleString(
                            'en-BD'
                          )}

                        </div>


                        {/* ACTION */}

                        <div>

                          <Link
                            href={`/account/orders/${order.id}`}
                            className="order-view-button"
                          >
                            View
                          </Link>

                        </div>

                      </div>

                    );

                  })}

                </div>

              </div>

            )}

          </section>


          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <section className="quick-links-card">

            <div className="account-section-header">

              <div>

                <span className="account-eyebrow">
                  HELPFUL
                </span>

                <h2>
                  Quick Links
                </h2>

                <p>
                  Everything you need, right at your fingertips.
                </p>

              </div>

            </div>


            <div className="quick-links-grid">


              <Link
                href="/track-order"
                className="quick-link"
              >

                <div className="quick-link-icon">
                  <FontAwesomeIcon icon={faTruckFast} aria-hidden="true" />
                </div>

                <div>

                  <strong>
                    Track Your Order
                  </strong>

                  <span>
                    Check your order status
                  </span>

                </div>

                <b>
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </b>

              </Link>


              <Link
                href="/account/orders"
                className="quick-link"
              >

                <div className="quick-link-icon">
                  <FontAwesomeIcon icon={faRotateLeft} aria-hidden="true" />
                </div>

                <div>

                  <strong>
                    My Orders
                  </strong>

                  <span>
                    View all your orders
                  </span>

                </div>

                <b>
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </b>

              </Link>


              <Link
                href="/account/reviews"
                className="quick-link"
              >

                <div className="quick-link-icon">
                  <FontAwesomeIcon icon={faStar} aria-hidden="true" />
                </div>

                <div>

                  <strong>
                    My Reviews
                  </strong>

                  <span>
                    View your product reviews
                  </span>

                </div>

                <b>
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </b>

              </Link>


              <Link
                href="/contact"
                className="quick-link"
              >

                <div className="quick-link-icon">
                  <FontAwesomeIcon icon={faCircleQuestion} aria-hidden="true" />
                </div>

                <div>

                  <strong>
                    Help & Support
                  </strong>

                  <span>
                    Get help when you need it
                  </span>

                </div>

                <b>
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </b>

              </Link>


            </div>

          </section>


        </section>

      </div>

    </main>
  );
}