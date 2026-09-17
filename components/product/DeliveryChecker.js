'use client';

import { MapPin, Search, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DeliveryChecker() {
  const [area, setArea] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [zones, setZones] = useState([]);
  const [threshold, setThreshold] = useState(2000);
  const [loading, setLoading] = useState(true);

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
    <section className="delivery-checker" aria-labelledby="delivery-checker-title">
      <div className="delivery-checker-heading">
        <span className="delivery-checker-icon"><MapPin size={18} /></span>
        <div>
          <h2 id="delivery-checker-title">Check delivery location</h2>
          <p>Enter your area to see available delivery information.</p>
        </div>
      </div>
      <form className="delivery-checker-form" onSubmit={checkDelivery}>
        <input
          value={area}
          onChange={(event) => setArea(event.target.value)}
          placeholder="Enter area or district"
          aria-label="Delivery area or district"
        />
        <button type="submit" disabled={loading || !area.trim()}>
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
      <small>Free delivery may apply above ৳{threshold.toLocaleString()}.</small>
    </section>
  );
}
