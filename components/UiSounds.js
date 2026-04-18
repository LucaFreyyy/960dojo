'use client';

import { useEffect } from 'react';
import { playButtonClick } from '../lib/soundEffects';

const CLICKABLE_SELECTOR = [
  'button',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  '.btn',
  '.dropbtn',
  '[role="button"]',
  'a.btn',
  'a.practice-box',
  'a.time-box',
].join(',');

function isActivable(el) {
  if (!el || el.nodeType !== 1) return false;
  if (el.disabled === true) return false;
  if (el.getAttribute('aria-disabled') === 'true') return false;
  return true;
}

export default function UiSounds() {
  useEffect(() => {
    const onClick = (e) => {
      const t = e.target?.closest?.(CLICKABLE_SELECTOR);
      if (!t || !isActivable(t)) return;
      playButtonClick();
    };

    document.addEventListener('click', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  return null;
}
