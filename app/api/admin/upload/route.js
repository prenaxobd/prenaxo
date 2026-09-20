import { requirePermission, jsonError } from '@/lib/admin';
import crypto from 'node:crypto';
import { uploadToCloudinary } from '@/lib/cloudinary';

const supportedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(request) {
  try {
    await requirePermission('media.upload');
    const file = (await request.formData()).get('file');
    if (!file || !supportedTypes.has(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Upload a JPG, PNG, or WebP image under 5MB.');
    const publicId = crypto.randomUUID();
    const url = await uploadToCloudinary(file, 'prenaxo', publicId);
    return Response.json({ url }, { status: 201 });
  } catch (error) { return jsonError(error); }
}
