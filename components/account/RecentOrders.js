import Link from 'next/link';

function formatDate(date) {
  return new Intl.DateTimeFormat('en-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export default function RecentOrders({ orders }) {
  return (
    <div className="account-panel recent-orders">
      <div className="panel-heading">
        <div>
          <span className="panel-eyebrow">SHOPPING</span>
          <h3>Recent Orders</h3>
        </div>

        <Link href="/account/orders">
          View All Orders →
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="empty-account-state">
          <div>🛍</div>
          <h4>No orders yet</h4>
          <p>When you place an order, it will appear here.</p>

          <Link href="/shop">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                    <small>
                      {order.itemCount} item
                      {order.itemCount !== 1 ? 's' : ''}
                    </small>
                  </td>

                  <td>
                    {formatDate(order.createdAt)}
                  </td>

                  <td>
                    <span
                      className={`order-status status-${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td>
                    <strong>
                      ৳{order.total.toLocaleString('en-BD')}
                    </strong>
                  </td>

                  <td>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="order-view-btn"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}