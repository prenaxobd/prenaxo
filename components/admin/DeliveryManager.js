'use client';
import { useState } from 'react';
import { bn } from '@/lib/i18n';

export default function DeliveryManager({ initialZones }) {
  const [zones, setZones] = useState(initialZones);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState('');
  async function save(zone) {
    setSaving(zone.id); setMessage('');
    const response = await fetch('/api/admin/delivery', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(zone) });
    const result = await response.json(); setSaving('');
    if (!response.ok) { setMessage(result.error || 'ডেলিভারি চার্জ সংরক্ষণ করা যায়নি।'); return; }
    setZones(current => current.map(item => item.id === result.id ? result : item)); setMessage('ডেলিভারি চার্জ সংরক্ষণ হয়েছে।');
  }
  function update(id, key, value) { setZones(current => current.map(zone => zone.id === id ? { ...zone, [key]: key === 'charge' ? Number(value) : value } : zone)); }
  return <div className="delivery-manager"><p className="muted">সব ৬৪ জেলার ডেলিভারি চার্জ এখান থেকে পরিবর্তন করুন।</p>{message && <p role="status">{message}</p>}<div className="table-wrap"><table className="table"><thead><tr><th>বিভাগ</th><th>জেলা</th><th>চার্জ</th><th>আনুমানিক সময়</th><th>সক্রিয়</th><th></th></tr></thead><tbody>{zones.map(zone => <tr key={zone.id}><td>{zone.division}</td><td>{zone.district}</td><td><input type="number" min="0" value={zone.charge} onChange={event => update(zone.id, 'charge', event.target.value)} style={{ width: 90 }} /> টাকা</td><td><input value={zone.estimatedDelivery} onChange={event => update(zone.id, 'estimatedDelivery', event.target.value)} style={{ width: 120 }} /></td><td><input type="checkbox" checked={zone.active} onChange={event => update(zone.id, 'active', event.target.checked)} /></td><td><button className="btn" disabled={saving === zone.id} onClick={() => save(zone)}>{saving === zone.id ? 'সংরক্ষণ...' : 'সংরক্ষণ'}</button></td></tr>)}</tbody></table></div></div>;
}
