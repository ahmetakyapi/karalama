'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CURTAIN, EXPO, useLowMotion } from './hooks';
import { useSmoothScroll } from './SmoothScroll';
import { InkLoader } from '@/components/ui/InkLoader';

type Phase = 'idle' | 'cover' | 'covered' | 'reveal';

const COLUMNS = 5;

const TransitionCtx = createContext<{ navigate: (href: string) => void }>({
  navigate: () => {},
});

/** Router-like helper that plays the curtain before pushing. */
export const useTransitionRouter = () => useContext(TransitionCtx);

function labelFor(pathname: string) {
  if (pathname === '/') return 'Ana Sayfa';
  if (pathname === '/oda/olustur') return 'Oda Kuruluyor';
  if (pathname.startsWith('/oda/')) return 'Odaya Giriliyor';
  if (pathname.startsWith('/profil')) return 'Profilin';
  if (pathname.startsWith('/gizlilik')) return 'Gizlilik';
  if (pathname.startsWith('/kosullar')) return 'Koşullar';
  return 'Karalama';
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lowMotion = useLowMotion();
  const { scrollTo } = useSmoothScroll();

  const [phase, setPhase] = useState<Phase>('idle');
  const [label, setLabel] = useState('');
  const pendingHref = useRef<string | null>(null);
  const fromPath = useRef(pathname);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      const samePage =
        url.pathname === window.location.pathname && url.search === window.location.search;
      if (samePage) {
        if (url.hash) scrollTo(url.hash, { offset: -80 });
        else scrollTo(0);
        return;
      }
      const target = url.pathname + url.search + url.hash;
      if (lowMotion || phaseRef.current !== 'idle') {
        router.push(target);
        return;
      }
      pendingHref.current = target;
      fromPath.current = window.location.pathname;
      setLabel(labelFor(url.pathname));
      setPhase('cover');
      router.prefetch(target);
    },
    [lowMotion, router, scrollTo]
  );

  // Curtain fully down → actually navigate
  const onCovered = useCallback(() => {
    if (phaseRef.current !== 'cover') return;
    setPhase('covered');
    const href = pendingHref.current;
    pendingHref.current = null;
    if (href) router.push(href);
  }, [router]);

  // Route committed → lift the curtain
  useEffect(() => {
    if (phase !== 'covered') return;
    if (pathname !== fromPath.current) {
      const t = setTimeout(() => setPhase('reveal'), 180);
      return () => clearTimeout(t);
    }
    // Safety net: never leave the user stuck behind the curtain
    const t = setTimeout(() => setPhase('reveal'), 4000);
    return () => clearTimeout(t);
  }, [phase, pathname]);

  // Intercept plain internal <a> clicks so every link gets the transition
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement | null)?.closest?.('a');
      if (!a || !a.href) return;
      if (a.target && a.target !== '_self') return;
      if (a.hasAttribute('download') || a.dataset.noTransition !== undefined) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      navigate(url.pathname + url.search + url.hash);
    };
    window.addEventListener('click', onClick, true);
    return () => window.removeEventListener('click', onClick, true);
  }, [navigate]);

  const covering = phase === 'cover' || phase === 'covered';
  const active = phase !== 'idle';

  return (
    <TransitionCtx.Provider value={{ navigate }}>
      {children}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[150] flex"
        style={{ pointerEvents: active ? 'auto' : 'none', visibility: active ? 'visible' : 'hidden' }}
      >
        {Array.from({ length: COLUMNS }).map((_, i) => {
          const last = i === COLUMNS - 1;
          return (
            <motion.div
              key={i}
              className="relative h-full flex-1 bg-[#070a12]"
              style={{ transformOrigin: covering ? '50% 100%' : '50% 0%', marginLeft: i ? -1 : 0 }}
              initial={false}
              animate={{ scaleY: covering ? 1 : 0 }}
              transition={{
                duration: phase === 'reveal' ? 0.75 : 0.6,
                ease: CURTAIN,
                delay: i * 0.055,
              }}
              onAnimationComplete={() => {
                if (!last) return;
                if (phase === 'cover') onCovered();
                if (phase === 'reveal') setPhase('idle');
              }}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-indigo-500/0 via-cyan-300/40 to-emerald-400/0" />
            </motion.div>
          );
        })}

        {/* Destination label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="overflow-hidden px-4 pb-[0.12em]">
            <motion.div
              initial={false}
              animate={{ y: covering ? '0%' : phase === 'reveal' ? '-110%' : '110%' }}
              transition={{ duration: 0.8, ease: EXPO, delay: covering ? 0.5 : 0 }}
              className="font-display text-[13vw] sm:text-[9vw] font-extrabold leading-[0.9] tracking-[-0.05em] text-slate-50"
            >
              {label}
              <span className="text-[var(--marker)]">.</span>
            </motion.div>
          </div>
          <motion.svg
            viewBox="0 0 300 24"
            className="mt-3 w-[42vw] max-w-[420px]"
            fill="none"
            initial={false}
            animate={{ opacity: covering ? 1 : 0 }}
            transition={{ duration: 0.3, delay: covering ? 0.6 : 0 }}
          >
            <motion.path
              d="M4 14 C 40 2, 70 22, 104 12 S 170 2, 200 14 S 262 22, 296 8"
              stroke="url(#pt-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: covering ? 1 : 0 }}
              transition={{ duration: 0.9, ease: EXPO, delay: covering ? 0.6 : 0 }}
            />
            <defs>
              <linearGradient id="pt-grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6366f1" />
                <stop offset="0.5" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#c8f560" />
              </linearGradient>
            </defs>
          </motion.svg>
          <motion.div
            initial={false}
            animate={{ opacity: phase === 'covered' ? 1 : 0 }}
            transition={{ duration: 0.3, delay: phase === 'covered' ? 0.5 : 0 }}
            className="mt-4"
          >
            {phase === 'covered' && <InkLoader label="yükleniyor" gradientId="dd-grad-transition" />}
          </motion.div>
        </div>
      </div>
    </TransitionCtx.Provider>
  );
}
