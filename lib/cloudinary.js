import { v2 as cloudinary } from 'cloudinary';

function getCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary is not configured.');
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

export async function uploadImage(file, folder, publicId) {
  const client = getCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());
  return new Promise((resolve, reject) => {
    const stream = client.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'image', overwrite: false, invalidate: true },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteImage(publicId) {
  if (!publicId) return null;
  return getCloudinary().uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}

export async function listImages(folder = 'prenaxo') {
  const result = await getCloudinary().api.resources({
    type: 'upload',
    prefix: `${folder}/`,
    resource_type: 'image',
    max_results: 500,
  });
  return result.resources || [];
}

export function publicIdFromCloudinaryUrl(value) {
  if (typeof value !== 'string' || !value.includes('res.cloudinary.com/')) return null;
  const marker = '/image/upload/';
  const markerIndex = value.indexOf(marker);
  if (markerIndex === -1) return null;
  const path = value.slice(markerIndex + marker.length).split('?')[0];
  const parts = path.split('/').filter(Boolean);
  while (parts[0] && (/^v\d+$/.test(parts[0]) || parts[0].includes(':') || parts[0].includes(','))) parts.shift();
  const publicId = parts.join('/');
  return publicId.replace(/\.[a-z0-9]+$/i, '') || null;
}