'use client';
import OptimizedImage from '@/components/OptimizedImage';

import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Copy,
  MessageCircle,
  X,
} from 'lucide-react';

import { useState } from 'react';

export default function ProductGallery({
  product,
  discount = 0,
}) {
  const images = product.images || [];

  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const current =
    images[active]?.url || null;

  function previous() {
    setActive((value) =>
      value === 0
        ? Math.max(images.length - 1, 0)
        : value - 1
    );
  }

  function next() {
    setActive((value) =>
      value === images.length - 1
        ? 0
        : value + 1
    );
  }

  function productUrl() {
    return `${window.location.origin}/product/${product.slug}`;
  }

  function openFacebook() {
    const url = encodeURIComponent(productUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  }

  function openWhatsApp() {
    const message = `${product.name}\n\n${productUrl()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  }

  async function copyProductUrl() {
    try {
      await navigator.clipboard.writeText(productUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    try {
      if (typeof navigator.share !== 'function') {
        await copyProductUrl();
        return;
      }

      await navigator.share({
        title: product.name,
        url: productUrl(),
      });
      setShareOpen(false);
    } catch {
      // User cancelled sharing.
    }
  }

  return (
    <>
      <div className="product-gallery">

        <div className="product-image-box">

          {current ? (
            <OptimizedImage
              src={current}
              alt={
                images[active]?.alt ||
                product.name
              }
              className="main-product-image"
            />
          ) : (
            <div className="product-image-placeholder">
              {product.emoji || '📦'}
            </div>
          )}

          {discount > 0 && (
            <span className="product-sale-badge">
              {discount}% OFF
            </span>
          )}

          <button
            type="button"
            className="gallery-wishlist"
            aria-label="Add to wishlist"
          >
            <Heart size={20} />
          </button>

          <button
            type="button"
            className="gallery-share"
            aria-label="Share product"
            onClick={() => setShareOpen(true)}
          >
            <Share2 size={18} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-nav gallery-prev"
                onClick={previous}
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                className="gallery-nav gallery-next"
                onClick={next}
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {current && (
            <button
              type="button"
              className="gallery-fullscreen"
              onClick={() => setLightbox(true)}
              aria-label="Open fullscreen"
            >
              <Maximize2 size={17} />
            </button>
          )}

        </div>

        {shareOpen && (
          <div className="product-share-popup" role="dialog" aria-label="Share product">
            <div className="product-share-preview">
              {product.images?.[0]?.url && (
                <OptimizedImage src={product.images[0].url} alt="" />
              )}
              <strong>{product.name}</strong>
            </div>

            <button type="button" className="product-share-close" onClick={() => setShareOpen(false)} aria-label="Close share options">
              <X size={16} />
            </button>

            <div className="product-share-options">
              <button type="button" onClick={openFacebook}>
                <Share2 size={17} /> Facebook
              </button>
              <button type="button" onClick={openWhatsApp}>
                <MessageCircle size={17} /> WhatsApp
              </button>
              <button type="button" onClick={copyProductUrl}>
                <Copy size={17} /> {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button type="button" onClick={nativeShare}>
                <Share2 size={17} /> More
              </button>
            </div>
          </div>
        )}


        {/* THUMBNAILS */}

        {images.length > 1 && (
          <div className="product-thumbnails">

            {images.slice(0, 6).map(
              (image, index) => (
                <button
                  type="button"
                  key={image.id || image.url}
                  className={
                    index === active
                      ? 'active'
                      : ''
                  }
                  onClick={() =>
                    setActive(index)
                  }
                >
                  <OptimizedImage
                    src={image.url}
                    alt={
                      image.alt ||
                      `${product.name} ${index + 1}`
                    }
                  />
                </button>
              )
            )}

          </div>
        )}

        {/* MOBILE COUNTER */}

        {images.length > 1 && (
          <div className="mobile-image-counter">
            {active + 1}/{images.length}
          </div>
        )}

      </div>


      {/* LIGHTBOX */}

      {lightbox && current && (
        <div
          className="product-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() =>
            setLightbox(false)
          }
        >

          <button
            type="button"
            className="lightbox-close"
            onClick={() =>
              setLightbox(false)
            }
          >
            ×
          </button>

          <button
            type="button"
            className="lightbox-prev"
            onClick={(event) => {
              event.stopPropagation();
              previous();
            }}
          >
            <ChevronLeft />
          </button>

          <OptimizedImage
            src={current}
            alt={product.name}
            onClick={(event) =>
              event.stopPropagation()
            }
          />

          <button
            type="button"
            className="lightbox-next"
            onClick={(event) => {
              event.stopPropagation();
              next();
            }}
          >
            <ChevronRight />
          </button>

        </div>
      )}
    </>
  );
}