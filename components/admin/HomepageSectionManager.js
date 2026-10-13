'use client';

import { useEffect, useState } from 'react';

const types = [
  ['FEATURED', 'Featured products'],
  ['TOP_SELLING', 'Top selling products'],
  ['DEALS', "Today's deals"],
  ['NEW_ARRIVALS', 'New arrivals'],
  ['CATEGORY', 'Category products'],
];

const empty = {
  type: 'FEATURED',
  title: '',
  subtitle: '',
  eyebrow: '',
  href: '/shop',
  categoryId: '',
  productLimit: 8,
  useManualProducts: false,
  selectedProducts: [],
  active: true,
  sortOrder: 0,
};

function selectedProductsFor(section) {
  return (section.products || [])
    .map((item) => item.product)
    .filter(Boolean);
}

export default function HomepageSectionManager({ initialSections = [], categories = [] }) {
  const [sections, setSections] = useState(initialSections);
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [productResults, setProductResults] = useState({ categoryId: '', search: '', items: [] });
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productSearchError, setProductSearchError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pendingSectionId, setPendingSectionId] = useState(null);
  const categoryId = form?.categoryId;
  const productSearch = form?.productSearch?.trim() || '';
  const shouldLoadProducts =
    form?.type === 'CATEGORY' &&
    Boolean(categoryId) &&
    Boolean(form?.useManualProducts);

  useEffect(() => {
    if (!shouldLoadProducts) return undefined;

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoadingProducts(true);
      setProductSearchError('');

      try {
        const params = new URLSearchParams({ categoryId, search: productSearch });
        const response = await fetch(`/api/admin/homepage-sections?${params}`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Unable to load products for this category.');
        }

        setProductResults({ categoryId, search: productSearch, items: data });
      } catch (error) {
        if (error.name !== 'AbortError') {
          setProductSearchError(error.message || 'Unable to load products for this category.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProducts(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [categoryId, productSearch, shouldLoadProducts]);

  function edit(section) {
    setForm(section
      ? {
          ...section,
          categoryId: section.categoryId || '',
          selectedProducts: selectedProductsFor(section),
          productSearch: '',
        }
      : { ...empty, sortOrder: sections.length, productSearch: '' });
    setProductSearchError('');
    setMessage('');
  }

  async function save(event) {
    event.preventDefault();
    if (form.useManualProducts && !form.selectedProducts.length) {
      setMessage('Choose at least one category product, or switch back to automatic products.');
      return;
    }

    setIsSaving(true);
    setMessage('');
    try {
      const response = await fetch('/api/admin/homepage-sections', {
        method: form.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          categoryId: form.type === 'CATEGORY' ? form.categoryId || null : null,
          useManualProducts: form.type === 'CATEGORY' && Boolean(form.useManualProducts),
          productIds: form.type === 'CATEGORY' && form.useManualProducts
            ? form.selectedProducts.map((product) => product.id)
            : [],
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save section.');
      }

      setSections((current) => (
        form.id
          ? current.map((item) => item.id === data.id ? data : item).sort((a, b) => a.sortOrder - b.sortOrder)
          : [...current, data].sort((a, b) => a.sortOrder - b.sortOrder)
      ));
      setForm(null);
      setMessage('Homepage section saved.');
    } catch (error) {
      setMessage(error.message || 'Unable to save section.');
    } finally {
      setIsSaving(false);
    }
  }

  async function archive(id) {
    setPendingSectionId(id);
    setMessage('');
    try {
      const response = await fetch(`/api/admin/homepage-sections?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to hide section.');
      }

      setSections((current) => current.map((item) => item.id === id ? { ...item, ...data } : item));
    } catch (error) {
      setMessage(error.message || 'Unable to hide section.');
    } finally {
      setPendingSectionId(null);
    }
  }

  function toggleProduct(product) {
    const selected = form?.selectedProducts || [];
    const isSelected = selected.some((item) => item.id === product.id);

    if (isSelected) {
      setForm({
        ...form,
        selectedProducts: selected.filter((item) => item.id !== product.id),
      });
      setMessage('');
      return;
    }

    if (selected.length >= 24) {
      setMessage('A category section can include up to 24 manually selected products.');
      return;
    }

    setMessage('');
    setForm({ ...form, selectedProducts: [...selected, product] });
  }

  function moveSelectedProduct(index, direction) {
    const selected = [...form.selectedProducts];
    const target = index + direction;
    if (target < 0 || target >= selected.length) return;
    [selected[index], selected[target]] = [selected[target], selected[index]];
    setForm({ ...form, selectedProducts: selected });
  }

  const currentProductResults =
    productResults.categoryId === form?.categoryId &&
    productResults.search === (form?.productSearch?.trim() || '')
      ? productResults.items
      : [];
  const selectedProductIds = new Set((form?.selectedProducts || []).map((product) => product.id));

  return (
    <>
      <div className="section-head">
        <div>
          <div className="eyebrow">Homepage</div>
          <h1>Section builder</h1>
        </div>
        <button className="btn" type="button" disabled={isSaving} onClick={() => edit()}>
          + Add section
        </button>
      </div>
      <p className="muted">
        Control which product sections appear on the homepage, their display order, and the products in each category section.
      </p>
      {message && <p className="admin-message" role="status">{message}</p>}

      {form && (
        <form className="admin-form homepage-section-form" onSubmit={save}>
          <div className="admin-form-head">
            <h2>{form.id ? 'Edit section' : 'Add section'}</h2>
            <button type="button" disabled={isSaving} onClick={() => setForm(null)}>Cancel</button>
          </div>

          <div className="admin-form-grid">
            <section>
              <label>
                Section type
                <select
                  value={form.type}
                  onChange={(event) => {
                    const type = event.target.value;
                    setForm({
                      ...form,
                      type,
                      useManualProducts: false,
                      selectedProducts: [],
                    });
                  }}
                >
                  {types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label>
                Title
                <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </label>
              <label>
                Eyebrow
                <input value={form.eyebrow || ''} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} />
              </label>
              <label>
                Subtitle
                <input value={form.subtitle || ''} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} />
              </label>
            </section>

            <section>
              {form.type === 'CATEGORY' && (
                <label>
                  Category
                  <select
                    required
                    value={form.categoryId}
                    onChange={(event) => setForm({
                      ...form,
                      categoryId: event.target.value,
                      selectedProducts: [],
                      productSearch: '',
                    })}
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
              )}
              <label>
                Product limit
                <input type="number" min="1" max="24" value={form.productLimit} onChange={(event) => setForm({ ...form, productLimit: event.target.value })} />
              </label>
              <label>
                Display order
                <input type="number" value={form.sortOrder} onChange={(event) => setForm({ ...form, sortOrder: event.target.value })} />
              </label>
              <label>
                View-all URL
                <input value={form.href || ''} onChange={(event) => setForm({ ...form, href: event.target.value })} />
              </label>
              <label className="check-label">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                Visible on homepage
              </label>
            </section>
          </div>

          {form.type === 'CATEGORY' && (
            <section className="homepage-manual-selection">
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={Boolean(form.useManualProducts)}
                  onChange={(event) => setForm({
                    ...form,
                    useManualProducts: event.target.checked,
                    selectedProducts: event.target.checked ? form.selectedProducts : [],
                  })}
                />
                Choose category products manually
              </label>
              <p className="muted">
                Turn this on to choose and order active products from this category. Otherwise, the section keeps showing the latest products automatically.
              </p>

              {form.useManualProducts && form.categoryId && (
                <div className="homepage-product-picker">
                  <label>
                    Search this category
                    <input
                      type="search"
                      value={form.productSearch || ''}
                      onChange={(event) => setForm({ ...form, productSearch: event.target.value })}
                      placeholder="Search product name or SKU"
                    />
                  </label>

                  {productSearchError && <p className="admin-message" role="alert">{productSearchError}</p>}
                  {isLoadingProducts && <p className="muted" role="status">Loading category products...</p>}
                  {!isLoadingProducts && !productSearchError && currentProductResults.length === 0 && (
                    <p className="muted">No active products found. Try another search or switch back to automatic products.</p>
                  )}

                  {currentProductResults.length > 0 && (
                    <ul className="homepage-product-results" aria-label="Products in this category">
                      {currentProductResults.map((product) => {
                        const isSelected = selectedProductIds.has(product.id);
                        return (
                          <li key={product.id}>
                            <label>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={!isSelected && form.selectedProducts.length >= 24}
                                onChange={() => toggleProduct(product)}
                              />
                              <span>
                                <strong>{product.name}</strong>
                                <small>{product.sku || 'No SKU'} · Stock {product.stock}</small>
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  <div className="homepage-selected-products">
                    <h3>Selected order ({form.selectedProducts.length})</h3>
                    {form.selectedProducts.length === 0 ? (
                      <p className="muted">Select at least one product to save this section in manual mode.</p>
                    ) : (
                      <ol>
                        {form.selectedProducts.map((product, index) => (
                          <li key={product.id}>
                            <span>
                              <strong>{index + 1}. {product.name}</strong>
                              {!product.active && <small className="homepage-inactive-product">Inactive product; it will not appear until restored.</small>}
                            </span>
                            <div>
                              <button type="button" disabled={index === 0} aria-label={`Move ${product.name} up`} onClick={() => moveSelectedProduct(index, -1)}>Move up</button>
                              <button type="button" disabled={index === form.selectedProducts.length - 1} aria-label={`Move ${product.name} down`} onClick={() => moveSelectedProduct(index, 1)}>Move down</button>
                              <button type="button" aria-label={`Remove ${product.name}`} onClick={() => toggleProduct(product)}>Remove</button>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          <button className="btn" type="submit" disabled={isSaving || (form.useManualProducts && !form.selectedProducts.length)}>
            {isSaving ? 'Saving...' : 'Save section'}
          </button>
        </form>
      )}

      <div className="homepage-section-list">
        {sections.map((section) => (
          <article className="homepage-section-row" key={section.id}>
            <span className="homepage-section-order">{section.sortOrder}</span>
            <div>
              <strong>{section.title}</strong>
              <small>
                {section.type}
                {section.category ? ` · ${section.category.name}` : ''}
                {section.type === 'CATEGORY'
                  ? ` · ${section.useManualProducts ? `${section.products?.length || 0} selected products` : 'automatic products'}`
                  : ''}
                {` · ${section.productLimit} products`}
              </small>
            </div>
            <span className={`status ${section.active ? 'active' : ''}`}>{section.active ? 'Visible' : 'Hidden'}</span>
            <button type="button" disabled={isSaving || pendingSectionId !== null} onClick={() => edit(section)}>Edit</button>
            <button type="button" disabled={pendingSectionId !== null || !section.active} onClick={() => archive(section.id)}>
              {pendingSectionId === section.id ? 'Saving...' : 'Hide'}
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
