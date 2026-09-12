'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Search,
  Download,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  ShoppingCart,
  Clock3,
  PackageCheck,
  CheckCircle2,
  XCircle,
  Wallet,
  RefreshCw,
  Eye,
  MapPin,
  CreditCard,
  Truck,
  CalendarDays,
  X,
} from 'lucide-react';

import styles from './OrderManager.module.css';

const STATUS_OPTIONS = [
  'PENDING',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

const PAYMENT_OPTIONS = [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function formatCurrency(value) {
  return `৳${Number(value || 0).toLocaleString('en-BD', {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(value) {
  if (!value) return '';

  return new Date(value).toLocaleTimeString('en-BD', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getShippingText(address) {
  if (!address) return '';

  if (typeof address === 'string') {
    return address;
  }

  return [
    address.area,
    address.thana,
    address.upazila,
    address.district,
    address.city,
    address.address,
  ]
    .filter(Boolean)
    .join(' ');
}

function getDeliveryType(order) {
  const text = getShippingText(order.shippingAddress).toLowerCase();

  const dhakaWords = [
    'dhaka',
    'ঢাকা',
  ];

  const insideDhaka = dhakaWords.some((word) =>
    text.includes(word.toLowerCase())
  );

  return insideDhaka ? 'INSIDE_DHAKA' : 'OUTSIDE_DHAKA';
}

function getStatusLabel(status) {
  const labels = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  return labels[status] || status;
}

function getPaymentLabel(status) {
  const labels = {
    PENDING: 'Pending',
    PAID: 'Paid',
    FAILED: 'Failed',
    REFUNDED: 'Refunded',
  };

  return labels[status] || status;
}

function getStatusClass(status) {
  return styles[`status_${String(status).toLowerCase()}`] || '';
}

function getPaymentClass(status) {
  return styles[`payment_${String(status).toLowerCase()}`] || '';
}

export default function OrderManager({
  initialOrders = [],
  initialStats,
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [stats, setStats] = useState(initialStats);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [deliveryFilter, setDeliveryFilter] = useState('');

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [sortBy, setSortBy] = useState('newest');

  const [selectedIds, setSelectedIds] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [updatingId, setUpdatingId] = useState(null);
  const [bulkLoading, setBulkLoading] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  const filteredOrders = useMemo(() => {
    const search = query.trim().toLowerCase();

    const result = orders.filter((order) => {
      const searchableText = [
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.customerPhone,
        order.user?.name,
        order.user?.email,
        order.user?.phone,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (search && !searchableText.includes(search)) {
        return false;
      }

      if (statusFilter && order.status !== statusFilter) {
        return false;
      }

      if (paymentFilter && order.paymentStatus !== paymentFilter) {
        return false;
      }

      if (deliveryFilter && getDeliveryType(order) !== deliveryFilter) {
        return false;
      }

      const created = new Date(order.createdAt);

      if (dateFrom) {
        const from = new Date(`${dateFrom}T00:00:00`);

        if (created < from) {
          return false;
        }
      }

      if (dateTo) {
        const to = new Date(`${dateTo}T23:59:59.999`);

        if (created > to) {
          return false;
        }
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === 'oldest') {
        return (
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
        );
      }

      if (sortBy === 'highest') {
        return Number(b.total) - Number(a.total);
      }

      if (sortBy === 'lowest') {
        return Number(a.total) - Number(b.total);
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

    return result;
  }, [
    orders,
    query,
    statusFilter,
    paymentFilter,
    deliveryFilter,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const allVisibleSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((order) =>
      selectedIds.includes(order.id)
    );

  function handleSearch(value) {
    setQuery(value);
    setPage(1);
  }

  function clearFilters() {
    setQuery('');
    setStatusFilter('');
    setPaymentFilter('');
    setDeliveryFilter('');
    setDateFrom('');
    setDateTo('');
    setSortBy('newest');
    setPage(1);
    setSelectedIds([]);
  }

  function toggleSelect(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function toggleSelectAll() {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter(
          (id) =>
            !paginatedOrders.some(
              (order) => order.id === id
            )
        )
      );
      return;
    }

    setSelectedIds((current) => {
      const ids = new Set(current);

      paginatedOrders.forEach((order) => {
        ids.add(order.id);
      });

      return Array.from(ids);
    });
  }

  async function updateOrder(id, payload) {
    setUpdatingId(id);

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          ...payload,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'Failed to update order.'
        );
      }

      setOrders((current) =>
        current.map((order) =>
          order.id === id
            ? {
                ...order,
                ...data,
              }
            : order
        )
      );

      setStats((current) => {
        const next = {
          ...current,
        };

        if (payload.status) {
          const previousOrder = orders.find(
            (order) => order.id === id
          );

          const previousStatus = previousOrder?.status;

          if (
            previousStatus &&
            previousStatus !== payload.status
          ) {
            if (previousStatus === 'PENDING') {
              next.pendingOrders = Math.max(
                0,
                next.pendingOrders - 1
              );
            }

            if (previousStatus === 'PROCESSING') {
              next.processingOrders = Math.max(
                0,
                next.processingOrders - 1
              );
            }

            if (previousStatus === 'DELIVERED') {
              next.completedOrders = Math.max(
                0,
                next.completedOrders - 1
              );
            }

            if (previousStatus === 'CANCELLED') {
              next.cancelledOrders = Math.max(
                0,
                next.cancelledOrders - 1
              );
            }
          }

          if (payload.status === 'PENDING') {
            next.pendingOrders += 1;
          }

          if (payload.status === 'PROCESSING') {
            next.processingOrders += 1;
          }

          if (payload.status === 'DELIVERED') {
            next.completedOrders += 1;
          }

          if (payload.status === 'CANCELLED') {
            next.cancelledOrders += 1;
          }
        }

        if (
          payload.paymentStatus === 'PAID'
        ) {
          const previousOrder = orders.find(
            (order) => order.id === id
          );

          if (previousOrder?.paymentStatus !== 'PAID') {
            next.totalRevenue += Number(
              previousOrder?.total || 0
            );
          }
        }

        return next;
      });

      setOpenMenuId(null);
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  async function bulkUpdate(status) {
    if (!selectedIds.length) {
      alert('Please select at least one order.');
      return;
    }

    setBulkLoading(true);

    try {
      const responses = await Promise.all(
        selectedIds.map((id) =>
          fetch('/api/admin/orders', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id,
              status,
            }),
          })
        )
      );

      const failed = responses.some(
        (response) => !response.ok
      );

      if (failed) {
        throw new Error(
          'Some orders could not be updated.'
        );
      }

      setOrders((current) =>
        current.map((order) =>
          selectedIds.includes(order.id)
            ? {
                ...order,
                status,
              }
            : order
        )
      );

      setSelectedIds([]);
    } catch (error) {
      alert(error.message);
    } finally {
      setBulkLoading(false);
    }
  }

  function exportCSV() {
    const headers = [
      'Order ID',
      'Customer',
      'Email',
      'Phone',
      'Total',
      'Payment',
      'Status',
      'Date',
    ];

    const rows = filteredOrders.map((order) => [
      order.orderNumber,
      order.customerName,
      order.customerEmail,
      order.customerPhone,
      Number(order.total),
      order.paymentStatus,
      order.status,
      new Date(order.createdAt).toLocaleString(),
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? '');

            return `"${text.replaceAll('"', '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `prenaxo-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>
            FULFILMENT
          </div>

          <h1 className={styles.title}>Orders</h1>

          <div className={styles.breadcrumb}>
            Dashboard
            <span>›</span>
            Orders
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={exportCSV}
          >
            <Download size={16} />
            Export
          </button>

          <Link
            href="/admin/orders/new"
            className={styles.primaryButton}
          >
            <Plus size={17} />
            Add Order
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard
          icon={<ShoppingCart size={19} />}
          iconClass={styles.iconBlue}
          label="Total Orders"
          value={stats.totalOrders}
        />

        <StatCard
          icon={<Clock3 size={19} />}
          iconClass={styles.iconOrange}
          label="Pending Orders"
          value={stats.pendingOrders}
        />

        <StatCard
          icon={<PackageCheck size={19} />}
          iconClass={styles.iconPurple}
          label="Processing"
          value={stats.processingOrders}
        />

        <StatCard
          icon={<CheckCircle2 size={19} />}
          iconClass={styles.iconGreen}
          label="Completed"
          value={stats.completedOrders}
        />

        <StatCard
          icon={<XCircle size={19} />}
          iconClass={styles.iconRed}
          label="Cancelled"
          value={stats.cancelledOrders}
        />

        <StatCard
          icon={<Wallet size={19} />}
          iconClass={styles.iconTeal}
          label="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          compact
        />
      </div>

      {/* Main Card */}
      <div className={styles.mainCard}>
        {/* Filters */}
        <div className={styles.filtersTop}>
          <div className={styles.searchWrap}>
            <Search size={17} />

            <input
              type="text"
              placeholder="Search orders..."
              value={query}
              onChange={(e) =>
                handleSearch(e.target.value)
              }
            />

            {query && (
              <button
                type="button"
                className={styles.clearSearch}
                onClick={() => handleSearch('')}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <SelectBox
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            placeholder="All Status"
            labelFormatter={getStatusLabel}
          />

          <SelectBox
            value={paymentFilter}
            onChange={(value) => {
              setPaymentFilter(value);
              setPage(1);
            }}
            options={PAYMENT_OPTIONS}
            placeholder="All Payment"
            labelFormatter={getPaymentLabel}
          />

          <SelectBox
            value={deliveryFilter}
            onChange={(value) => {
              setDeliveryFilter(value);
              setPage(1);
            }}
            options={[
              'INSIDE_DHAKA',
              'OUTSIDE_DHAKA',
            ]}
            placeholder="All Delivery"
            labelFormatter={(value) =>
              value === 'INSIDE_DHAKA'
                ? 'Inside Dhaka'
                : 'Outside Dhaka'
            }
          />

          <div className={styles.dateWrap}>
            <CalendarDays size={16} />

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
            />

            <span>–</span>

            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <SelectBox
            value={sortBy}
            onChange={setSortBy}
            options={[
              'newest',
              'oldest',
              'highest',
              'lowest',
            ]}
            placeholder="Sort"
            labelFormatter={(value) => {
              const map = {
                newest: 'Newest',
                oldest: 'Oldest',
                highest: 'Highest Total',
                lowest: 'Lowest Total',
              };

              return map[value];
            }}
          />

          <button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            <RefreshCw size={15} />
            Clear
          </button>
        </div>

        {/* Bulk bar */}
        {selectedIds.length > 0 && (
          <div className={styles.bulkBar}>
            <div>
              <strong>{selectedIds.length}</strong>{' '}
              order
              {selectedIds.length > 1 ? 's' : ''}{' '}
              selected
            </div>

            <div className={styles.bulkActions}>
              <span>Change status:</span>

              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={bulkLoading}
                  onClick={() => bulkUpdate(status)}
                >
                  {getStatusLabel(status)}
                </button>
              ))}

              <button
                type="button"
                className={styles.bulkCancel}
                onClick={() => setSelectedIds([])}
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                </th>

                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((order) => {
                const selected = selectedIds.includes(
                  order.id
                );

                const delivery =
                  getDeliveryType(order);

                return (
                  <tr
                    key={order.id}
                    className={
                      selected
                        ? styles.selectedRow
                        : ''
                    }
                  >
                    <td className={styles.checkboxCell}>
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleSelect(order.id)
                        }
                        aria-label={`Select ${order.orderNumber}`}
                      />
                    </td>

                    <td>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className={styles.orderNumber}
                      >
                        #{order.orderNumber}
                      </Link>

                      <div className={styles.itemCount}>
                        {order.items?.length || 0}{' '}
                        item
                        {(order.items?.length || 0) !==
                        1
                          ? 's'
                          : ''}
                      </div>
                    </td>

                    <td>
                      <div className={styles.customer}>
                        <div
                          className={
                            styles.customerAvatar
                          }
                        >
                          {order.user?.image ? (
                            <img
                              src={order.user.image}
                              alt=""
                            />
                          ) : (
                            order.customerName
                              ?.charAt(0)
                              ?.toUpperCase() || 'C'
                          )}
                        </div>

                        <div>
                          <div
                            className={
                              styles.customerName
                            }
                          >
                            {order.customerName}
                          </div>

                          <div
                            className={
                              styles.customerEmail
                            }
                          >
                            {order.customerEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={styles.phone}>
                        {order.customerPhone ||
                          order.user?.phone ||
                          '-'}
                      </span>
                    </td>

                    <td>
                      <strong className={styles.total}>
                        {formatCurrency(order.total)}
                      </strong>
                    </td>

                    <td>
                      <div
                        className={`${styles.badge} ${getPaymentClass(
                          order.paymentStatus
                        )}`}
                      >
                        <CreditCard size={13} />

                        {getPaymentLabel(
                          order.paymentStatus
                        )}
                      </div>

                      <div
                        className={
                          styles.paymentMethod
                        }
                      >
                        {order.paymentMethod || '-'}
                      </div>
                    </td>

                    <td>
                      <div className={styles.deliveryBox}>
                        <div className={styles.courierBadge}>
                          <Truck size={13} />
                          Courier
                        </div>

                        <span>
                          {delivery ===
                          'INSIDE_DHAKA'
                            ? 'Inside Dhaka'
                            : 'Outside Dhaka'}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div
                        className={`${styles.badge} ${getStatusClass(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(
                          order.status
                        )}
                      </div>
                    </td>

                    <td>
                      <div
                        className={styles.datePrimary}
                      >
                        {formatDate(order.createdAt)}
                      </div>

                      <div className={styles.dateSecondary}>
                        {formatTime(order.createdAt)}
                      </div>
                    </td>

                    <td>
                      <div
                        className={
                          styles.actionWrap
                        }
                      >
                        <button
                          type="button"
                          className={
                            styles.actionButton
                          }
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === order.id
                                ? null
                                : order.id
                            )
                          }
                          aria-label="Order actions"
                        >
                          <MoreVertical size={17} />
                        </button>

                        {openMenuId === order.id && (
                          <div
                            className={
                              styles.actionMenu
                            }
                          >
                            <Link
                              href={`/admin/orders/${order.id}`}
                              onClick={() =>
                                setOpenMenuId(null)
                              }
                            >
                              <Eye size={15} />
                              View Order
                            </Link>

                            <button
                              type="button"
                              disabled={
                                updatingId === order.id
                              }
                              onClick={() =>
                                updateOrder(
                                  order.id,
                                  {
                                    status: 'PROCESSING',
                                  }
                                )
                              }
                            >
                              Processing
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId === order.id
                              }
                              onClick={() =>
                                updateOrder(
                                  order.id,
                                  {
                                    status: 'SHIPPED',
                                  }
                                )
                              }
                            >
                              Shipped
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId === order.id
                              }
                              onClick={() =>
                                updateOrder(
                                  order.id,
                                  {
                                    status: 'DELIVERED',
                                  }
                                )
                              }
                            >
                              Completed
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId === order.id
                              }
                              onClick={() =>
                                updateOrder(
                                  order.id,
                                  {
                                    paymentStatus: 'PAID',
                                  }
                                )
                              }
                            >
                              Mark Paid
                            </button>

                            <button
                              type="button"
                              disabled={
                                updatingId === order.id
                              }
                              onClick={() =>
                                updateOrder(
                                  order.id,
                                  {
                                    status: 'CANCELLED',
                                  }
                                )
                              }
                            >
                              Cancel Order
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!paginatedOrders.length && (
                <tr>
                  <td
                    colSpan={10}
                    className={styles.emptyCell}
                  >
                    <div
                      className={styles.emptyState}
                    >
                      <ShoppingCart size={28} />

                      <h3>No orders found</h3>

                      <p>
                        Try changing your search or
                        filters.
                      </p>

                      <button
                        type="button"
                        onClick={clearFilters}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className={styles.tableFooter}>
          <div className={styles.footerInfo}>
            Showing{' '}
            <strong>
              {filteredOrders.length === 0
                ? 0
                : (safePage - 1) * pageSize + 1}
            </strong>
            {' – '}
            <strong>
              {Math.min(
                safePage * pageSize,
                filteredOrders.length
              )}
            </strong>
            {' '}of{' '}
            <strong>
              {filteredOrders.length}
            </strong>{' '}
            orders
          </div>

          <div className={styles.pagination}>
            <span className={styles.rowsLabel}>
              Rows per page
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(
                  Number(e.target.value)
                );
                setPage(1);
              }}
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1)
                )
              }
            >
              <ChevronLeft size={17} />
            </button>

            {Array.from(
              {
                length: Math.min(totalPages, 5),
              },
              (_, index) => index + 1
            ).map((number) => (
              <button
                key={number}
                type="button"
                className={
                  safePage === number
                    ? styles.activePage
                    : ''
                }
                onClick={() => setPage(number)}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
                )
              }
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  iconClass,
  label,
  value,
  compact = false,
}) {
  return (
    <div className={styles.statCard}>
      <div
        className={`${styles.statIcon} ${iconClass}`}
      >
        {icon}
      </div>

      <div className={styles.statContent}>
        <div className={styles.statLabel}>
          {label}
        </div>

        <div
          className={`${styles.statValue} ${
            compact ? styles.statValueCompact : ''
          }`}
        >
          {value}
        </div>

        <div className={styles.statSubtext}>
          Live database data
        </div>
      </div>
    </div>
  );
}

function SelectBox({
  value,
  onChange,
  options,
  placeholder,
  labelFormatter,
}) {
  return (
    <div className={styles.selectWrap}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {labelFormatter
              ? labelFormatter(option)
              : option}
          </option>
        ))}
      </select>

      <ChevronDown size={15} />
    </div>
  );
}