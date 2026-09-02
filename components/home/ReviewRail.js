'use client';

import {
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ReviewRail({
  reviews,
}) {
  const items = reviews || [];

  if (!items.length) return null;

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [perView, setPerView] = useState(3);

  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  useEffect(() => {
    function updatePerView() {
      if (window.innerWidth <= 620) {
        setPerView(1);
      } else if (window.innerWidth <= 900) {
        setPerView(2);
      } else {
        setPerView(3);
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
    }, 4000);

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
    <section className="home-section home-review-section">

      <div className="container">

        <div className="section-head">

          <div>

            <div className="eyebrow home-eyebrow">
              Real words from real homes
            </div>

            <h2>What customers say</h2>

          </div>

        </div>


        <div
          className="home-carousel home-review-carousel"
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

            {items.map((review) => (

              <div
                className="home-carousel-item"
                style={{
                  flex: `0 0 ${100 / perView}%`,
                }}
                key={review.id}
              >

                <article className="home-review">

                  <div className="home-stars">

                    {Array.from(
                      { length: 5 },
                      (_, index) => (

                        <Star
                          key={index}
                          size={14}
                          fill={
                            index <
                            Number(
                              review.rating || 0
                            )
                              ? 'currentColor'
                              : 'none'
                          }
                        />

                      )
                    )}

                  </div>


                  <p>
                    {review.comment ||
                      'A lovely experience from Khatibazar.'}
                  </p>


                  <strong>
                    {review.user?.name ||
                      'Verified customer'}
                  </strong>


                  {review.product?.name && (

                    <small>
                      {review.product.name}
                    </small>

                  )}

                </article>

              </div>

            ))}

          </div>


          {items.length > perView && (

            <>

              <button
                type="button"
                className="home-carousel-btn home-carousel-prev"
                onClick={previous}
                aria-label="Previous reviews"
              >
                <ChevronLeft size={19} />
              </button>

              <button
                type="button"
                className="home-carousel-btn home-carousel-next"
                onClick={next}
                aria-label="Next reviews"
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
                aria-label={`Go to review slide ${index + 1}`}
              />

            ))}

          </div>

        )}

      </div>

    </section>
  );
}