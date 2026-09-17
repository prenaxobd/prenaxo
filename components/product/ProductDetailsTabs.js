'use client';

import { Check, ChevronDown, ShieldCheck, Truck } from 'lucide-react';
import { useState } from 'react';

const tabs = [
  ['description', 'Description'],
  ['specifications', 'Specifications'],
  ['size', 'Size Guide'],
  ['shipping', 'Shipping'],
  ['returns', 'Return Policy'],
];

function getAttributeValues(product, name) {
  return (product.attributeValues || [])
    .filter((item) => item.attributeValue?.attribute?.name?.toLowerCase() === name)
    .map((item) => item.attributeValue.name);
}

export default function ProductDetailsTabs({ product, sku, inStock }) {
  const [activeTab, setActiveTab] = useState('description');
  const sizes = getAttributeValues(product, 'size');
  const colors = getAttributeValues(product, 'color');

  return (
    <section className="product-details-card" aria-label="Product details">
      <div className="product-details-tabs" role="tablist" aria-label="Product information">
        {tabs.map(([id, label]) => (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            className={activeTab === id ? 'active' : ''}
            key={id}
            onClick={() => setActiveTab(id)}
          >
            {label}
            <ChevronDown size={15} aria-hidden="true" />
          </button>
        ))}
      </div>

      <div className="product-details-content">
        {activeTab === 'description' && (
          <div className="details-two-column">
            <div className="product-description-block">
              <span className="details-eyebrow">Product information</span>
              <h2>About this product</h2>
              {product.description ? (
                <div className="full-product-description" dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="muted">Product description is not available yet.</p>
              )}
            </div>
            <div className="product-highlights">
              <span className="details-eyebrow">Why you will love it</span>
              <h2>Product highlights</h2>
              {[
                [ShieldCheck, 'Quality checked', 'Carefully prepared for your order.'],
                [Check, 'Original product', 'Authenticity is part of every Prenaxo order.'],
                [Truck, 'Reliable delivery', 'Packed with care for doorstep delivery.'],
              ].map(([Icon, title, text]) => (
                <div className="product-highlight" key={title}>
                  <Icon size={18} />
                  <span><strong>{title}</strong><small>{text}</small></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'specifications' && (
          <div className="product-description-block">
            <span className="details-eyebrow">Product details</span>
            <h2>Specifications</h2>
            <div className="spec-grid">
              {(product.brandRelation?.name || product.brand) && <div><span>Brand</span><strong>{product.brandRelation?.name || product.brand}</strong></div>}
              {product.category?.name && <div><span>Category</span><strong>{product.category.name}</strong></div>}
              <div><span>SKU</span><strong>{sku}</strong></div>
              <div><span>Availability</span><strong className={inStock ? 'spec-in-stock' : 'spec-out-stock'}>{inStock ? 'In stock' : 'Out of stock'}</strong></div>
              {colors.length > 0 && <div><span>Colors</span><strong>{colors.join(', ')}</strong></div>}
              {sizes.length > 0 && <div><span>Sizes</span><strong>{sizes.join(', ')}</strong></div>}
            </div>
          </div>
        )}

        {activeTab === 'size' && (
          <div className="product-description-block">
            <span className="details-eyebrow">Available options</span>
            <h2>Size Guide</h2>
            {sizes.length > 0 ? <p className="details-lead">Available sizes: <strong>{sizes.join(', ')}</strong></p> : <p className="muted">Size information is not available for this product.</p>}
          </div>
        )}

        {activeTab === 'shipping' && (
          <div className="product-description-block">
            <span className="details-eyebrow">Customer care</span>
            <h2>Shipping</h2>
            <p className="details-lead">Your order is carefully packed and delivered safely to your doorstep. Delivery availability and estimated timing are shown by location in the delivery checker above.</p>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="product-description-block">
            <span className="details-eyebrow">Customer care</span>
            <h2>Return Policy</h2>
            <p className="details-lead">Prenaxo supports easy returns according to the store return policy. Contact customer support if your order arrives damaged or differs from the product details.</p>
          </div>
        )}
      </div>
    </section>
  );
}
