import { requirePermission, jsonError } from '@/lib/admin';
import crypto from 'node:crypto';
import { uploadImage } from '@/lib/cloudinary';

const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
export const runtime = 'nodejs';

export async function POST(request) {
  try {
    await requirePermission('media.upload');
    const file = (await request.formData()).get('file');
    if (!file || !supportedTypes.has(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Upload a JPG, PNG, or WebP image under 5MB.');
    const uploaded = await uploadImage(file, 'prenaxo', crypto.randomUUID());
    return Response.json(uploaded, { status: 201 });
  } catch (error) { return jsonError(error); }
}
