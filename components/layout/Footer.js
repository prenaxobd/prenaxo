import Link from 'next/link';
import { getSiteSettings } from '@/lib/seo';
import { prisma } from '@/lib/prisma';

async function getTrustedPurposeMessage() {
  return "Trusted by thousands of customers across Bangladesh";
}

export default async function Footer() {
  // Fetch site settings and categories in parallel
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      where: { active: true },
      select: { name: true, slug: true },
      orderBy: { name: 'asc' },
      take: 5,
    }).catch(() => []),
  ]);

  const siteName = settings?.siteName || 'Prenaxo';
  const contactPhone = settings?.contactPhone || '+880 1608069154';
  const contactEmail = settings?.contactEmail || 'hello@prenaxo.com';
  const logoUrl = settings?.logo || '/uploads/prenaxo-logo.png';
  const year = new Date().getFullYear();

  const trustMessage = await getTrustedPurposeMessage();

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        
        {/* =====================================================
            MAIN FOOTER CONTENT
        ===================================================== */}
        <div className="footer-main">
          
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="footer-logo">
              <img 
                src={logoUrl} 
                alt={siteName}
                width="160"
                height="60"
              />
            </div>
            <p className="footer-tagline">
              Good things for everyday living.<br />
              Curated with care, delivered with ease.
            </p>
            <div className="footer-trust-block">
              <p className="footer-trust-message">
                {trustMessage}
              </p>

              <div className="footer-socials" aria-label="Follow us on social media">
                <a href="https://www.facebook.com/share/18Ds2tvzrp/" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="Facebook">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M13.5 21v-8h2.7l.4-3h-3.1V7.5c0-.9.3-1.5 1.6-1.5H17V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.3V10H8v3h2.4v8h3.1Z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M21.6 7.2a2.9 2.9 0 0 0-2-2.1C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.4A2.9 2.9 0 0 0 2.4 7.2 30.2 30.2 0 0 0 2 12a30.2 30.2 0 0 0 .4 4.8 2.9 2.9 0 0 0 2 2.1c1.8.4 7.6.4 7.6.4s5.8 0 7.6-.4a2.9 2.9 0 0 0 2-2.1A30.2 30.2 0 0 0 22 12a30.2 30.2 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@ponnomela392" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M15.7 4.5c.7 1.4 1.9 2.3 3.5 2.6v2.8c-1.4 0-2.6-.3-3.8-.9v5.8c0 2.3-1.8 4.1-4.1 4.1S6.9 17.7 6.9 15.4s1.8-4.1 4.1-4.1c.3 0 .5 0 .8.1v2.9a2.5 2.5 0 0 0-.8-.1 2 2 0 0 0 0 4 2 2 0 0 0 4-2V4.5h3.7Z" fill="currentColor"/>
                  </svg>
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noreferrer" className="footer-social-link" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.9 8.8A1.8 1.8 0 1 1 6.9 5a1.8 1.8 0 0 1 0 3.8ZM5.1 10.7h3.6v9.3H5.1v-9.3Zm5.8 0h3.4v1.3h.1c.5-.9 1.6-1.9 3.4-1.9 3.6 0 4.2 2.4 4.2 5.5v5.4h-3.6v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7v5.2H10.9v-9.3Z" fill="currentColor"/>
                  </svg>
                </a>
              </div>

              <div className="footer-apps" aria-label="Download our apps">
                <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" aria-label="Download on the App Store">
                  <img src="/uploads/app-store.svg" alt="App Store" />
                </a>
                <a href="https://play.google.com/store" target="_blank" rel="noreferrer" aria-label="Get it on Google Play">
                  <img src="/uploads/google-play.svg" alt="Google Play" />
                </a>
              </div>
            </div>
          </div>

          {/* Shop Section */}
          <nav className="footer-section" aria-label="Shop">
            <h3 className="footer-heading">Shop</h3>
            <ul className="footer-links">
              <li>
                <Link href="/shop">
                  All Products
                </Link>
              </li>
              {categories.length > 0 && (
                <>
                  {categories.slice(0, 3).map((cat) => (
                    <li key={cat.slug}>
                      <Link href={`/category/${cat.slug}`}>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </>
              )}
              <li>
                <Link href="/combos">
                  Combos
                </Link>
              </li>
              <li>
                <Link href="/flash-sale">
                  Flash Sale
                </Link>
              </li>
            </ul>
          </nav>

          {/* Help & Support Section */}
          <nav className="footer-section" aria-label="Help & Support">
            <h3 className="footer-heading">Help & Support</h3>
            <ul className="footer-links">
              <li>
                <Link href="/track-order">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/faq">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/account">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/wishlist">
                  Wishlist
                </Link>
              </li>
            </ul>
          </nav>

          {/* Company Section */}
          <nav className="footer-section" aria-label="Company">
            <h3 className="footer-heading">Company</h3>
            <ul className="footer-links">
              <li>
                <Link href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact Section */}
          <div className="footer-section footer-contact">
            <h3 className="footer-heading">Contact</h3>
            <ul className="footer-contact-list">
              <li>
                <a href={`tel:${contactPhone}`} className="footer-contact-link">
                  <span className="footer-contact-label">Phone</span>
                  <span className="footer-contact-value">{contactPhone}</span>
                </a>
              </li>
              {contactEmail && (
                <li>
                  <a href={`mailto:${contactEmail}`} className="footer-contact-link">
                    <span className="footer-contact-label">Email</span>
                    <span className="footer-contact-value">{contactEmail}</span>
                  </a>
                </li>
              )}
              <li className="footer-contact-static">
                <span className="footer-contact-label">Location</span>
                <span className="footer-contact-value">
                  Asim, Fulbaria<br />
                  Mymensingh, Bangladesh
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* =====================================================
            BOTTOM BAR
        ===================================================== */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © {year} {siteName}. All rights reserved.
            </p>

            <div className="footer-payment">
              <img src="/uploads/we-accept.png" alt="We accept secure payments" />
            </div>

            <nav className="footer-bottom-links" aria-label="Legal">
              <Link href="/privacy">
                Privacy
              </Link>
              <span className="footer-divider">•</span>
              <Link href="/terms">
                Terms
              </Link>
            </nav>
          </div>
        </div>

      </div>
    </footer>
  );
}
