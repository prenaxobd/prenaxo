'use client';

import { useState } from 'react';

import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Headphones,
  ShieldCheck,
  RotateCcw,
  Heart,
  Share2,
} from 'lucide-react';

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSubmitted(false);
    setError('');

    const form = e.currentTarget;

    const formData = {
      name: form.name.value,
      email: form.email.value,
      phone: form.phone.value,
      subject: form.subject.value,
      message: form.message.value,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSubmitted(true);

      form.reset();

      setTimeout(() => {
        setSubmitted(false);
      }, 7000);

    } catch (err) {
      setError(
        err.message || 'Unable to send your message. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="contact-page">

      {/* =========================================
          HERO
      ========================================== */}

      <section className="contact-hero">
        <div className="container contact-hero-grid">

          <div className="contact-hero-content">

            <div className="contact-eyebrow">
              CONTACT US
            </div>

            <h1>
              We&apos;d Love to
              <br />
              Hear From You!
            </h1>

            <div className="contact-title-line" />

            <p>
              Have a question, suggestion, or need help?
              Our team is ready to assist you. Get in touch
              with us anytime.
            </p>

          </div>

          <div className="contact-hero-art">

            <div className="contact-leaf leaf-1">
              🌿
            </div>

            <div className="contact-leaf leaf-2">
              🌱
            </div>

            <div className="contact-envelope">

              <div className="contact-envelope-top">

                <div className="contact-logo-mark">
                  K
                </div>

                <strong>
                  Ponnomela
                </strong>

              </div>

              <div className="contact-phone-icon">
                <Phone size={34} />
              </div>

            </div>

            <div className="contact-chat-bubble">
              <MessageCircle size={30} />
            </div>

          </div>

        </div>
      </section>


      {/* =========================================
          CONTACT FORM + INFORMATION
      ========================================== */}

      <section className="contact-section">

        <div className="container contact-grid">

          {/* FORM */}

          <div className="contact-card contact-form-card">

            <div className="contact-card-heading">

              <div className="contact-icon-circle">
                <Mail size={19} />
              </div>

              <div>

                <h2>
                  Send Us a Message
                </h2>

                <p>
                  Have a question or need assistance?
                  Fill out the form and our team will get back to you.
                </p>

              </div>

            </div>


            <form
              className="contact-form"
              onSubmit={handleSubmit}
            >

              <div className="contact-form-row">

                <label>
                  Full Name *

                  <input
                    type="text"
                    name="name"
                    placeholder="Your full name"
                    required
                  />
                </label>


                <label>
                  Email Address *

                  <input
                    type="email"
                    name="email"
                    placeholder="Your email address"
                    required
                  />
                </label>

              </div>


              <div className="contact-form-row">

                <label>
                  Phone Number *

                  <input
                    type="tel"
                    name="phone"
                    placeholder="Your phone number"
                    required
                  />
                </label>


                <label>
                  Subject *

                  <input
                    type="text"
                    name="subject"
                    placeholder="How can we help?"
                    required
                  />
                </label>

              </div>


              <label>
                Your Message *

                <textarea
                  name="message"
                  rows="6"
                  placeholder="Write your message here..."
                  required
                />
              </label>


              {/* ERROR */}

              {error && (
                <div className="form-error-message">

                  <div className="error-icon">
                    !
                  </div>

                  <div>
                    <strong>
                      Message could not be sent
                    </strong>

                    <p>
                      {error}
                    </p>
                  </div>

                </div>
              )}


              {/* SUCCESS */}

              {submitted && (
                <div className="form-success-message">

                  <div className="success-check">
                    ✓
                  </div>

                  <div>

                    <strong>
                      Message sent successfully!
                    </strong>

                    <p>
                      Thank you for contacting Ponnomela.
                      We&apos;ll get back to you soon.
                    </p>

                  </div>

                </div>
              )}


              {/* SEND MESSAGE */}

              <button
                type="submit"
                className="contact-submit"
                disabled={loading}
              >

                {loading ? (
                  <>
                    <span className="loading-spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={17} />
                    Send Message
                  </>
                )}

              </button>


              {/* WHATSAPP BUTTON */}

             <a
               href="https://wa.me/8801608069154"
               target="_blank"
               rel="noopener noreferrer"
               className="whatsapp-contact-button"
               aria-label="Contact us on WhatsApp"
               >
              <svg
                viewBox="0 0 32 32"
                width="24"
                height="24"
               aria-hidden="true"
             >
          <path
         fill="currentColor"
      d="M19.11 17.2c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.34-.79-.7-1.33-1.56-1.49-1.83-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.58.65.21 1.24.18 1.7.11.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
    />
    <path
      fill="currentColor"
      d="M16.02 3C8.84 3 3 8.84 3 16.02c0 2.29.6 4.44 1.65 6.3L3 29l6.86-1.8a12.96 12.96 0 0 0 6.16 1.56h.01C23.2 28.76 29 22.92 29 16.02 29 8.84 23.2 3 16.02 3zm0 23.55h-.01a10.8 10.8 0 0 1-5.5-1.5l-.39-.23-4.07 1.07 1.09-3.97-.25-.41a10.75 10.75 0 1 1 9.13 5.04z"
    />
  </svg>
</a>


              <div className="privacy-note">
                🔒 We respect your privacy. Your information will never be shared.
              </div>

            </form>

          </div>


          {/* CONTACT INFORMATION */}

          <div className="contact-card contact-info-card">

            <h2>
              Contact Information
            </h2>

            <div className="contact-small-line" />


            <div className="contact-info-list">

              <div className="contact-info-item">

                <div className="info-icon">
                  <MapPin size={19} />
                </div>

                <div>

                  <h3>
                    Address
                  </h3>

                  <p>
                    Dhaka, Bangladesh
                  </p>

                </div>

              </div>


              <div className="contact-info-item">

                <div className="info-icon">
                  <Phone size={19} />
                </div>

                <div>

                  <h3>
                    Phone
                  </h3>

                  <p>
                    +880 1700 000 000
                  </p>

                </div>

              </div>


              <div className="contact-info-item">

                <div className="info-icon">
                  <Mail size={19} />
                </div>

                <div>

                  <h3>
                    Email Us
                  </h3>

                  <p>
                    mdnadim9154@gmail.com
                  </p>

                </div>

              </div>


              <div className="contact-info-item">

                <div className="info-icon">
                  <Clock size={19} />
                </div>

                <div>

                  <h3>
                    Opening Hours
                  </h3>

                  <p>
                    24/7 Available
                  </p>

                </div>

              </div>

            </div>


            <div className="follow-us">

              <h3>
                Follow Us
              </h3>


              <div className="social-buttons">

                <a
                  href="https://www.facebook.com/share/1CguKieMtB/"
                  aria-label="Facebook"
                >
                  <span>f</span>
                </a>


                <a
                  href="https://www.instagram.com/"
                  aria-label="Instagram"
                >
                  <span>◎</span>
                </a>


                <a
                  href="https://www.tiktok.com/@ponnomela392"
                  aria-label="TikTok"
                >
                  <span>♪</span>
                </a>


                <a
                  href="https://www.youtube.com/channel/UC_x7tPyAFYWTLsNJF8772Zg"
                  aria-label="YouTube"
                >
                  <span>▶</span>
                </a>


                <a
                  href="https://www.linkedin.com/"
                  aria-label="LinkedIn"
                >
                  <Share2 size={16} />
                </a>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          VISIT US
      ========================================== */}

      <section className="visit-section">

        <div className="container">

          <div className="visit-card">

            <div className="visit-map">

              <iframe
                title="Ponnomela Location"
                src="https://www.google.com/maps?q=Dhaka,Bangladesh&output=embed"
                loading="lazy"
              />

            </div>


            <div className="visit-content">

              <div className="visit-heading">

                <MapPin size={25} />

                <h2>
                  Visit Us
                </h2>

                <span>
                  🌿
                </span>

              </div>


              <p>
                We welcome you to visit Ponnomela.
                Find our location easily using the map.
              </p>


              <a
                href="https://maps.google.com/?q=Dhaka,Bangladesh"
                target="_blank"
                rel="noopener noreferrer"
                className="visit-button"
              >
                Click here
                <Send size={15} />
              </a>

            </div>


            <div className="visit-plant">
              🌿
            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          FEATURES
      ========================================== */}

      <section className="contact-features">

        <div className="container contact-features-grid">

          <div className="contact-feature">

            <Headphones size={38} />

            <div>

              <h3>
                Fast Support
              </h3>

              <p>
                We&apos;re always here to help you
              </p>

            </div>

          </div>


          <div className="contact-feature">

            <ShieldCheck size={38} />

            <div>

              <h3>
                Secure &amp; Safe
              </h3>

              <p>
                Your information is always protected
              </p>

            </div>

          </div>


          <div className="contact-feature">

            <RotateCcw size={38} />

            <div>

              <h3>
                Hassle Free
              </h3>

              <p>
                Easy returns &amp; refunds
              </p>

            </div>

          </div>


          <div className="contact-feature">

            <Heart size={38} />

            <div>

              <h3>
                Customer First
              </h3>

              <p>
                Your satisfaction is our priority
              </p>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}