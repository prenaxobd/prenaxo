'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Star, Trash2 } from 'lucide-react';

export default function MediaUploader({ images = [], onChange, label = 'Images', multiple = true }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  async function upload(files) {
    const selected = Array.from(files || []); if (!selected.length) return;
    setUploading(true); setError('');
    try {
      const uploaded = [];
      for (const file of selected) {
        const body = new FormData(); body.append('file', file);
        const response = await fetch('/api/admin/upload', { method: 'POST', body });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Upload failed.');
        uploaded.push({ url: data.url, alt: '', isPrimary: images.length + uploaded.length === 0 });
      }
      onChange(multiple ? [...images, ...uploaded] : uploaded.slice(0, 1));
    } catch (err) { setError(err.message); } finally { setUploading(false); }
  }
  function primary(index) { onChange(images.map((image, i) => ({ ...image, isPrimary: i === index }))); }
  function remove(index) { const next = images.filter((_, i) => i !== index); if (next.length && !next.some(image => image.isPrimary)) next[0].isPrimary = true; onChange(next); }
  return <section className="media-uploader"><div className="media-label"><strong>{label}</strong><span>JPG, PNG or WebP · max 5 MB</span></div><button className="media-dropzone" type="button" onClick={() => input.current?.click()} disabled={uploading}><ImagePlus size={26}/><span>{uploading ? 'Uploading…' : 'Upload image'}</span></button><input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple} onChange={event => upload(event.target.files)} />{error && <p className="media-error">{error}</p>}<div className="media-previews">{images.map((image, index) => <figure key={`${image.url}-${index}`}><img src={image.url} alt={image.alt || ''}/><figcaption><button type="button" className={image.isPrimary ? 'is-primary' : ''} onClick={() => primary(index)} title="Set as main image"><Star size={14} fill={image.isPrimary ? 'currentColor' : 'none'}/></button><button type="button" onClick={() => remove(index)} title="Remove image"><Trash2 size={14}/></button></figcaption></figure>)}</div></section>;
}
