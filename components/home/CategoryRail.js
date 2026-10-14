'use client';
import OptimizedImage from '@/components/OptimizedImage';

import Link from 'next/link';
import CategoryNavigationLink from '@/components/layout/CategoryNavigationLink';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CategoryRail({ categories }) {
  const items = categories || [];

  const [active, setActive] = useState(0);
  const [perView, setPerView] = useState(3);

  const carouselRef = useRef(null);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);
  const isInteracting = useRef(false);
  const isVisible = useRef(false);
  const pauseUntil = useRef(0);

  useEffect(() => {
    function updatePerView() {
      if (window.innerWidth <= 620) {
        setPerView(3);
      } else if (window.innerWidth <= 900) {
        setPerView(3);
      } else {
        setPerView(6);
      }
    }

    updatePerView();
    window.addEventListener('resize', updatePerView);

    return () => {
      window.removeEventListener('resize', updatePerView);
    };
  }, []);

  const visibleCount = Math.min(perView, items.length);
  const maxIndex = Math.max(0, items.length - visibleCount);

  useEffect(() => {
    if (maxIndex <= 0) return undefined;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionPreference.matches) return undefined;

    const carousel = carouselRef.current;
    if (!carousel || !('IntersectionObserver' in window)) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible.current = entry.isIntersecting;
    }, { threshold: 0.2 });
    observer.observe(carousel);

    const timer = window.setInterval(() => {
      if (
        !isVisible.current ||
        isInteracting.current ||
        document.hidden ||
        pauseUntil.current > Date.now()
      ) {
        return;
      }

      setActive((current) => (current >= maxIndex ? 0 : current + 1));
    }, 5000);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [maxIndex]);

  function previous() {
    pauseUntil.current = Date.now() + 8000;
    setActive((current) =>
      current <= 0 ? maxIndex : current - 1
    );
  }

  function next() {
    pauseUntil.current = Date.now() + 8000;
    setActive((current) =>
      current >= maxIndex ? 0 : current + 1
    );
  }

  function handleTouchStart(event) {
    isInteracting.current = true;
    pauseUntil.current = Date.now() + 8000;
    touchStart.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    isInteracting.current = false;
    touchEnd.current = event.changedTouches[0].clientX;

    const distance =
      touchStart.current - touchEnd.current;

    if (Math.abs(distance) < 50) return;

    if (distance > 0) {
      next();
    } else {
      previous();
    }
  }

  if (!items.length) return null;

  const visibleActive = Math.min(active, maxIndex);
  const translate =
    -(visibleActive * (100 / visibleCount));

  return (
    <section className="home-section home-category-section">

      <div className="container">

        <div className="section-head">

          <div>
            <div className="eyebrow home-eyebrow">
              Browse the market
            </div>

            <h2>Shop by category</h2>
          </div>

          <Link href="/shop">
            View all
            <ArrowRight size={16} />
          </Link>

        </div>


        <div
          ref={carouselRef}
          className="home-carousel home-category-carousel"
          onMouseEnter={() => { isInteracting.current = true; }}
          onMouseLeave={() => { isInteracting.current = false; }}
          onFocusCapture={() => { isInteracting.current = true; }}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              isInteracting.current = false;
              pauseUntil.current = Date.now() + 8000;
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          <div
            className="home-carousel-track"
            style={{
              transform: `translateX(${translate}%)`,
            }}
          >

            {items.map((category) => (

              <div
                className="home-carousel-item"
                style={{
                  flex: `0 0 ${100 / visibleCount}%`,
                }}
                key={category.id}
              >

                <CategoryNavigationLink
                  className="home-category-card"
                  href={`/category/${category.slug}`}
                >

                  {category.image ? (

                    <OptimizedImage
                      src={category.image}
                      alt=""
                      sizes="72px"
                      loading="lazy"
                    />

                  ) : (

                    <span className="home-category-icon">
                      ✦
                    </span>

                  )}

                  <strong>
                    {category.name}
                  </strong>

                </CategoryNavigationLink>

              </div>

            ))}

          </div>


          {items.length > visibleCount && (

            <>

              <button
                type="button"
                className="home-carousel-btn home-carousel-prev"
                onClick={previous}
                aria-label="Previous categories"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                className="home-carousel-btn home-carousel-next"
                onClick={next}
                aria-label="Next categories"
              >
                <ChevronRight size={19} />
              </button>

            </>

          )}

        </div>


        {items.length > visibleCount && (

          <div className="home-carousel-dots">

            {Array.from({
              length: maxIndex + 1,
            }).map((_, index) => (

              <button
                key={index}
                type="button"
                className={
                  index === visibleActive
                    ? 'active'
                    : ''
                }
                onClick={() => {
                  pauseUntil.current = Date.now() + 8000;
                  setActive(index);
                }}
                aria-label={`Go to category slide ${index + 1}`}
              />

            ))}

          </div>

        )}

      </div>

    </section>
  );
}