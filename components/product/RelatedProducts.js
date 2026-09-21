'use client';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import {
  useCallback,
  useEffect,
  useRef,
} from 'react';

import ProductCard from '@/components/ProductCard';

export default function RelatedProducts({
  products = [],
}) {
  const sliderRef = useRef(null);
  const timerRef = useRef(null);

  const scrollNext = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const amount =
      slider.clientWidth * 0.85;

    const maxScroll =
      slider.scrollWidth -
      slider.clientWidth;

    if (
      slider.scrollLeft >=
      maxScroll - 10
    ) {
      slider.scrollTo({
        left: 0,
        behavior: 'smooth',
      });

      return;
    }

    slider.scrollBy({
      left: amount,
      behavior: 'smooth',
    });
  }, []);

  function scrollPrevious() {
    const slider = sliderRef.current;

    if (!slider) return;

    const amount =
      slider.clientWidth * 0.85;

    if (slider.scrollLeft <= 10) {
      slider.scrollTo({
        left:
          slider.scrollWidth -
          slider.clientWidth,
        behavior: 'smooth',
      });

      return;
    }

    slider.scrollBy({
      left: -amount,
      behavior: 'smooth',
    });
  }

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();

    timerRef.current =
      setInterval(() => {
        scrollNext();
      }, 4000);
  }, [scrollNext, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();

    return () => {
      stopAutoPlay();
    };
  }, [startAutoPlay, stopAutoPlay]);

  if (!products.length) {
    return null;
  }

  return (
    <div
      className="related-carousel"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      onTouchStart={stopAutoPlay}
      onTouchEnd={startAutoPlay}
    >

      <button
        type="button"
        className="related-arrow related-prev"
        onClick={() => {
          scrollPrevious();
          startAutoPlay();
        }}
        aria-label="Previous products"
      >
        <ChevronLeft size={19} />
      </button>


      <div
        className="related-track"
        ref={sliderRef}
      >

        {products.map((product) => (
          <div
            className="related-slide"
            key={product.id}
          >
            <ProductCard
              product={product}
            />
          </div>
        ))}

      </div>


      <button
        type="button"
        className="related-arrow related-next"
        onClick={() => {
          scrollNext();
          startAutoPlay();
        }}
        aria-label="Next products"
      >
        <ChevronRight size={19} />
      </button>

    </div>
  );
}