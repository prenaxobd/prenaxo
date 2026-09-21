'use client';
import OptimizedImage from '@/components/OptimizedImage';

import { useState } from 'react';

export default function MediaLibrary({ initialAssets }) {
  const [assets, setAssets] = useState(initialAssets);
  const [query, setQuery] = useState('');
  const visible = assets.filter(asset => asset.name.toLowerCase().includes(query.toLowerCase()));
  async function remove(name) { if (!confirm('Delete this uploaded file? Check that no product or banner uses it first.')) return; const response = await fetch(`/api/admin/media?name=${encodeURIComponent(name)}`, { method: 'DELETE' }); if (response.ok) setAssets(items => items.filter(item => item.name !== name)); }
  return <><div className="admin-page-heading"><div><div className="eyebrow">Content</div><h1>Media library</h1><p className="muted">Uploaded storefront images from the existing file library.</p></div></div><div className="admin-toolbar"><input placeholder="Search files" value={query} onChange={event => setQuery(event.target.value)} /><span>{visible.length} files</span></div><div className="media-library-grid">{visible.map(asset => <article className="media-library-item" key={asset.name}><OptimizedImage src={asset.url} alt={asset.name} onError={event => { event.currentTarget.style.display = 'none'; }} /><div><strong title={asset.name}>{asset.name}</strong><small>{Math.ceil(asset.size / 1024)} KB · {new Date(asset.updatedAt).toLocaleDateString()}</small><button onClick={() => remove(asset.name)}>Delete</button></div></article>)}{!visible.length && <p className="muted">No media files found.</p>}</div></>;
}
