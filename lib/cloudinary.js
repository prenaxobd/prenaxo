import crypto from 'node:crypto';

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary is not configured.');
  return { cloudName, apiKey, apiSecret };
}

export async function uploadToCloudinary(file, folder, publicId) {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = crypto.createHash('sha1')
    .update(`folder=${folder}&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex');
  const body = new FormData();
  body.append('file', new Blob([Buffer.from(await file.arrayBuffer())], { type: file.type }));
  body.append('api_key', apiKey);
  body.append('timestamp', String(timestamp));
  body.append('folder', folder);
  body.append('public_id', publicId);
  body.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body });
  const result = await response.json();
  if (!response.ok || !result.secure_url) throw new Error(result.error?.message || 'Cloudinary upload failed.');
  return result.secure_url;
}