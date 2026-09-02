import { requireAdmin, jsonError } from '@/lib/admin';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request) {
  try {
    await requireAdmin();
    const file = (await request.formData()).get('file');
    if (!file || !supportedTypes.has(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Upload a JPG, PNG, or WebP image under 5MB.');
    const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${crypto.randomUUID()}.${extension}`;
    const directory = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));
    return Response.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
