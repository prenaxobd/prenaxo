'use client';
import OptimizedImage from '@/components/OptimizedImage';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function CategoryRail({ categories }) {
  const items = categories || [];

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(3);

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

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

  const maxIndex = Math.max(0, items.length - perView);

  useEffect(() => {
    if (items.length <= perView || paused) return;

    const timer = setInterval(() => {
      setActive((current) =>
        current >= maxIndex ? 0 : current + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, [items.length, perView, maxIndex, paused]);

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
    -(visibleActive * (100 / perView));

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

          <Link href="/shop-menu">
            View all
            <ArrowRight size={16} />
          </Link>

        </div>


        <div
          className="home-carousel home-category-carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
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
                  flex: `0 0 ${100 / perView}%`,
                }}
                key={category.id}
              >

                <Link
                  className="home-category-card"
                  href={`/category/${category.slug}`}
                >

                  {category.image ? (

                    <OptimizedImage
                      src={category.image}
                      alt={category.name}
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

                  <small>
                    {category._count?.products || 0} products
                  </small>

                </Link>

              </div>

            ))}

          </div>


          {items.length > perView && (

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


        {items.length > perView && (

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
                onClick={() => setActive(index)}
                aria-label={`Go to category slide ${index + 1}`}
              />

            ))}

          </div>

        )}

      </div>

    </section>
  );
}