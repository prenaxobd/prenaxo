'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Headset, Phone, X } from 'lucide-react';

import { helpCenterConfig } from '@/lib/help-center';

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M19.11 17.2c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.34-.79-.7-1.33-1.56-1.49-1.83-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.55.58.65.21 1.24.18 1.7.11.52-.08 1.6-.65 1.82-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
      />
      <path
        fill="currentColor"
        d="M16.02 3C8.84 3 3 8.84 3 16.02c0 2.29.6 4.44 1.65 6.3L3 29l6.86-1.8a12.96 12.96 0 0 0 6.16 1.56h.01C23.2 28.76 29 22.92 29 16.02 29 8.84 23.2 3 16.02 3zm0 23.55h-.01a10.8 10.8 0 0 1-5.5-1.5l-.39-.23-4.07 1.07 1.09-3.97-.25-.41a10.75 10.75 0 1 1 9.13 5.04z"
      />
    </svg>
  );
}

function MessengerIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="#ffffff"
        d="M16 2.5C8.54 2.5 2.5 7.95 2.5 14.68c0 3.48 1.7 6.6 4.42 8.7v4.1c0 .7.8 1.1 1.37.7l4.43-3.12c1.04.27 2.14.4 3.28.4 7.46 0 13.5-5.45 13.5-12.18S23.46 2.5 16 2.5Z"
      />
      <path fill="#1877f2" d="m10.13 17.2 4.04-6.42a1.25 1.25 0 0 1 1.78-.36l2.08 1.4 3.84-2.7c.43-.3.95.2.67.64l-4.03 6.42a1.25 1.25 0 0 1-1.78.36l-2.08-1.4-3.84 2.7c-.43.3-.96-.2-.68-.64Z" />
    </svg>
  );
}

export default function HelpCenterButton() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappUrl = `https://wa.me/${helpCenterConfig.whatsapp.phone}?text=${encodeURIComponent(
    helpCenterConfig.whatsapp.message,
  )}`;

  useEffect(() => {
    if (!isOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = '0px';
    document.body.classList.add('help-center-open');

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.classList.remove('help-center-open');
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="help-center-fab"
        aria-label="Open Prenaxo Help Center"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="Help Center"
        onClick={() => setIsOpen(true)}
      >
        <span className="help-center-fab-icon" aria-hidden="true">
          <Headset size={23} strokeWidth={2.2} />
        </span>
      </button>

      {isOpen && (
        <div
          className="help-center-modal-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="help-center-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-center-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="help-center-header">
              <div>
                <h2 id="help-center-title">কীভাবে সাহায্য করতে পারি?</h2>
                <p>WhatsApp, Messenger অথবা ফোনে কথা বলুন</p>
              </div>

              <button
                type="button"
                className="help-center-close"
                aria-label="Close Help Center"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            <div className="help-center-contact-list">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="help-center-contact-item"
                aria-label="Open WhatsApp support"
              >
                <span className="help-center-contact-icon help-center-whatsapp-icon">
                  <WhatsAppIcon />
                </span>

                <span className="help-center-contact-copy">
                  <span className="help-center-contact-title">হোয়াটসঅ্যাপে মেসেজ</span>
                  <span className="help-center-contact-subtitle">সবচেয়ে সহজ উপায়</span>
                </span>

                <span className="help-center-contact-arrow" aria-hidden="true">
                  <ArrowRight size={18} strokeWidth={2.4} />
                </span>
              </a>

              <a
                href={helpCenterConfig.messenger.url}
                target="_blank"
                rel="noopener noreferrer"
                className="help-center-contact-item"
                aria-label="Open Messenger support"
              >
                <span className="help-center-contact-icon help-center-messenger-icon">
                  <MessengerIcon />
                </span>

                <span className="help-center-contact-copy">
                  <span className="help-center-contact-title">মেসেঞ্জারে চ্যাট</span>
                  <span className="help-center-contact-subtitle">ফেসবুক পেজে কথা বলুন</span>
                </span>

                <span className="help-center-contact-arrow" aria-hidden="true">
                  <ArrowRight size={18} strokeWidth={2.4} />
                </span>
              </a>

              <a
                href={helpCenterConfig.phone.tel}
                className="help-center-contact-item"
                aria-label="Call Prenaxo support"
              >
                <span className="help-center-contact-icon help-center-phone-icon">
                  <Phone size={18} strokeWidth={2.4} />
                </span>

                <span className="help-center-contact-copy">
                  <span className="help-center-contact-title">ফোন করুন</span>
                  <span className="help-center-contact-subtitle">{helpCenterConfig.phone.number}</span>
                </span>

                <span className="help-center-contact-arrow" aria-hidden="true">
                  <ArrowRight size={18} strokeWidth={2.4} />
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
