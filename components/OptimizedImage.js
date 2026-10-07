'use client';

import Image from 'next/image';

function imageLoader({ src, width, quality }) {
  if (src.startsWith('/uploads/')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=75`;
  }

  if (!src.includes('res.cloudinary.com/') || !src.includes('/image/upload/')) {
    return src;
  }

  const marker = '/image/upload/';
  const markerIndex = src.indexOf(marker);
  const remainder = src.slice(markerIndex + marker.length);
  const [firstSegment, ...pathSegments] = remainder.split('/');
  const hasTransformations =
    firstSegment.includes(',') ||
    firstSegment.startsWith('f_') ||
    firstSegment.startsWith('q_') ||
    firstSegment.startsWith('w_');
  const useEconomyQuality = Number(quality) > 0 && Number(quality) <= 65;
  const transformations = hasTransformations
    ? firstSegment
        .split(',')
        .filter((value) => (
          !value.startsWith('w_') &&
          !(useEconomyQuality && value.startsWith('q_'))
        ))
        .concat(useEconomyQuality ? 'q_auto:eco' : [])
        .concat(`w_${width}`)
        .join(',')
    : `f_auto,${useEconomyQuality ? 'q_auto:eco' : 'q_auto'},w_${width}`;
  const path = hasTransformations
    ? pathSegments.join('/')
    : remainder;

  return `${src.slice(0, markerIndex + marker.length)}${transformations}/${path}`;
}

export default function OptimizedImage({
  width = 1200,
  height = 800,
  alt = '',
  sizes = '(max-width: 767px) 50vw, 25vw',
  ...props
}) {
  return (
    <Image
      {...props}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      loader={imageLoader}
    />
  );
}
