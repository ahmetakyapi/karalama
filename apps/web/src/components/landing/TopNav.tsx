'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EXPO, CURTAIN } from '@/components/motion/hooks';
import { Magnetic, RollText } from '@/components/motion/primitives';
import { useSmoothScroll } from '@/components/motion/SmoothScroll';

const LINKS = [
  { href: '#nasil', label: 'Nasıl Oynanır', n: '01' },
  { href: '#ozellikler', label: 'Özellikler', n: '02' },
  { href: '#topluluk', label: 'SSS', n: '03' },
  { href: '/profil', label: 'Profil', n: '04' },
];

export function Logo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="relative rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px] transition-transform duration-500 ease-expo group-hover:rotate-[-8deg] group-hover:scale-110"
      style={{ width: size, height: size }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#04070d]">
        <svg aria-hidden="true" className="h-1/2 w-1/2" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 18c4-8 12-10 16-4M7 13c3-5 8-6 11-3"
            stroke="url(#logoGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
           
          />
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="24" y2="24">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset="0.5" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export function TopNav() {
  const { scrollY } = useScroll();
  const { scrollTo } = useSmoothScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    setHidden(y > 320 && y > prev && !open);
  });

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  const play = () => {
    setOpen(false);
    scrollTo('#oyna', { offset: -40 });
    setTimeout(() => document.getElementById('player-name-input')?.focus({ preventScroll: true }), 900);
  };

  return (
    <>
      <motion.nav
        aria-label="Ana gezinme"
        initial={false}
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.8, ease: EXPO }}
        className={cn('fixed left-0 right-0 top-0 z-[70] transition-[padding] duration-500', scrolled ? 'py-3' : 'py-5')}
      >
        <div className="intro-drop mx-auto max-w-7xl px-4 sm:px-6" style={{ ['--d' as string]: '0.5s' }}>
          <div
            className={cn(
              'flex items-center justify-between rounded-2xl px-3 py-2 sm:px-4 transition-all duration-500',
              scrolled || open
                ? 'border border-white/[0.07] bg-[#070b14]/75 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl'
                : 'border border-transparent bg-transparent'
            )}
          >
            <a href="/" className="group flex items-center gap-2.5" aria-label="Karalama ana sayfa">
              <Logo />
              <span className="font-display text-lg font-bold tracking-[-0.03em] text-slate-100">Karalama</span>
              <span className="hidden items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 sm:inline-flex">
                <span className="h-1 w-1 animate-pulse rounded-full bg-emerald-400" />
                Canlı
              </span>
            </a>

            <div className="hidden items-center gap-1 md:flex">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="roll-host rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:text-slate-50"
                >
                  <RollText text={l.label} />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Magnetic strength={0.25}>
                <button
                  onClick={play}
                  data-cursor="Oyna"
                  className="roll-host relative overflow-hidden rounded-xl bg-[var(--marker)] px-4 py-2 text-xs font-bold text-[#04070d] shadow-[0_6px_24px_rgba(200,245,96,0.25)] transition-shadow hover:shadow-[0_8px_32px_rgba(200,245,96,0.45)]"
                >
                  <RollText text="Hemen Oyna" />
                </button>
              </Magnetic>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] md:hidden"
              >
                <motion.span
                  className="absolute h-[1.5px] w-4 rounded bg-slate-100"
                  animate={open ? { rotate: 45, y: 0 } : { rotate: 0, y: -3 }}
                  transition={{ duration: 0.4, ease: EXPO }}
                />
                <motion.span
                  className="absolute h-[1.5px] w-4 rounded bg-slate-100"
                  animate={open ? { rotate: -45, y: 0 } : { rotate: 0, y: 3 }}
                  transition={{ duration: 0.4, ease: EXPO }}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menü"
            className="fixed inset-0 z-[65] flex flex-col justify-between bg-[#060912] px-6 pb-10 pt-28 md:hidden"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)', transition: { duration: 0.6, ease: CURTAIN, delay: 0.1 } }}
            transition={{ duration: 0.8, ease: CURTAIN }}
          >
            <ul className="space-y-2">
              {LINKS.map((l, i) => (
                <li key={l.href} className="overflow-hidden">
                  <motion.a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ y: '110%' }}
                    animate={{ y: '0%' }}
                    exit={{ y: '110%', transition: { duration: 0.3, ease: CURTAIN } }}
                    transition={{ duration: 0.7, ease: EXPO, delay: 0.15 + i * 0.06 }}
                    className="flex items-baseline gap-4 py-1 font-display text-5xl font-extrabold tracking-[-0.04em] text-slate-50"
                  >
                    <span className="font-mono text-xs font-normal tracking-normal text-[var(--marker)]">{l.n}</span>
                    {l.label}
                  </motion.a>
                </li>
              ))}
            </ul>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: 0.6, ease: EXPO, delay: 0.45 }}
              className="space-y-6"
            >
              <button
                onClick={play}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--marker)] text-base font-bold text-[#04070d]"
              >
                Hemen Oyna →
              </button>
              <p className="font-hand text-2xl text-slate-400">Kalemini kap, gel. ✎</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
