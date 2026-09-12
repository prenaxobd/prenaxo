'use client';

import { useState } from 'react';
import MediaUploader from './MediaUploader';

const emptyBanner = {
  image: '',
  link: '',
  sortOrder: 0,
  active: true,
};

const emptyRightBanner = {
  image: '',
  link: '',
  isActive: true,
};

function BannerPreview({ src, alt = 'Banner preview' }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div className="admin-banner-preview-empty">
        No image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="admin-banner-preview-image"
      onError={() => setBroken(true)}
    />
  );
}

export default function BannerManager({
  initialBanners = [],
  initialRightBanner = null,
}) {
  const [banners, setBanners] =
    useState(initialBanners);

  const [rightBanner, setRightBanner] =
    useState(initialRightBanner);

  const [form, setForm] = useState(null);
  const [rightForm, setRightForm] =
    useState(null);

  const [message, setMessage] = useState('');
  const [rightMessage, setRightMessage] =
    useState('');

  const [saving, setSaving] = useState(false);
  const [savingRight, setSavingRight] =
    useState(false);

  const [actionId, setActionId] =
    useState(null);

  function openAddBanner() {
    setForm({
      ...emptyBanner,
      sortOrder:
        banners.length > 0
          ? Math.max(
              ...banners.map(
                (item) =>
                  Number(item.sortOrder) || 0
              )
            ) + 1
          : 1,
    });

    setMessage('');
  }

  function openEditBanner(banner) {
    setForm({
      id: banner.id,
      image:
        banner.image ||
        banner.desktopImage ||
        '',
      link: banner.link || '',
      sortOrder:
        Number(banner.sortOrder) || 0,
      active:
        Boolean(banner.active),
    });

    setMessage('');
    setActionId(null);
  }

  async function saveBanner(event) {
    event.preventDefault();

    if (!form?.image) {
      setMessage(
        'Please upload a banner image.'
      );
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(
        '/api/admin/banners',
        {
          method: form.id ? 'PATCH' : 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            id: form.id,
            image: form.image,
            link:
              form.link?.trim() || null,
            sortOrder:
              Number(form.sortOrder) || 0,
            active:
              Boolean(form.active),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to save banner.'
        );
      }

      if (form.id) {
        setBanners((items) =>
          items
            .map((item) =>
              item.id === data.id
                ? data
                : item
            )
            .sort(
              (a, b) =>
                Number(a.sortOrder) -
                Number(b.sortOrder)
            )
        );
      } else {
        setBanners((items) =>
          [...items, data].sort(
            (a, b) =>
              Number(a.sortOrder) -
              Number(b.sortOrder)
          )
        );
      }

      setForm(null);
      setMessage('Banner saved successfully.');
    } catch (error) {
      setMessage(
        error.message ||
          'Unable to save banner.'
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteBanner(id) {
    if (
      !confirm(
        'Delete this hero banner?'
      )
    ) {
      return;
    }

    setActionId(null);

    try {
      const response = await fetch(
        `/api/admin/banners?id=${encodeURIComponent(
          id
        )}`,
        {
          method: 'DELETE',
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to delete banner.'
        );
      }

      setBanners((items) =>
        items.filter(
          (item) => item.id !== id
        )
      );

      setMessage('Banner deleted.');
    } catch (error) {
      setMessage(
        error.message ||
          'Unable to delete banner.'
      );
    }
  }

  async function toggleBanner(
    banner
  ) {
    setActionId(null);

    try {
      const response = await fetch(
        '/api/admin/banners',
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            id: banner.id,
            active:
              !banner.active,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to update status.'
        );
      }

      setBanners((items) =>
        items.map((item) =>
          item.id === data.id
            ? data
            : item
        )
      );
    } catch (error) {
      setMessage(
        error.message ||
          'Unable to update status.'
      );
    }
  }

  function openRightForm() {
    setRightForm({
      ...emptyRightBanner,
      ...(rightBanner || {}),
    });

    setRightMessage('');
  }

  async function saveRightBanner(
    event
  ) {
    event.preventDefault();

    if (!rightForm?.image) {
      setRightMessage(
        'Please upload a banner image.'
      );
      return;
    }

    setSavingRight(true);
    setRightMessage('');

    try {
      const response = await fetch(
        '/api/admin/home-right-banner',
        {
          method: rightForm.id
            ? 'PATCH'
            : 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            id: rightForm.id,
            image: rightForm.image,
            link:
              rightForm.link?.trim() ||
              null,
            isActive:
              Boolean(
                rightForm.isActive
              ),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to save promotional banner.'
        );
      }

      setRightBanner(data);
      setRightForm(null);
      setRightMessage(
        'Promotional banner saved.'
      );
    } catch (error) {
      setRightMessage(
        error.message ||
          'Unable to save promotional banner.'
      );
    } finally {
      setSavingRight(false);
    }
  }

  async function deleteRightBanner() {
    if (
      !confirm(
        'Delete the right promotional banner?'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        '/api/admin/home-right-banner',
        {
          method: 'DELETE',
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Unable to delete promotional banner.'
        );
      }

      setRightBanner(null);
      setRightMessage(
        'Promotional banner deleted.'
      );
    } catch (error) {
      setRightMessage(
        error.message ||
          'Unable to delete promotional banner.'
      );
    }
  }

  return (
    <div className="admin-banner-manager">
      <div className="admin-page-heading">
        <div>
          <div className="eyebrow">
            Homepage
          </div>

          <h1>Hero Slider</h1>

          <p className="muted">
            Manage homepage banner images.
            Banner artwork contains its own
            text and design.
          </p>
        </div>

        <button
          type="button"
          className="btn"
          onClick={openAddBanner}
        >
          + Add Banner
        </button>
      </div>

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}

      {form && (
        <form
          className="admin-form"
          onSubmit={saveBanner}
        >
          <div className="admin-form-head">
            <h2>
              {form.id
                ? 'Edit Banner'
                : 'Add Banner'}
            </h2>

            <button
              type="button"
              onClick={() =>
                setForm(null)
              }
            >
              Cancel
            </button>
          </div>

          <div className="admin-form-grid">
            <section>
              <MediaUploader
                label="Banner Image"
                images={
                  form.image
                    ? [
                        {
                          url: form.image,
                          alt: 'Homepage banner',
                          isPrimary: true,
                        },
                      ]
                    : []
                }
                onChange={(images) =>
                  setForm((current) => ({
                    ...current,
                    image:
                      images[0]?.url || '',
                  }))
                }
                multiple={false}
              />

              {form.image && (
                <div className="admin-banner-form-preview">
                  <BannerPreview
                    src={form.image}
                  />
                </div>
              )}
            </section>

            <section>
              <label>
                Page Link
                <input
                  type="text"
                  placeholder="/shop"
                  value={
                    form.link || ''
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      link:
                        event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Sort Order
                <input
                  type="number"
                  min="0"
                  value={
                    form.sortOrder
                  }
                  onChange={(event) =>
                    setForm({
                      ...form,
                      sortOrder:
                        event.target.value,
                    })
                  }
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={Boolean(
                    form.active
                  )}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      active:
                        event.target.checked,
                    })
                  }
                />

                Active
              </label>
            </section>
          </div>

          <button
            className="btn"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : 'Save Banner'}
          </button>
        </form>
      )}

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Link</th>
              <th>Order</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id}>
                <td>
                  <BannerPreview
                    src={
                      banner.image ||
                      banner.desktopImage
                    }
                    alt="Hero banner"
                  />
                </td>

                <td>
                  {banner.link || '—'}
                </td>

                <td>
                  {banner.sortOrder}
                </td>

                <td>
                  <span
                    className={
                      banner.active
                        ? 'status active'
                        : 'status'
                    }
                  >
                    {banner.active
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </td>

                <td>
                  <div className="admin-action-menu">
                    <button
                      type="button"
                      aria-label="Banner actions"
                      onClick={() =>
                        setActionId(
                          actionId ===
                            banner.id
                            ? null
                            : banner.id
                        )
                      }
                    >
                      ⋮
                    </button>

                    {actionId ===
                      banner.id && (
                      <div className="admin-action-popover">
                        <button
                          type="button"
                          onClick={() =>
                            openEditBanner(
                              banner
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            toggleBanner(
                              banner
                            )
                          }
                        >
                          {banner.active
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteBanner(
                              banner.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!banners.length && (
          <p className="muted admin-empty">
            No hero banners found.
          </p>
        )}
      </div>

      <section className="admin-right-banner-section">
        <div className="admin-page-heading">
          <div>
            <div className="eyebrow">
              Homepage
            </div>

            <h2>
              Right Promotional Banner
            </h2>

            <p className="muted">
              This banner is independent
              from the hero slider.
            </p>
          </div>

          <button
            type="button"
            className="btn"
            onClick={openRightForm}
          >
            {rightBanner
              ? 'Replace Banner'
              : '+ Add Banner'}
          </button>
        </div>

        {rightMessage && (
          <p className="admin-message">
            {rightMessage}
          </p>
        )}

        {rightBanner?.image && (
          <div className="admin-right-banner-card">
            <BannerPreview
              src={rightBanner.image}
              alt="Right promotional banner"
            />

            <div className="admin-right-banner-info">
              <div>
                <strong>
                  {rightBanner.isActive
                    ? 'Active'
                    : 'Inactive'}
                </strong>

                <span>
                  {rightBanner.link ||
                    'No link'}
                </span>
              </div>

              <div className="admin-right-banner-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={
                    openRightForm
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={
                    deleteRightBanner
                  }
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {rightForm && (
          <form
            className="admin-form"
            onSubmit={saveRightBanner}
          >
            <div className="admin-form-head">
              <h3>
                {rightForm.id
                  ? 'Edit Promotional Banner'
                  : 'Add Promotional Banner'}
              </h3>

              <button
                type="button"
                onClick={() =>
                  setRightForm(null)
                }
              >
                Cancel
              </button>
            </div>

            <div className="admin-form-grid">
              <section>
                <MediaUploader
                  label="Banner Image"
                  images={
                    rightForm.image
                      ? [
                          {
                            url: rightForm.image,
                            alt: 'Right promotional banner',
                            isPrimary: true,
                          },
                        ]
                      : []
                  }
                  onChange={(images) =>
                    setRightForm(
                      (current) => ({
                        ...current,
                        image:
                          images[0]?.url ||
                          '',
                      })
                    )
                  }
                  multiple={false}
                />

                {rightForm.image && (
                  <div className="admin-banner-form-preview">
                    <BannerPreview
                      src={
                        rightForm.image
                      }
                    />
                  </div>
                )}
              </section>

              <section>
                <label>
                  Page Link
                  <input
                    type="text"
                    placeholder="/shop"
                    value={
                      rightForm.link ||
                      ''
                    }
                    onChange={(event) =>
                      setRightForm({
                        ...rightForm,
                        link:
                          event.target
                            .value,
                      })
                    }
                  />
                </label>

                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={Boolean(
                      rightForm.isActive
                    )}
                    onChange={(event) =>
                      setRightForm({
                        ...rightForm,
                        isActive:
                          event.target
                            .checked,
                      })
                    }
                  />

                  Active
                </label>
              </section>
            </div>

            <button
              className="btn"
              disabled={savingRight}
            >
              {savingRight
                ? 'Saving...'
                : 'Save Banner'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}