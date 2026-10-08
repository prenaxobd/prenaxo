'use client';

import Link from 'next/link';
import { ArrowRight, UserRound, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import OptimizedImage from '@/components/OptimizedImage';

const AccountRequiredContext = createContext(null);

export function AccountRequiredProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [nextPath, setNextPath] = useState('/account');

  const showAccountRequired = useCallback(() => {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    setNextPath(currentPath);
    setIsOpen(true);
  }, []);

  const requireAccount = useCallback(async () => {
    const response = await fetch('/api/auth/me', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Could not verify your account. Please try again.');
    }

    const data = await response.json();
    if (data?.user) return true;

    showAccountRequired();
    return false;
  }, [showAccountRequired]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <AccountRequiredContext.Provider value={{ requireAccount, showAccountRequired }}>
      {children}
      {isOpen && (
        <div
          className="account-required-backdrop"
          onClick={() => setIsOpen(false)}
        >
          <section
            className="account-required-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-required-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="account-required-close"
              aria-label="Close"
              onClick={() => setIsOpen(false)}
            >
              <X size={19} />
            </button>
            <div className="account-required-brand-icons" aria-hidden="true">
              <span className="account-required-icon">
                <UserRound size={24} strokeWidth={2.2} />
              </span>
              <span className="account-required-brand-connector">
                <ArrowRight size={18} strokeWidth={2.4} />
              </span>
              <span className="account-required-icon account-required-logo">
                <OptimizedImage
                  src="/uploads/site_icon.png"
                  alt=""
                  width={40}
                  height={40}
                />
              </span>
            </div>
            <h2 id="account-required-title">One quick step before you proceed</h2>
            <p>
              To complete your purchase or save items for later, please log in or create a free account.
            </p>
            <div className="account-required-actions">
              <Link
                className="account-required-register"
                href={`/register?next=${encodeURIComponent(nextPath)}`}
              >
                Create an Account
              </Link>
              <Link
                className="account-required-login"
                href={`/login?next=${encodeURIComponent(nextPath)}`}
              >
                Already have an account? <strong>Log In</strong>
              </Link>
            </div>
          </section>
        </div>
      )}
    </AccountRequiredContext.Provider>
  );
}

export function useAccountRequired() {
  const context = useContext(AccountRequiredContext);
  if (!context) {
    throw new Error('useAccountRequired must be used within AccountRequiredProvider.');
  }
  return context;
}
