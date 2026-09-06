'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import ProductCard from '@/components/ProductCard';

export default function ProductRail({
  title,
  eyebrow,
  products,
  href = '/shop',
}) {
  const items = products || [];

  if (!items.length) return null;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(5);

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    function updatePerView() {
      if (window.innerWidth <= 620) {
        setPerView(2);
      } else if (window.innerWidth <= 900) {
        setPerView(3);
      } else {
        setPerView(5);
      }
    }

    updatePerView();

    window.addEventListener(
      'resize',
      updatePerView
    );

    return () => {
      window.removeEventListener(
        'resize',
        updatePerView
      );
    };
  }, []);

  const maxIndex = Math.max(
    0,
    items.length - perView
  );

  useEffect(() => {
    if (items.length <= perView || paused) return;

    const timer = setInterval(() => {
      setActive((current) =>
        current >= maxIndex
          ? 0
          : current + 1
      );
    }, 3200);

    return () => clearInterval(timer);
  }, [
    items.length,
    perView,
    maxIndex,
    paused,
  ]);

  useEffect(() => {
    if (active > maxIndex) {
      setActive(0);
    }
  }, [active, maxIndex]);

  function previous() {
    setActive((current) =>
      current <= 0
        ? maxIndex
        : current - 1
    );
  }

  function next() {
    setActive((current) =>
      current >= maxIndex
        ? 0
        : current + 1
    );
  }

  function handleTouchStart(event) {
    touchStart.current =
      event.touches[0].clientX;
  }

  function handleTouchEnd(event) {
    touchEnd.current =
      event.changedTouches[0].clientX;

    const distance =
      touchStart.current -
      touchEnd.current;

    if (Math.abs(distance) < 50) return;

    if (distance > 0) {
      next();
    } else {
      previous();
    }
  }

  const translate =
    -(active * (100 / perView));

  return (
    <section className="home-section">

      <div className="container">

        <div className="section-head">

          <div>

            <div className="eyebrow home-eyebrow">
              {eyebrow}
            </div>

            <h2>{title}</h2>

          </div>

          <Link href={href}>
            View all
            <ArrowRight size={16} />
          </Link>

        </div>


        <div
          className="home-carousel home-product-carousel"
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

            {items.map((product) => (

              <div
                className="home-carousel-item"
                style={{
                  flex: `0 0 ${100 / perView}%`,
                }}
                key={product.id}
              >

                <ProductCard
                  product={product}
                />

              </div>

            ))}

          </div>


          {items.length > perView && (

            <>

              <button
                type="button"
                className="home-carousel-btn home-carousel-prev"
                onClick={previous}
                aria-label="Previous products"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                className="home-carousel-btn home-carousel-next"
                onClick={next}
                aria-label="Next products"
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
                  index === active
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActive(index)
                }
                aria-label={`Go to product slide ${index + 1}`}
              />

            ))}

          </div>

        )}

      </div>

    </section>
  );
}