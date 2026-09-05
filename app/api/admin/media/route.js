import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin, jsonError } from '@/lib/admin';

const directory = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    await requireAdmin();
    const names = await readdir(directory).catch(() => []);
    const assets = await Promise.all(names.filter(name => /\.(jpg|jpeg|png|webp)$/i.test(name)).map(async name => { const info = await stat(path.join(directory, name)); return { name, url: `/uploads/${name}`, size: info.size, updatedAt: info.mtime.toISOString() }; }));
    return Response.json(assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  } catch (error) { return jsonError(error); }
}

export async function DELETE(request) {
  try {
    await requireAdmin();
    const name = new URL(request.url).searchParams.get('name');
    if (!name || name.includes('..') || path.basename(name) !== name) throw new Error('Invalid media file.');
    await unlink(path.join(directory, name));
    return Response.json({ ok: true });
  } catch (error) { return jsonError(error); }
}
