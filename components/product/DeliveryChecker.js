'use client';

import { ChevronDown, MapPin, Search, Truck } from 'lucide-react';
import { useEffect, useId, useState } from 'react';

export default function DeliveryChecker() {
  const [area, setArea] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [zones, setZones] = useState([]);
  const [threshold, setThreshold] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const titleId = useId();
  const panelId = useId();

  useEffect(() => {
    fetch('/api/delivery')
      .then((response) => response.json())
      .then((data) => {
        setZones(Array.isArray(data.zones) ? data.zones : []);
        setThreshold(Number(data.threshold || 2000));
      })
      .catch(() => setZones([]))
      .finally(() => setLoading(false));
  }, []);

  function checkDelivery(event) {
    event.preventDefault();
    const query = area.trim().toLowerCase();
    if (!query) return;

    const match = zones.find((zone) => [zone.name, zone.district, zone.division]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query)));

    setDelivery(match || { estimatedDelivery: 'Delivery availability will be confirmed after checkout.' });
  }

  return (
    <section className={`delivery-checker ${expanded ? 'is-expanded' : ''}`} aria-labelledby={titleId}>
      <button
        type="button"
        className="delivery-checker-toggle"
        id={titleId}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((current) => !current)}
      >
        <span className="delivery-checker-icon"><MapPin size={18} /></span>
        <span className="delivery-checker-toggle-copy">
          <strong>Check delivery location</strong>
          <small>{expanded ? 'Enter your area to see available delivery information.' : 'Check availability and delivery charge for your area.'}</small>
        </span>
        <ChevronDown className="delivery-checker-chevron" size={18} aria-hidden="true" />
      </button>
      <div className="delivery-checker-panel" id={panelId} aria-hidden={!expanded}>
        <div className="delivery-checker-panel-inner">
          <form className="delivery-checker-form" onSubmit={checkDelivery}>
            <input
              value={area}
              onChange={(event) => setArea(event.target.value)}
              placeholder="Enter area or district"
              aria-label="Delivery area or district"
              tabIndex={expanded ? 0 : -1}
            />
            <button type="submit" disabled={loading || !area.trim()} tabIndex={expanded ? 0 : -1}>
              <Search size={16} />
              Check
            </button>
          </form>
          {delivery && (
            <div className="delivery-checker-result" role="status">
              <Truck size={17} />
              <span>
                {delivery.district || delivery.name ? `${delivery.district || delivery.name}: ` : ''}
                {delivery.estimatedDelivery || 'Delivery information available'}
                {delivery.charge != null ? ` · Delivery charge ৳${Number(delivery.charge).toLocaleString()}` : ''}
              </span>
            </div>
          )}
          <small className="delivery-checker-note">Free delivery may apply above ৳{threshold.toLocaleString()}.</small>
        </div>
      </div>
    </section>
  );
}
