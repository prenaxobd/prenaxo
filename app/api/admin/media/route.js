import { readdir, stat, unlink } from 'node:fs/promises';
import path from 'node:path';
import { requirePermission, jsonError } from '@/lib/admin';
import { deleteImage, listImages, publicIdFromCloudinaryUrl } from '@/lib/cloudinary';

const directory = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    await requirePermission('media.view');
    const names = await readdir(directory).catch(() => []);
    const localAssets = await Promise.all(names.filter(name => /\.(jpg|jpeg|png|webp)$/i.test(name)).map(async name => { const info = await stat(path.join(directory, name)); return { name, url: `/uploads/${name}`, size: info.size, updatedAt: info.mtime.toISOString(), storage: 'local' }; }));
    const cloudAssets = (await listImages()).map(asset => ({ name: asset.public_id, url: asset.secure_url, size: asset.bytes, updatedAt: asset.created_at, storage: 'cloudinary' }));
    const assets = [...cloudAssets, ...localAssets];
    return Response.json(assets.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
  } catch (error) { return jsonError(error); }
}

export async function DELETE(request) {
  try {
    await requirePermission('media.delete');
    const name = new URL(request.url).searchParams.get('name');
    if (!name || name.includes('..')) throw new Error('Invalid media file.');
    const publicId = publicIdFromCloudinaryUrl(name) || (name.startsWith('prenaxo/') ? name : null);
    if (publicId) {
      await deleteImage(publicId);
    } else {
      if (path.basename(name) !== name) throw new Error('Invalid media file.');
      await unlink(path.join(directory, name));
    }
    return Response.json({ ok: true });
  } catch (error) { return jsonError(error); }
}
