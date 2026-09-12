'use client';

import { useState } from 'react';
import MediaUploader from './MediaUploader';

const empty = {
  name: '',
  slug: '',
  description: '',
  logo: '',
  website: '',
  active: true,
  featured: false,
};

function BrandLogo({ src, name }) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <span
        className="admin-image-placeholder"
        aria-label={`${name} has no image`}
      >
        No image
      </span>
    );
  }

  return (
    <img
      className="admin-thumbnail"
      src={src}
      alt={name}
      onError={() => setBroken(true)}
    />
  );
}

export default function BrandManager({ initialBrands = [] }) {
  const [brands, setBrands] = useState(initialBrands);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [actionId, setActionId] = useState(null);

  const visible = brands.filter((brand) =>
    `${brand.name || ''} ${brand.slug || ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  async function save(event) {
    event.preventDefault();

    try {
      const response = await fetch('/api/admin/brands', {
        method: form.id ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...(form.id ? { id: form.id } : {}),
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          logo: form.logo || null,
          website: form.website || null,
          active: Boolean(form.active),
          featured: Boolean(form.featured),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save brand.');
      }

      setBrands((items) => {
        if (form.id) {
          return items.map((item) =>
            item.id === data.id
              ? {
                  ...data,
                  _count: item._count,
                }
              : item
          );
        }

        return [
          ...items,
          {
            ...data,
            _count: {
              products: 0,
            },
          },
        ].sort((a, b) =>
          String(a.name).localeCompare(String(b.name))
        );
      });

      setForm(null);
      setMessage('Brand saved successfully.');
    } catch (error) {
      setMessage(error.message || 'Unable to save brand.');
    }
  }

  async function archive(id, active) {
    if (
      active &&
      !confirm(
        'Archive this brand? Existing products will remain unchanged.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/brands?id=${encodeURIComponent(id)}`,
        {
          method: active ? 'DELETE' : 'PATCH',
          headers: active
            ? undefined
            : {
                'Content-Type': 'application/json',
              },
          body: active
            ? undefined
            : JSON.stringify({
                id,
                active: true,
              }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to update brand.');
      }

      const data = await response.json();

      setBrands((items) =>
        items.map((item) =>
          item.id === id
            ? {
                ...item,
                ...data,
              }
            : item
        )
      );
    } catch (error) {
      setMessage(error.message || 'Unable to update brand.');
    }
  }

  return (
    <>
      <div className="admin-page-heading">
        <div>
          <div className="eyebrow">Catalogue</div>

          <h1>Brands</h1>

          <p className="muted">
            Manage the brands connected to your product catalogue.
          </p>
        </div>

        <button
          className="btn"
          type="button"
          onClick={() => {
            setForm({ ...empty });
            setMessage('');
          }}
        >
          + Add brand
        </button>
      </div>

      {message && (
        <p className="admin-message">
          {message}
        </p>
      )}

      {form && (
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form-head">
            <h2>{form.id ? 'Edit brand' : 'Add brand'}</h2>

            <button
              type="button"
              onClick={() => setForm(null)}
            >
              Cancel
            </button>
          </div>

          <div className="admin-form-grid">
            <section>
              <label>
                Brand name

                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Slug

                <input
                  required
                  value={form.slug}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      slug: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Description

                <textarea
                  value={form.description || ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value,
                    })
                  }
                />
              </label>
            </section>

            <section>
              <MediaUploader
                label="Brand image"
                images={
                  form.logo
                    ? [
                        {
                          url: form.logo,
                          alt: form.name,
                          isPrimary: true,
                        },
                      ]
                    : []
                }
                onChange={(images) =>
                  setForm({
                    ...form,
                    logo: images[0]?.url || '',
                  })
                }
                multiple={false}
              />

              <label>
                Logo URL

                <input
                  value={form.logo || ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      logo: event.target.value,
                    })
                  }
                  placeholder="/uploads/brand-image.webp"
                />
              </label>

              <label>
                Website

                <input
                  type="url"
                  value={form.website || ''}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      website: event.target.value,
                    })
                  }
                />
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={Boolean(form.featured)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      featured: event.target.checked,
                    })
                  }
                />

                Featured
              </label>

              <label className="check-label">
                <input
                  type="checkbox"
                  checked={Boolean(form.active)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      active: event.target.checked,
                    })
                  }
                />

                Active
              </label>
            </section>
          </div>

          <button className="btn" type="submit">
            Save brand
          </button>
        </form>
      )}

      <div className="admin-toolbar">
        <input
          placeholder="Search brands"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <select aria-label="Filter brands by status">
          <option>All statuses</option>
          <option>Active</option>
          <option>Archived</option>
        </select>

        <span>{visible.length} brands</span>
      </div>

      <div className="admin-table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Brand</th>
              <th>Logo</th>
              <th>Slug</th>
              <th>Products</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {visible.map((brand) => (
              <tr key={brand.id}>
                <td>
                  <strong title={brand.name}>
                    {brand.name}
                  </strong>

                  {brand.featured && (
                    <small className="featured-mark">
                      Featured
                    </small>
                  )}
                </td>

                <td>
                  <BrandLogo
                    src={brand.logo}
                    name={brand.name}
                  />
                </td>

                <td>{brand.slug}</td>

                <td>
                  <span className="stock">
                    {brand._count?.products || 0}
                  </span>
                </td>

                <td>
                  <span
                    className={
                      brand.active
                        ? 'status active'
                        : 'status'
                    }
                  >
                    {brand.active ? 'Active' : 'Archived'}
                  </span>
                </td>

                <td>
                  <span className="admin-date">
                    {brand.updatedAt
                      ? new Date(
                          brand.updatedAt
                        ).toLocaleDateString('en-GB')
                      : '—'}
                  </span>
                </td>

                <td>
                  <div className="admin-action-menu">
                    <button
                      type="button"
                      aria-label={`Actions for ${brand.name}`}
                      onClick={() =>
                        setActionId(
                          actionId === brand.id
                            ? null
                            : brand.id
                        )
                      }
                    >
                      ⋮
                    </button>

                    {actionId === brand.id && (
                      <div className="admin-action-popover">
                        <button
                          type="button"
                          onClick={() => {
                            setActionId(null);
                            setForm({ ...brand });
                          }}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setActionId(null);
                            archive(
                              brand.id,
                              brand.active
                            );
                          }}
                        >
                          {brand.active
                            ? 'Archive'
                            : 'Restore'}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!visible.length && (
          <p className="muted">
            No brands found.
          </p>
        )}
      </div>
    </>
  );
}

