import { NextResponse } from 'next/server';

export function proxy(request) {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean);
  if (segments.length !== 3) return NextResponse.next();

  let parentSlug;
  let subcategorySlug;
  try {
    parentSlug = decodeURIComponent(segments[1]);
    subcategorySlug = decodeURIComponent(segments[2]);
  } catch (error) {
    if (error instanceof URIError) return NextResponse.next();
    throw error;
  }

  const destination = new URL(request.url);

  destination.pathname = `/category/${encodeURIComponent(parentSlug)}`;
  destination.searchParams.set('subcategory', subcategorySlug);

  return NextResponse.redirect(destination, 301);
}

export const config = {
  matcher: '/category/:slug/:subcategory',
};
