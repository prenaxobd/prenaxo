'use client';
import OptimizedImage from '@/components/OptimizedImage';

import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Copy,
  Download,
  MessageCircle,
  Music2,
  Send,
  X,
} from 'lucide-react';

import { useState } from 'react';
import { useWishlist } from '@/components/wishlist/WishlistProvider';
import { useAccountRequired } from '@/components/auth/AccountRequiredProvider';
import { useProductOptionSelection } from '@/components/product/ProductOptionContext';
import {
  getColorOptionImage,
  getGalleryColorOptions,
} from '@/components/product/product-option-images';

function normalizeColor(value) {
  return String(value || '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim().toLowerCase();
}

function isColorAttribute(attribute) {
  return String(attribute?.kind || '').toUpperCase() === 'COLOR' ||
    /colou?r/i.test(`${attribute?.slug || ''} ${attribute?.name || ''}`);
}

export default function ProductGallery({
  product,
  discount = 0,
}) {
  const productImages = product.images || [];
  const optionSelection = useProductOptionSelection();
  const wishlist = useWishlist();
  const { requireAccount, showAccountRequired } = useAccountRequired();
  const saved = wishlist?.isSaved(product.id) || false;
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState('');
  const selectedAttributeValueIds = optionSelection?.selectedAttributeValueIds || [];
  const attributeValues = product.attributeValues || [];
  const galleryColorOptions = getGalleryColorOptions(product);
  const colorValues = attributeValues
    .filter((item) => isColorAttribute(item.attributeValue?.attribute))
    .map((item) => item.attributeValue)
    .filter(Boolean);
  const selectedColors = colorValues.filter((value) =>
    selectedAttributeValueIds.includes(value.id)
  );
  const selectedGalleryColors = galleryColorOptions.filter((option) =>
    selectedAttributeValueIds.includes(option.id)
  );
  const selectedColorImages = [
    ...selectedColors.flatMap((value) => [
      ...galleryColorOptions
        .filter((option) => normalizeColor(value.name) === normalizeColor(option.name))
        .flatMap((option) => option.images),
      getColorOptionImage(product, value),
    ].filter(Boolean)),
    ...selectedGalleryColors.flatMap((option) => option.images),
  ];
  const taggedImages = galleryColorOptions.flatMap((option) => option.images);
  const sharedImages = productImages.filter((image) => !taggedImages.includes(image));
  const uniqueSelectedImages = [
    ...new Map(selectedColorImages.map((image) => [image.url, image])).values(),
  ];
  const hasSelectedColor = selectedColors.length > 0 || selectedGalleryColors.length > 0;
  const images = hasSelectedColor
    ? uniqueSelectedImages.length
      ? [
          ...uniqueSelectedImages,
          ...sharedImages.filter((image) =>
            !uniqueSelectedImages.some((selectedImage) => selectedImage.url === image.url)
          ),
        ]
      : sharedImages.length
        ? sharedImages
        : productImages
    : productImages;

  const [galleryState, setGalleryState] = useState({ colorKey: '', active: 0 });
  const [lightbox, setLightbox] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const selectedColorKey = [
    ...selectedColors.map((value) => value.id),
    ...selectedGalleryColors.map((value) => value.id),
  ].sort().join(',');
  const active = galleryState.colorKey === selectedColorKey ? galleryState.active : 0;
  const activeIndex = Math.min(active, Math.max(0, images.length - 1));
  const current =
    images[activeIndex]?.url || null;

  function setActive(nextActive) {
    setGalleryState((currentState) => ({
      colorKey: selectedColorKey,
      active: typeof nextActive === 'function'
        ? nextActive(currentState.colorKey === selectedColorKey ? currentState.active : 0)
        : nextActive,
    }));
  }

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

  async function toggleWishlist() {
    if (!wishlist?.ready || wishlistBusy) return;
    setWishlistBusy(true);
    setWishlistMessage('');
    try {
      if (!(await requireAccount())) return;
      const data = await wishlist.toggle(product.id);
      setWishlistMessage(data.saved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch (error) {
      if (error.status === 401) {
        showAccountRequired();
        return;
      }
      setWishlistMessage(error.message || 'Unable to update wishlist.');
    } finally {
      setWishlistBusy(false);
    }
  }

  function productUrl() {
    return `${window.location.origin}/product/${product.slug}`;
  }

  function openShareUrl(url) {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  }

  async function copyProductUrl() {
    try {
      await navigator.clipboard.writeText(productUrl());
      setCopied(true);
      setShareMessage('Product link copied.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      setCopied(false);
      setShareMessage(error.message || 'Could not copy the product link. Please copy it from the address bar.');
    }
  }

  async function nativeShare() {
    try {
      if (typeof navigator.share !== 'function') {
        setShareMessage('Use one of the social networks below to share this product.');
        return;
      }

      await navigator.share({
        title: product.name,
        text: product.name,
        url: productUrl(),
      });
      setShareOpen(false);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setShareMessage(error.message || 'Could not open the share menu.');
      }
    }
  }

  function shareImage() {
    const imageUrl = product.images?.[0]?.url;
    if (!imageUrl) {
      setShareMessage('No product image is available to share.');
      return;
    }

    openShareUrl(imageUrl);
  }

  function socialShareUrl(platform) {
    const url = productUrl();
    const encodedUrl = encodeURIComponent(url);
    const title = encodeURIComponent(product.name || 'Prenaxo product');
    const imageUrl = product.images?.[0]?.url
      ? new URL(product.images[0].url, window.location.origin).href
      : '';
    const image = encodeURIComponent(imageUrl);

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(`${product.name}\n\n${url}`)}`;
      case 'x':
        return `https://twitter.com/intent/tweet?text=${title}&url=${encodedUrl}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'telegram':
        return `https://t.me/share/url?url=${encodedUrl}&text=${title}`;
      case 'pinterest':
        return `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}&media=${image}&description=${title}`;
      case 'threads':
        return `https://www.threads.net/intent/post?text=${encodeURIComponent(`${product.name} ${url}`)}`;
      case 'tiktok':
        return `https://www.tiktok.com/share?url=${encodedUrl}`;
      case 'email':
        return `mailto:?subject=${title}&body=${encodeURIComponent(`${product.name}\n\n${url}`)}`;
      default:
        return '';
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
                images[activeIndex]?.alt ||
                product.name
              }
              className="main-product-image"
              priority
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
            className={`gallery-wishlist ${saved ? 'is-saved' : ''}`}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            title={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            disabled={!wishlist?.ready || wishlistBusy}
            onClick={() => void toggleWishlist()}
          >
            <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
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

        {wishlistMessage && (
          <p className="product-action-message" role="status">{wishlistMessage}</p>
        )}

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
              <button type="button" onClick={() => openShareUrl(socialShareUrl('facebook'))}>
                <Share2 size={17} /> Facebook
              </button>
              <button type="button" onClick={() => openShareUrl(socialShareUrl('whatsapp'))}>
                <MessageCircle size={17} /> WhatsApp
              </button>
              <button type="button" onClick={() => openShareUrl(socialShareUrl('x'))}>
                <X size={17} /> X / Twitter
              </button>
              <button type="button" onClick={() => openShareUrl(socialShareUrl('linkedin'))}>
                <Share2 size={17} /> LinkedIn
              </button>
              <button type="button" onClick={() => openShareUrl(socialShareUrl('telegram'))}>
                <Send size={17} /> Telegram
              </button>
              <button type="button" onClick={() => openShareUrl(socialShareUrl('pinterest'))}>
                <Share2 size={17} /> Pinterest (with image)
              </button>
              <button type="button" onClick={() => openShareUrl(socialShareUrl('threads'))}>
                <MessageCircle size={17} /> Threads
              </button>
              <button type="button" onClick={() => openShareUrl(socialShareUrl('tiktok'))}>
                <Music2 size={17} /> TikTok
              </button>
              <button type="button" onClick={() => openShareUrl(socialShareUrl('email'))}>
                <Send size={17} /> Email
              </button>
              <button type="button" onClick={shareImage}>
                <Download size={17} /> Open product image
              </button>
              <button type="button" onClick={copyProductUrl}>
                <Copy size={17} /> {copied ? 'Copied' : 'Copy Link'}
              </button>
              <button type="button" onClick={nativeShare}>
                <Share2 size={17} /> More apps
              </button>
            </div>
            {shareMessage && <p className="product-share-message" role="status">{shareMessage}</p>}
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
                    index === activeIndex
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