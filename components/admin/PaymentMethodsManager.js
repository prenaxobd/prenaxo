'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';
import styles from './PaymentMethodsManager.module.css';

const EMPTY_FORM = {
  code: '',
  name: '',
  type: 'MANUAL_WALLET',
  description: '',
  logoUrl: '',
  requiresTransactionId: true,
  gatewayProvider: '',
  gatewayChannel: '',
  accountNumber: '',
  accountName: '',
  bankName: '',
  branchName: '',
  routingNumber: '',
  instructions: '',
  active: true,
  sortOrder: 0,
};

export default function PaymentMethodsManager({
  initialMethods = [],
  gatewayConfigured = false,
  canManage = false,
}) {
  const [methods, setMethods] = useState(initialMethods);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const isEditing = Boolean(editingId);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setMessage('');
  }

  function editMethod(method) {
    setEditingId(method.id);

    setForm({
      code: method.code || '',
      name: method.name || '',
      type: method.type || 'MANUAL_WALLET',
      description: method.description || '',
      logoUrl: method.logoUrl || '',
      requiresTransactionId: Boolean(method.requiresTransactionId),
      gatewayProvider: method.gatewayProvider || '',
      gatewayChannel: method.gatewayChannel || '',
      accountNumber: method.accountNumber || '',
      accountName: method.accountName || '',
      bankName: method.bankName || '',
      branchName: method.branchName || '',
      routingNumber: method.routingNumber || '',
      instructions: method.instructions || '',
      active: Boolean(method.active),
      sortOrder: method.sortOrder ?? 0,
    });

    setMessage('');
    setError('');

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  async function saveMethod(event) {
    event.preventDefault();

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        type: form.type,
        description: form.description.trim(),
        logoUrl: form.logoUrl.trim(),
        requiresTransactionId: ['BANK_TRANSFER', 'MANUAL_WALLET'].includes(form.type) && Boolean(form.requiresTransactionId),
        gatewayProvider: form.type === 'GATEWAY' ? 'SSLCOMMERZ' : '',
        gatewayChannel: form.type === 'GATEWAY' ? form.gatewayChannel.trim() : '',
        accountNumber: form.accountNumber.trim(),
        accountName: form.accountName.trim(),
        bankName: form.bankName.trim(),
        branchName: form.branchName.trim(),
        routingNumber: form.routingNumber.trim(),
        instructions: form.instructions.trim(),
        sortOrder: Number(form.sortOrder) || 0,
        active: Boolean(form.active),
      };

      const response = await fetch(
        '/api/admin/payment-methods',
        {
          method: isEditing ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            isEditing
              ? {
                  id: editingId,
                  ...payload,
                }
              : payload
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to save payment method.'
        );
      }

      if (isEditing) {
        setMethods((current) =>
          current
            .map((method) =>
              method.id === editingId
                ? {
                    ...method,
                    ...data,
                  }
                : method
            )
            .sort(
              (a, b) =>
                Number(a.sortOrder || 0) -
                Number(b.sortOrder || 0)
            )
        );

        setMessage(
          'Payment method updated successfully.'
        );
      } else {
        setMethods((current) =>
          [...current, data].sort(
            (a, b) =>
              Number(a.sortOrder || 0) -
              Number(b.sortOrder || 0)
          )
        );

        setMessage(
          'Payment method added successfully.'
        );
      }

      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch (err) {
      setError(
        err.message ||
          'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleMethod(method) {
    if (method.active && !window.confirm(`Disable "${method.name}" at checkout? Existing orders will not be changed.`)) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        '/api/admin/payment-methods',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: method.id,
            active: !method.active,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to update payment method.'
        );
      }

      setMethods((current) =>
        current.map((item) =>
          item.id === method.id
            ? {
                ...item,
                ...data,
              }
            : item
        )
      );

      setMessage(
        `${method.name} ${
          data.active
            ? 'enabled'
            : 'disabled'
        } successfully.`
      );
    } catch (err) {
      setError(
        err.message ||
          'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleMethods = methods.filter((method) =>
    filter === 'ALL' || (filter === 'ACTIVE' ? method.active : !method.active)
  );
  const previewLogoUrl = /^https:\/\//i.test(form.logoUrl) ? form.logoUrl : '';

  return (
    <div className={styles.page}>
      {/* FORM */}

      {canManage && <form
        onSubmit={saveMethod}
        className={styles.form}
      >
        <div className={styles.formHeader}>
          <div>
            <h2 className={styles.formTitle}>
              {isEditing
                ? 'Edit Payment Method'
                : 'Add Payment Method'}
            </h2>

            <p className={styles.formSubtitle}>
              Payment information shown to customers
              at checkout.
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className={`${styles.button} ${styles.secondary}`}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className={styles.grid}>
          {/* CODE */}

          <label className={styles.field}>
            <span>Code</span>

            <input
              type="text"
              value={form.code}
              onChange={(e) =>
                updateField(
                  'code',
                  e.target.value
                )
              }
              placeholder="e.g. BKASH"
              required
              disabled={isEditing}
            />
          </label>

          {/* NAME */}

          <label className={styles.field}>
            <span>Name</span>

            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                updateField(
                  'name',
                  e.target.value
                )
              }
              placeholder="e.g. bKash"
              required
            />
          </label>

          <label className={styles.field}>
            <span>Method type</span>
            <select value={form.type} onChange={(e) => { updateField('type', e.target.value); if (e.target.value === 'GATEWAY' && !gatewayConfigured) updateField('active', false); }}>
              <option value="COD">Cash on delivery</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
              <option value="MANUAL_WALLET">Manual mobile wallet</option>
              <option value="GATEWAY">Online gateway</option>
            </select>
          </label>

          <label className={styles.field}>
            <span>Checkout logo URL</span>
            <input type="url" value={form.logoUrl} onChange={(e) => updateField('logoUrl', e.target.value)} placeholder="https://..." />
          </label>

          {/* SORT ORDER */}

          <label className={styles.field}>
            <span>Sort Order</span>

            <input
              type="number"
              min="0"
              value={form.sortOrder}
              onChange={(e) =>
                updateField(
                  'sortOrder',
                  e.target.value
                )
              }
            />
          </label>

          {/* ACTIVE */}

          <label
            className={`${styles.field} ${styles.activeField}`}
          >
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                updateField(
                  'active',
                  e.target.checked
                )
              }
              disabled={form.type === 'GATEWAY' && !gatewayConfigured && !form.active}
            />

            <span>Active</span>
          </label>
        </div>

        {['BANK_TRANSFER', 'MANUAL_WALLET'].includes(form.type) && (
          <label className={`${styles.field} ${styles.transactionRule}`}>
            <span><input type="checkbox" checked={form.requiresTransactionId} onChange={(e) => updateField('requiresTransactionId', e.target.checked)} /> Ask the customer for a transfer reference</span>
          </label>
        )}

        {form.type === 'GATEWAY' && (
          <section className={styles.gatewayConfig}>
            <div>
              <strong>SSLCommerz hosted checkout</strong>
              <span className={gatewayConfigured ? styles.configured : styles.notConfigured}>
                {gatewayConfigured ? 'Server credentials detected' : 'Server credentials not configured'}
              </span>
            </div>
            <label className={styles.field}>
              <span>Gateway channel (optional)</span>
              <select value={form.gatewayChannel} onChange={(e) => updateField('gatewayChannel', e.target.value)}>
                <option value="">All enabled channels</option>
                <option value="bkash">bKash</option>
                <option value="dbblmobilebanking">DBBL mobile banking</option>
                <option value="abbank">AB Bank</option>
                <option value="ibbl">Islami Bank</option>
                <option value="mtbl">Mutual Trust Bank</option>
                <option value="city">City Bank</option>
                <option value="bankasia">Bank Asia</option>
                <option value="upay">Upay</option>
                <option value="tapnpay">Tap N Pay</option>
              </select>
            </label>
            <small>Channel availability is controlled by your SSLCommerz merchant account. Credentials stay on the server.</small>
          </section>
        )}

        {/* DESCRIPTION */}

        <label
          className={`${styles.field} ${styles.full}`}
        >
          <span>Description</span>

          <textarea
            value={form.description}
            onChange={(e) =>
              updateField(
                'description',
                e.target.value
              )
            }
            placeholder="Short description shown at checkout"
            rows={3}
          />
        </label>

        {['BANK_TRANSFER', 'MANUAL_WALLET'].includes(form.type) && <>

        <h3 className={styles.sectionTitle}>
          Account / Bank Details
        </h3>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Account Number</span>

            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) =>
                updateField(
                  'accountNumber',
                  e.target.value
                )
              }
              placeholder="bKash / Nagad number"
            />
          </label>

          <label className={styles.field}>
            <span>Account Name</span>

            <input
              type="text"
              value={form.accountName}
              onChange={(e) =>
                updateField(
                  'accountName',
                  e.target.value
                )
              }
              placeholder="Account holder name"
            />
          </label>

          <label className={styles.field}>
            <span>Bank Name</span>

            <input
              type="text"
              value={form.bankName}
              onChange={(e) =>
                updateField(
                  'bankName',
                  e.target.value
                )
              }
              placeholder="Bank name"
            />
          </label>

          <label className={styles.field}>
            <span>Branch Name</span>

            <input
              type="text"
              value={form.branchName}
              onChange={(e) =>
                updateField(
                  'branchName',
                  e.target.value
                )
              }
              placeholder="Branch name"
            />
          </label>

          <label className={styles.field}>
            <span>Routing Number</span>

            <input
              type="text"
              value={form.routingNumber}
              onChange={(e) =>
                updateField(
                  'routingNumber',
                  e.target.value
                )
              }
              placeholder="Routing number"
            />
          </label>
        </div>
        </>}

        {/* INSTRUCTIONS */}

        <label
          className={`${styles.field} ${styles.full}`}
        >
          <span>Instructions</span>

          <textarea
            value={form.instructions}
            onChange={(e) =>
              updateField(
                'instructions',
                e.target.value
              )
            }
            placeholder="Payment instructions shown to customers"
            rows={4}
          />
        </label>

        <section className={styles.preview} aria-label="Checkout preview">
          <span>Checkout preview</span>
          <div className={styles.previewCard}>
            {previewLogoUrl ? <OptimizedImage src={previewLogoUrl} alt="" width={116} height={52} sizes="116px" /> : <div className={styles.previewMark}>{form.name.trim().slice(0, 2).toUpperCase() || 'PM'}</div>}
            <div><strong>{form.name || 'Payment method'}</strong><small>{form.description || 'Customer-facing description'}</small></div>
            <span>{form.type === 'COD' ? 'Pay on delivery' : form.type === 'GATEWAY' ? 'Secure checkout' : 'Manual transfer'}</span>
          </div>
          {form.type === 'GATEWAY' && <div className={styles.walletPreview}>
            <OptimizedImage src="https://res.cloudinary.com/ethp0qrs/image/upload/v1790904746/bkash-logo-horizontal-bangla-mobile-banking-app-icon-free-png.png" alt="bKash" width={86} height={32} sizes="86px" />
            <OptimizedImage src="https://res.cloudinary.com/ethp0qrs/image/upload/v1790904660/Nagad-Logo.wine.png" alt="Nagad" width={64} height={32} sizes="64px" />
            <OptimizedImage src="https://res.cloudinary.com/ethp0qrs/image/upload/v1790905387/rocket-color-logo-mobile-banking-icon-free-png.png" alt="Rocket" width={64} height={32} sizes="64px" />
            <small>Displayed channels depend on your merchant account.</small>
          </div>}
        </section>

        {/* MESSAGES */}

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {message && (
          <div className={styles.success}>
            {message}
          </div>
        )}

        {/* SUBMIT */}

        <div className={styles.actions}>
          <button
            type="submit"
            className={`${styles.button} ${styles.primary}`}
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : isEditing
              ? 'Update Payment Method'
              : 'Add Payment Method'}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className={`${styles.button} ${styles.secondary}`}
              disabled={loading}
            >
              Cancel
            </button>
          )}
        </div>
      </form>}

      {/* PAYMENT METHODS LIST */}

      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2>Payment Methods</h2>

          <div className={styles.listTools}>
            <div className={styles.filters} role="group" aria-label="Filter payment methods">
              {[['ALL', 'All'], ['ACTIVE', 'Active'], ['DISABLED', 'Disabled']].map(([value, label]) => <button type="button" key={value} className={filter === value ? styles.filterActive : ''} onClick={() => setFilter(value)}>{label}</button>)}
            </div>
            <span className={styles.count}>
            {visibleMethods.length} method
            {visibleMethods.length === 1
              ? ''
              : 's'}
            </span>
          </div>
        </div>

        {visibleMethods.length === 0 ? (
          <div className={styles.empty}>
            No payment methods found.
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={`${styles.table} admin-data-table`}>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Account details</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
            {visibleMethods.map((method) => (
              <tr
                key={method.id}
              >
                <td><div className={styles.methodIdentity}>{method.logoUrl && <OptimizedImage src={method.logoUrl} alt="" width={44} height={32} sizes="44px" />}<strong>{method.name}</strong><span className={styles.code}>{method.code}</span>{method.description && <small>{method.description}</small>}</div></td>
                <td><div className={styles.accountSummary}>{method.accountNumber && <span><b>Account</b>{method.accountNumber}</span>}{method.accountName && <span><b>Name</b>{method.accountName}</span>}{method.bankName && <span><b>Bank</b>{method.bankName}</span>}{!method.accountNumber && !method.accountName && !method.bankName && <em>No account details</em>}</div></td>
                <td><span className={styles.sortBadge}>#{String(method.sortOrder).padStart(2, '0')}</span></td>
                <td><span className={method.active ? `${styles.status} ${styles.activeStatus}` : `${styles.status} ${styles.disabledStatus}`}>{method.active ? 'Active' : 'Disabled'}</span></td>
                <td>{canManage && <div className={styles.tableActions}>
                    <button
                      type="button"
                      className={`${styles.button} ${styles.secondary}`}
                      onClick={() =>
                        editMethod(method)
                      }
                      disabled={loading}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className={`${styles.button} ${styles.secondary}`}
                      onClick={() =>
                        toggleMethod(method)
                      }
                      disabled={loading}
                    >
                      {method.active
                        ? 'Disable'
                        : 'Enable'}
                    </button>
                  </div>}</td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}