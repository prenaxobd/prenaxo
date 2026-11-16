'use client';
import OptimizedImage from '@/components/OptimizedImage';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AUTOPLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

function BannerImage({ banner, priority = false, sizes }) {
  const image = banner?.desktopImage || banner?.image;

  if (!image) return null;

  const content = (
    <OptimizedImage
      src={image}
      alt=""
      className="home-hero-image"
      sizes={sizes}
      quality={65}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      draggable="false"
    />
  );

  if (!banner?.link) {
    return content;
  }

  return (
    <a
      href={banner.link}
      className="home-hero-image-link"
      aria-label="Open banner"
    >
      {content}
    </a>
  );
}

function RightBannerSlider({ banners }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (
      banners.length < 2 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % banners.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return null;

  const visibleActive = Math.min(active, banners.length - 1);

  return (
    <aside
      className="home-hero-right"
      aria-label="Promotional banners"
    >
      {banners.map((banner, index) => {
        const isActive = index === visibleActive;
        const image = (
          <OptimizedImage
            src={banner.image}
            alt=""
            className="home-hero-right-image"
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            draggable="false"
          />
        );

        return (
          <div
            key={banner.id || index}
            className={`home-hero-right-slide${isActive ? ' is-active' : ''}`}
            aria-hidden={!isActive}
          >
            {banner.link ? (
              <a
                href={banner.link}
                className="home-hero-right-link"
                aria-label="Open promotional banner"
                tabIndex={isActive ? 0 : -1}
              >
                {image}
              </a>
            ) : image}
          </div>
        );
      })}
    </aside>
  );
}

export default function HeroSlider({
  banners = [],
  rightBanner = null,
}) {
  const validBanners = banners.filter(
    (banner) => banner?.desktopImage || banner?.image
  );
  const validRightBanners = (
    Array.isArray(rightBanner)
      ? rightBanner
      : rightBanner
        ? [rightBanner]
        : []
  ).filter((banner) => banner?.image);

  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchActive = useRef(false);

  const visibleActive = validBanners.length
    ? Math.min(active, validBanners.length - 1)
    : 0;

  const next = useCallback(() => {
    if (validBanners.length < 2) return;

    setActive((current) => {
      return (current + 1) % validBanners.length;
    });
  }, [validBanners.length]);

  const previous = useCallback(() => {
    if (validBanners.length < 2) return;

    setActive((current) => {
      return (
        (current - 1 + validBanners.length) %
        validBanners.length
      );
    });
  }, [validBanners.length]);

  const goTo = useCallback(
    (index) => {
      if (!validBanners.length) return;

      setActive(
        Math.max(
          0,
          Math.min(index, validBanners.length - 1)
        )
      );
    },
    [validBanners.length]
  );

  /* =========================
     AUTOPLAY
     ========================= */

  useEffect(() => {
    if (
      validBanners.length < 2 ||
      isPaused ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      next();
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    validBanners.length,
    isPaused,
    next,
  ]);

  /* =========================
     TOUCH / SWIPE
     ========================= */

  function handleTouchStart(event) {
    if (validBanners.length < 2) return;

    const touch = event.touches[0];

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    touchActive.current = true;

    setIsPaused(true);
  }

  function handleTouchMove(event) {
    if (!touchActive.current) return;

    const touch = event.touches[0];

    const deltaX = Math.abs(
      touch.clientX - touchStartX.current
    );

    const deltaY = Math.abs(
      touch.clientY - touchStartY.current
    );

    if (deltaX > deltaY) {
      event.preventDefault();
    }
  }

  function handleTouchEnd(event) {
    if (!touchActive.current) return;

    const touch = event.changedTouches[0];

    const deltaX =
      touch.clientX - touchStartX.current;

    const deltaY =
      touch.clientY - touchStartY.current;

    touchActive.current = false;

    if (
      Math.abs(deltaX) >= SWIPE_THRESHOLD &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      if (deltaX < 0) {
        next();
      } else {
        previous();
      }
    }

    window.setTimeout(() => {
      setIsPaused(false);
    }, 1200);
  }

  /* =========================
     EMPTY STATE
     ========================= */

  if (
    !validBanners.length &&
    !validRightBanners.length
  ) {
    return null;
  }

  return (
    <section
      className="home-hero-layout"
      aria-label="Homepage banners"
    >
      {/* =========================================
          LEFT HERO SLIDER
          ========================================= */}

      {validBanners.length > 0 && (
        <div
          className="home-hero-main"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        >
          <div className="home-hero-track">
            {validBanners.map((banner, index) => {
              const position = index - active;

              return (
                <div
                  key={banner.id || index}
                  className={`home-hero-slide ${
                    index === active
                      ? 'is-active'
                      : ''
                  }`}
                  style={{
                    transform: `translate3d(${position * 100}%, 0, 0)`,
                  }}
                  aria-hidden={
                    index !== active
                  }
                >
                  {index === active && (
                    <BannerImage
                      banner={banner}
                      priority={index === 0}
                      sizes="(max-width: 480px) calc(100vw - 30px), (max-width: 767px) calc(100vw - 32px), 69vw"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* =====================================
              LEFT / RIGHT ARROWS
              ONLY FOR LEFT SLIDER
              ===================================== */}

          {validBanners.length > 1 && (
            <>
              <button
                type="button"
                className="home-hero-arrow home-hero-arrow-prev"
                onClick={() => {
                  setIsPaused(true);
                  previous();

                  window.setTimeout(() => {
                    setIsPaused(false);
                  }, 1200);
                }}
                aria-label="Previous banner"
              >
                <ChevronLeft size={18} strokeWidth={2.2} />
              </button>

              <button
                type="button"
                className="home-hero-arrow home-hero-arrow-next"
                onClick={() => {
                  setIsPaused(true);
                  next();

                  window.setTimeout(() => {
                    setIsPaused(false);
                  }, 1200);
                }}
                aria-label="Next banner"
              >
                <ChevronRight size={18} strokeWidth={2.2} />
              </button>

              {/* Dots */}
              <div className="home-hero-dots">
                {validBanners.map(
                  (banner, index) => (
                    <button
                      key={
                        banner.id || index
                      }
                      type="button"
                      className={
                        index === active
                          ? 'is-active'
                          : ''
                      }
                      aria-label={`Show banner ${
                        index + 1
                      }`}
                      aria-current={
                        index === active
                          ? 'true'
                          : undefined
                      }
                      onClick={() => {
                        setIsPaused(true);
                        goTo(index);

                        window.setTimeout(
                          () => {
                            setIsPaused(false);
                          },
                          1200
                        );
                      }}
                    />
                  )
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* =========================================
          RIGHT STATIC PROMOTIONAL BANNER
          NO SLIDER
          NO ARROW
          NO DOT
          ========================================= */}

      <RightBannerSlider banners={validRightBanners} />
    </section>
  );
}