import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import MediaLibrary from '@/components/admin/MediaLibrary';

export default async function MediaLibraryPage() {
  const directory = path.join(process.cwd(), 'public', 'uploads');
  const names = await readdir(directory).catch(() => []);
  const assets = await Promise.all(names.filter(name => /\.(jpg|jpeg|png|webp)$/i.test(name)).map(async name => { const info = await stat(path.join(directory, name)); return { name, url: `/uploads/${name}`, size: info.size, updatedAt: info.mtime.toISOString() }; }));
  return <MediaLibrary initialAssets={assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))} />;
}
