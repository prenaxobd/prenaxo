'use client';

import { useEffect, useRef } from 'react';

export default function HomeScrollReveal({ children }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll('.home-scroll-reveal');
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (motionPreference.matches || !('IntersectionObserver' in window)) {
      sections.forEach(section => section.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      rootMargin: '0px 0px -8% 0px',
      threshold: 0.08,
    });

    sections.forEach(section => {
      section.classList.add('is-pending');
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-scroll-reveal-root" ref={containerRef}>
      {children}
    </div>
  );
}
