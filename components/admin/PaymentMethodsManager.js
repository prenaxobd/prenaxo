'use client';

import { useState } from 'react';
import styles from './PaymentMethodsManager.module.css';

const EMPTY_FORM = {
  code: '',
  name: '',
  description: '',
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
}) {
  const [methods, setMethods] = useState(initialMethods);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
      description: method.description || '',
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
        description: form.description.trim(),
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

  async function deleteMethod(method) {
    const confirmed = window.confirm(
      `Disable "${method.name}"?`
    );

    if (!confirmed) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(
        `/api/admin/payment-methods?id=${encodeURIComponent(
          method.id
        )}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Unable to disable payment method.'
        );
      }

      setMethods((current) =>
        current.map((item) =>
          item.id === method.id
            ? {
                ...item,
                ...data,
                active: false,
              }
            : item
        )
      );

      setMessage(
        `${method.name} has been disabled.`
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

  return (
    <div className={styles.page}>
      {/* FORM */}

      <form
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
            />

            <span>Active</span>
          </label>
        </div>

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

        {/* ACCOUNT DETAILS */}

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
      </form>

      {/* PAYMENT METHODS LIST */}

      <div className={styles.listSection}>
        <div className={styles.listHeader}>
          <h2>Payment Methods</h2>

          <span className={styles.count}>
            {methods.length} method
            {methods.length === 1
              ? ''
              : 's'}
          </span>
        </div>

        {methods.length === 0 ? (
          <div className={styles.empty}>
            No payment methods found.
          </div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
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
            {methods.map((method) => (
              <tr
                key={method.id}
              >
                <td><div className={styles.methodIdentity}><strong>{method.name}</strong><span className={styles.code}>{method.code}</span>{method.description && <small>{method.description}</small>}</div></td>
                <td><div className={styles.accountSummary}>{method.accountNumber && <span><b>Account</b>{method.accountNumber}</span>}{method.accountName && <span><b>Name</b>{method.accountName}</span>}{method.bankName && <span><b>Bank</b>{method.bankName}</span>}{!method.accountNumber && !method.accountName && !method.bankName && <em>No account details</em>}</div></td>
                <td><span className={styles.sortBadge}>#{String(method.sortOrder).padStart(2, '0')}</span></td>
                <td><span className={method.active ? `${styles.status} ${styles.activeStatus}` : `${styles.status} ${styles.disabledStatus}`}>{method.active ? 'Active' : 'Disabled'}</span></td>
                <td><div className={styles.tableActions}>
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

                    {method.active && (
                      <button
                        type="button"
                        className={`${styles.button} ${styles.danger}`}
                        onClick={() =>
                          deleteMethod(method)
                        }
                        disabled={loading}
                      >
                        Disable
                      </button>
                    )}
                  </div></td>
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