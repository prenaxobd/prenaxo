import { prisma } from '../lib/prisma.js';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

if (!cloudName) throw new Error('CLOUDINARY_CLOUD_NAME is required.');

function cloudinaryUrl(value) {
  if (typeof value !== 'string' || !value.startsWith('/uploads/')) return value;
  const relativePath = decodeURIComponent(value.slice('/uploads/'.length));
  const parts = relativePath.split('/').filter(Boolean);
  const folder = parts[0] === 'users' ? 'prenaxo/user' : 'prenaxo';
  const filename = parts[0] === 'users' ? parts.slice(1).join('/') : parts.join('/');
  const extensionIndex = filename.lastIndexOf('.');
  const publicId = extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename;
  const extension = extensionIndex > 0 ? filename.slice(extensionIndex + 1) : '';
  const encodedPublicId = publicId.split('/').map(encodeURIComponent).join('/');
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${folder}/${encodedPublicId}${extension ? `.${extension}` : ''}`;
}

async function updateFields(model, fields) {
  const records = await prisma[model].findMany({ select: { id: true, ...Object.fromEntries(fields.map(field => [field, true])) } });
  let count = 0;
  for (const record of records) {
    const data = {};
    for (const field of fields) {
      const nextValue = cloudinaryUrl(record[field]);
      if (nextValue !== record[field]) data[field] = nextValue;
    }
    if (Object.keys(data).length) {
      await prisma[model].update({ where: { id: record.id }, data });
      count += Object.keys(data).length;
    }
  }
  return count;
}

const targets = [
  ['user', ['image']],
  ['category', ['image']],
  ['brand', ['logo', 'image']],
  ['productImage', ['url']],
  ['banner', ['image', 'desktopImage', 'mobileImage']],
  ['homeRightBanner', ['image']],
  ['siteSettings', ['logo', 'ogImage']],
  ['productSEO', ['ogImage', 'twitterImage']],
  ['categorySEO', ['ogImage']],
  ['brandSEO', ['ogImage']],
  ['page', ['featuredImage']],
  ['pageSEO', ['ogImage', 'twitterImage']],
];

let updated = 0;
for (const [model, fields] of targets) updated += await updateFields(model, fields);
console.log(`Updated ${updated} image URL fields to Cloudinary.`);
await prisma.$disconnect();