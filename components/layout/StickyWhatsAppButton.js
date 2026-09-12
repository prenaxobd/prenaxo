'use client';

/**
 * Sticky WhatsApp Contact Button
 * 
 * Displays a floating WhatsApp contact button on the right side of the screen.
 * Positioned above the mobile bottom navigation on mobile devices.
 * Opens WhatsApp with international format number: 8801608069154
 */

export default function StickyWhatsAppButton() {
  const whatsappNumber = '8801608069154';
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="sticky-whatsapp-button"
      aria-label="Chat with us on WhatsApp"
      title="WhatsApp"
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
  );
}
