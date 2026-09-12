'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

function getBrandImage(brand) {
  const logo =
    typeof brand?.logo === 'string'
      ? brand.logo.trim()
      : '';

  const image =
    typeof brand?.image === 'string'
      ? brand.image.trim()
      : '';

  const src = logo || image;

  if (!src) {
    return '';
  }

  if (
    src.startsWith('http://') ||
    src.startsWith('https://')
  ) {
    return src;
  }

  if (src.startsWith('/')) {
    return src;
  }

  return `/${src}`;
}

export default function BrandRail({ brands = [] }) {
  const items = Array.isArray(brands)
    ? brands.slice(0, 12)
    : [];

  if (!items.length) {
    return null;
  }

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(5);

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    function updatePerView() {
      if (window.innerWidth <= 640) {
        setPerView(2);
      } else if (window.innerWidth <= 900) {
        setPerView(3);
      } else {
        setPerView(5);
      }
    }

    updatePerView();
    window.addEventListener('resize', updatePerView);

    return () => {
      window.removeEventListener('resize', updatePerView);
    };
  }, []);

  const maxIndex = Math.max(0, items.length - perView);

  useEffect(() => {
    if (items.length <= perView || paused) return;

    const timer = setInterval(() => {
      setActive((current) =>
        current >= maxIndex ? 0 : current + 1
      );
    }, 3500);

    return () => clearInterval(timer);
  }, [items.length, perView, maxIndex, paused]);

  useEffect(() => {
    if (active > maxIndex) {
      setActive(0);
    }
  }, [active, maxIndex]);

  function previous() {
    setActive((current) =>
      current <= 0 ? maxIndex : current - 1
    );
  }

  function next() {
    setActive((current) =>
      current >= maxIndex ? 0 : current + 1
    );
  }

  function handleTouchStart(event) {
    touchStart.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    touchEnd.current = event.changedTouches[0].clientX;
    const distance = touchStart.current - touchEnd.current;

    if (Math.abs(distance) < 50) return;

    if (distance > 0) {
      next();
    } else {
      previous();
    }
  }

  const translate = -(active * (100 / perView));

  return (
    <section className="home-section home-brand-section">
      <div className="container">

        <div className="section-head home-brand-heading">
          <div>
            <div className="eyebrow home-eyebrow">
              Trusted names
            </div>

            <h2>Our Brands</h2>
          </div>

          <Link href="/brands" className="home-brand-see-all">
            SEE ALL
          </Link>
        </div>

        <div
          className="home-carousel home-brand-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          aria-label="Featured brands"
        >
          <div
            className="home-carousel-track home-brand-track"
            style={{ transform: `translateX(${translate}%)` }}
          >
            {items.map((brand) => {
              const image = getBrandImage(brand);

              return (
                <div
                  key={brand.id || brand.slug || brand.name}
                  className="home-carousel-item home-brand-item"
                  style={{ flex: `0 0 ${100 / perView}%` }}
                >
                  <Link
                    className="home-brand-card"
                    href={`/shop?brand=${encodeURIComponent(
                      brand.slug || brand.name || ''
                    )}`}
                    aria-label={`Shop ${brand.name || 'brand'}`}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={brand.name || 'Brand'}
                        className="home-brand-image"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className="home-brand-card-text">
                        {brand.name || 'Brand'}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {items.length > perView && (
            <>
              <button
                type="button"
                className="home-carousel-btn home-carousel-prev"
                onClick={previous}
                aria-label="Previous brands"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                className="home-carousel-btn home-carousel-next"
                onClick={next}
                aria-label="Next brands"
              >
                <ChevronRight size={19} />
              </button>
            </>
          )}
        </div>

        {items.length > perView && (
          <div className="home-carousel-dots home-brand-dots" aria-hidden="true">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className={index === active ? 'active' : ''}
                onClick={() => setActive(index)}
                aria-label={`Go to brand slide ${index + 1}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}