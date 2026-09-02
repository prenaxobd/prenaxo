'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function HeroSlider({ banners }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;

    const timer = setInterval(() => {
      setActive((index) => (index + 1) % banners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) {
    return (
      <section className="home-hero hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">The better everyday</div>

            <h1>
              Small joys,
              <br />
              delivered.
            </h1>

            <p>
              Thoughtfully sourced pantry staples, home goods, and little
              upgrades for life in Bangladesh.
            </p>

            <Link className="btn" href="/shop">
              Explore the collection
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="hero-art">
            <div className="basket">🧺</div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[active];

  return (
    <section className="home-hero hero">

      {/* SLIDER IMAGES */}
      <div className="hero-slider-images">
        {banners.map((banner, index) => {
          const image =
            banner.desktopImage || banner.image;

          const mobileImage =
            banner.mobileImage ||
            banner.desktopImage ||
            banner.image;

          return (
            <picture
              key={banner.id || index}
              className={`hero-slide-image ${
                index === active ? 'active' : ''
              }`}
              style={{
                transform: `translateX(${(index - active) * 100}%)`,
              }}
            >
              <source
                media="(max-width: 700px)"
                srcSet={mobileImage}
              />

              <img
                src={image}
                alt={banner.title || 'Banner'}
              />
            </picture>
          );
        })}
      </div>

      {/* DARK OVERLAY */}
      <div className="home-hero-shade" />

      {/* CONTENT */}
      <div className="container hero-grid">
        <div
          key={currentBanner.id || active}
          className="hero-copy"
        >
          <div className="eyebrow">
            {currentBanner.subtitle || 'Featured today'}
          </div>

          <h1>{currentBanner.title}</h1>

          <p>
            Thoughtfully sourced pantry staples, home goods,
            and little upgrades for life in Bangladesh.
          </p>

          <Link
            className="btn"
            href={currentBanner.link || '/shop'}
          >
            {currentBanner.buttonText || 'Shop now'}
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>

      {/* CONTROLS */}
      {banners.length > 1 && (
        <div className="hero-controls">

          <button
            aria-label="Previous banner"
            onClick={() =>
              setActive(
                (index) =>
                  (index - 1 + banners.length) %
                  banners.length
              )
            }
          >
            <ChevronLeft size={18} />
          </button>

          <div className="hero-dots">
            {banners.map((item, index) => (
              <button
                key={item.id || index}
                aria-label={`Show banner ${index + 1}`}
                aria-current={index === active}
                className={
                  index === active ? 'active' : ''
                }
                onClick={() => setActive(index)}
              />
            ))}
          </div>

          <button
            aria-label="Next banner"
            onClick={() =>
              setActive(
                (index) =>
                  (index + 1) % banners.length
              )
            }
          >
            <ChevronRight size={18} />
          </button>

        </div>
      )}

    </section>
  );
}