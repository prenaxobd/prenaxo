'use client';

import { useEffect, useState } from 'react';

const FLASH_SALE_DURATION = 24 * 60 * 60 * 1000;
const FLASH_SALE_END_KEY = 'flashSaleEndTime';

export function createFlashSaleEndTime(now = Date.now()) {
  const endTime = now + FLASH_SALE_DURATION;
  window.localStorage.setItem(FLASH_SALE_END_KEY, String(endTime));
  return endTime;
}

export function getFlashSaleEndTime() {
  const storedValue = Number(window.localStorage.getItem(FLASH_SALE_END_KEY));

  if (Number.isFinite(storedValue) && storedValue > Date.now()) {
    return storedValue;
  }

  return createFlashSaleEndTime();
}

export function resetFlashSaleCycle() {
  window.localStorage.removeItem(FLASH_SALE_END_KEY);
  return createFlashSaleEndTime();
}

function getRemaining(endTime) {
  return Math.max(0, endTime - Date.now());
}

export default function FlashSaleCountdown() {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    let endTime = getFlashSaleEndTime();

    const update = () => {
      let nextRemaining = getRemaining(endTime);

      if (nextRemaining === 0) {
        endTime = resetFlashSaleCycle();
        nextRemaining = getRemaining(endTime);
      }

      setRemaining(nextRemaining);
    };

    update();
    const timer = window.setInterval(update, 1000);

    const handleStorage = (event) => {
      if (event.key !== FLASH_SALE_END_KEY) return;
      endTime = getFlashSaleEndTime();
      update();
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const safeRemaining = remaining ?? FLASH_SALE_DURATION;
  const hours = Math.floor((safeRemaining % 86400000) / 3600000);
  const minutes = Math.floor((safeRemaining % 3600000) / 60000);
  const seconds = Math.floor((safeRemaining % 60000) / 1000);

  return (
    <div className="flash-countdown" aria-label="Flash Sale countdown">
      <h2>Offer ends in</h2>
      <div className="flash-timer">
        <div><strong>{String(hours).padStart(2, '0')}</strong><span>Hours</span></div>
        <div><strong>{String(minutes).padStart(2, '0')}</strong><span>Minutes</span></div>
        <div><strong>{String(seconds).padStart(2, '0')}</strong><span>Seconds</span></div>
      </div>
    </div>
  );
}
