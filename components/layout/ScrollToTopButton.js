'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        scrollableHeight > 0
          ? Math.min(100, Math.max(0, (window.scrollY / scrollableHeight) * 100))
          : 0;

      setIsVisible(window.scrollY >= window.innerHeight);
      setScrollProgress(progress);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);

    return () => {
      window.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      className="scroll-to-top-button"
      aria-label={`Scroll to top, page ${Math.round(scrollProgress)}% scrolled`}
      title="Back to top"
      onClick={() => {
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;

        window.scrollTo({
          top: 0,
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
      }}
    >
      <svg className="scroll-to-top-progress" viewBox="0 0 52 52" aria-hidden="true">
        <circle className="scroll-to-top-track" cx="26" cy="26" r="23" />
        <circle
          className="scroll-to-top-progress-value"
          cx="26"
          cy="26"
          r="23"
          style={{ strokeDashoffset: 144.51 * (1 - scrollProgress / 100) }}
        />
      </svg>
      <span className="scroll-to-top-icon">
        <ArrowUp size={21} strokeWidth={2.2} aria-hidden="true" />
      </span>
    </button>
  );
}
