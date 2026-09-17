'use client';

import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faAward,
  faBoxOpen,
  faCheckCircle,
  faHandshake,
  faHeadset,
  faLeaf,
  faRotateLeft,
  faShieldAlt,
  faStar,
  faTags,
  faTruckFast,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import './aboutStyle.css';

const features = [
  {
    icon: faShieldAlt,
    title: 'Trusted & Secure',
    text: '100% secure payments and customer privacy',
  },
  {
    icon: faTags,
    title: 'Best Price',
    text: 'Quality products at the best prices',
  },
  {
    icon: faTruckFast,
    title: 'Fast Delivery',
    text: 'Quick delivery across Bangladesh',
  },
  {
    icon: faRotateLeft,
    title: 'Easy Returns',
    text: 'Hassle-free return within 7 days',
  },
  {
    icon: faHeadset,
    title: 'Customer Support',
    text: 'We are here to help you anytime',
  },
];

const values = [
  {
    icon: faUsers,
    title: 'Customer First',
    text: 'We put our customers at the heart of everything we do.',
  },
  {
    icon: faHandshake,
    title: 'Honesty & Transparency',
    text: 'We believe in honest communication and fair practices.',
  },
  {
    icon: faLeaf,
    title: 'Quality & Care',
    text: 'We ensure quality in products and service.',
  },
  {
    icon: faAward,
    title: 'Community First',
    text: 'We grow together and support local communities.',
  },
];

const heroStats = [
  { value: '50K+', label: 'Happy buyers' },
  { value: '10K+', label: 'Curated items' },
  { value: '4.8/5', label: 'Avg. rating' },
];

export default function About() {
  useEffect(() => {
    const revealItems = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-container about-hero-grid">
          <div className="about-hero-content reveal">
            <div className="about-eyebrow">About Prenaxo</div>

            <h1>
              Everyday essentials,
              <span>thoughtfully chosen.</span>
            </h1>

            <p className="about-hero-text">
              Prenaxo is a Bangladeshi online marketplace designed to make your daily shopping feel easier,
              more trusted, and more rewarding. We curate quality products, fair pricing, and a service experience
              built around real customer needs.
            </p>

            <div className="about-hero-actions">
              <a href="/shop" className="about-cta">
                Shop Now
                <FontAwesomeIcon icon={faArrowRight} />
              </a>
              <a href="/contact" className="about-secondary">
                Contact Us
              </a>
            </div>

 
          </div>


        </div>
      </section>

      <section className="about-story">
        <div className="about-container story-grid">
          <div className="story-image-wrap reveal">
            <img src="/uploads/our_story_img.webp" alt="Prenaxo team and warehouse" />
          </div>

          <div className="story-content reveal">
            <div className="about-eyebrow">Our Story</div>

            <h2>A simple idea to serve better every day.</h2>

            <p>
              Prenaxo started with a simple belief: shopping should be easy, affordable, and reliable for every
              household. We set out to create a marketplace that feels personal and dependable from the very first click.
            </p>

            <p>
              From daily essentials to trending household picks, we handpick each item with care and partner with trusted
              suppliers to deliver quality you can count on.
            </p>

            <p>
              We are proudly Bangladesh-focused and committed to supporting local businesses and communities while making
              life more convenient for families across the country.
            </p>

            <div className="story-signature">
              <span>With care,</span>
              <strong>Prenaxo Team</strong>
              <small>Building trust. Delivering happiness.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="about-container">
          <div className="section-heading centered reveal">
            <div className="about-eyebrow">Why Choose Prenaxo</div>
            <h2>Shopping made easy, safe & reliable.</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature, index) => (
              <div className="feature-card reveal" key={feature.title} style={{ transitionDelay: `${index * 80}ms` }}>
                <div className="feature-icon">
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="about-container stats-grid">
          <div className="stat-item reveal">
            <span className="stat-icon">
              <FontAwesomeIcon icon={faUsers} />
            </span>
            <div>
              <strong>50,000+</strong>
              <small>Happy Customers</small>
            </div>
          </div>

          <div className="stat-item reveal">
            <span className="stat-icon">
              <FontAwesomeIcon icon={faBoxOpen} />
            </span>
            <div>
              <strong>10,000+</strong>
              <small>Products</small>
            </div>
          </div>

          <div className="stat-item reveal">
            <span className="stat-icon">
              <FontAwesomeIcon icon={faHandshake} />
            </span>
            <div>
              <strong>500+</strong>
              <small>Trusted Partners</small>
            </div>
          </div>

          <div className="stat-item reveal">
            <span className="stat-icon">
              <FontAwesomeIcon icon={faStar} />
            </span>
            <div>
              <strong>4.8/5</strong>
              <small>Customer Rating</small>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section">
        <div className="about-container values-grid">
          <div className="values-content reveal">
            <div className="about-eyebrow">Our Values</div>
            <h2>What drives us every day.</h2>

            <div className="values-list">
              {values.map((value, index) => (
                <div className="value-item reveal" key={value.title} style={{ transitionDelay: `${index * 90}ms` }}>
                  <div className="value-icon">
                    <FontAwesomeIcon icon={value.icon} />
                  </div>
                  <div>
                    <h3>{value.title}</h3>
                    <p>{value.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="values-image-wrap reveal">
            <img src="/uploads/our_valuse_img.webp" alt="Prenaxo team" />
          </div>
        </div>
      </section>
    </main>
  );
}
