'use client';

import { useEffect } from 'react';
import { markIntroDone } from '@/lib/intro';

/** Mirrors the boot script's intro-finished signal into the JS intro flag. */
export function IntroClock() {
  useEffect(() => {
    const w = window as Window & { __introDone?: boolean };
    if (w.__introDone || !document.documentElement.classList.contains('intro-play')) {
      markIntroDone();
      return;
    }
    window.addEventListener('karalama:intro', markIntroDone, { once: true });
    return () => window.removeEventListener('karalama:intro', markIntroDone);
  }, []);
  return null;
}
