'use client';

import { createContext, useCallback, useContext, useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import { useIntroDone } from '@/lib/intro';
import { isGameRoute, useLowMotion } from './hooks';

type ScrollTarget = number | string | HTMLElement;

const ScrollCtx = createContext<{
  scrollTo: (target: ScrollTarget, opts?: { offset?: number; immediate?: boolean }) => void;
}>({
  scrollTo: () => {},
});

export const useSmoothScroll = () => useContext(ScrollCtx);

export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const lowMotion = useLowMotion();
  const introDone = useIntroDone();
  const lenisRef = useRef<Lenis | null>(null);
  const enabled = !lowMotion && !isGameRoute(pathname);

  useEffect(() => {
    if (!enabled) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
    });
    lenisRef.current = lenis;
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
      // Lenis may re-tag <html> from a pending internal timeout after destroy
      setTimeout(() => {
        if (lenisRef.current) return;
        const html = document.documentElement;
        html.className = html.className.replace(/\blenis(-\w+)?\b/g, '').replace(/\s+/g, ' ').trim();
      }, 600);
    };
  }, [enabled]);

  // Freeze scrolling while the preloader curtain is down
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (introDone) lenis.start();
    else if (document.documentElement.classList.contains('is-loading')) lenis.stop();
  }, [introDone, enabled]);

  // New route → start at the top without easing
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  const scrollTo = useCallback<
    (target: ScrollTarget, opts?: { offset?: number; immediate?: boolean }) => void
  >((target, opts) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset: opts?.offset ?? 0, immediate: opts?.immediate, duration: 1.4 });
      return;
    }
    const el =
      typeof target === 'string'
        ? document.querySelector<HTMLElement>(target)
        : typeof target === 'number'
          ? null
          : target;
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: opts?.immediate ? 'auto' : 'smooth' });
    } else if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY + (opts?.offset ?? 0);
      window.scrollTo({ top, behavior: opts?.immediate ? 'auto' : 'smooth' });
    }
  }, []);

  return <ScrollCtx.Provider value={{ scrollTo }}>{children}</ScrollCtx.Provider>;
}
