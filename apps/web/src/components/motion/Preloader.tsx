'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { markIntroDone } from '@/lib/intro';
import { CURTAIN, EXPO } from './hooks';

const COLUMNS = 5;
const DURATION = 2000;
const WORD = 'Karalama';
const STATUS = [
  'Kalemler açılıyor',
  'Kelimeler karıştırılıyor',
  'Renkler hazırlanıyor',
  'Tuval gerildi',
];

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * First-visit intro: a counter races to 100 while a scribble draws itself,
 * then five ink columns lift away to reveal the hero.
 * Skipped (via the <head> boot script) on repeat visits, deep links and reduced motion.
 */
export function Preloader() {
  const [mounted, setMounted] = useState(true);
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (html.classList.contains('intro-seen')) {
      setMounted(false);
      markIntroDone();
      return;
    }
    html.classList.add('is-loading');

    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;
    const start = performance.now();
    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    let fontsDone = false;
    fontsReady.then(() => {
      fontsDone = true;
    });

    const tick = (t: number) => {
      const p = Math.min((t - start) / DURATION, 1);
      // Hold at 96 until webfonts are in, so the hero never reveals in fallback type
      const capped = fontsDone ? p : Math.min(p, 0.96);
      setCount(Math.round(easeInOut(capped) * 100));
      if (capped < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        exitTimer = setTimeout(() => setExiting(true), 220);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (exitTimer) clearTimeout(exitTimer);
    };
  }, []);

  useEffect(() => {
    if (!exiting) return;
    const t = setTimeout(markIntroDone, 380);
    return () => clearTimeout(t);
  }, [exiting]);

  const finish = () => {
    const html = document.documentElement;
    html.classList.remove('is-loading');
    html.classList.add('intro-seen');
    try {
      sessionStorage.setItem('karalama_intro', '1');
    } catch {
      /* private mode */
    }
    setMounted(false);
  };

  if (!mounted) return null;

  const status = STATUS[Math.min(Math.floor(count / 26), STATUS.length - 1)];

  return (
    <div className="preloader fixed inset-0 z-[200] flex" role="status" aria-label="Karalama yükleniyor">
      {Array.from({ length: COLUMNS }).map((_, i) => (
        <motion.div
          key={i}
          className="h-full flex-1 bg-[#05070d]"
          style={{ transformOrigin: '50% 0%', marginLeft: i ? -1 : 0 }}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: exiting ? 0 : 1 }}
          transition={{ duration: 0.95, ease: CURTAIN, delay: exiting ? 0.18 + i * 0.07 : 0 }}
          onAnimationComplete={() => {
            if (exiting && i === COLUMNS - 1) finish();
          }}
        />
      ))}

      <motion.div
        className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-8"
        animate={exiting ? { opacity: 0, y: -60 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: CURTAIN }}
      >
        {/* Top meta row */}
        <div className="flex items-start justify-between font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-slate-500">
          <span>Karalama ®</span>
          <span className="hidden sm:block">Çiz — Tahmin Et — Eğlen</span>
          <span>{new Date().getFullYear()}</span>
        </div>

        {/* Center wordmark + scribble */}
        <div className="flex flex-col items-center">
          <div aria-hidden="true" className="flex overflow-hidden font-display text-[17vw] sm:text-[11vw] font-extrabold leading-[0.95] tracking-[-0.055em] text-slate-50">
            {WORD.split('').map((ch, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ y: '105%', rotate: 8 }}
                animate={{ y: '0%', rotate: 0 }}
                transition={{ duration: 1, ease: EXPO, delay: 0.15 + i * 0.05 }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <svg viewBox="0 0 400 40" className="-mt-1 w-[70vw] sm:w-[44vw] max-w-[640px]" fill="none">
            <path
              d="M6 24 C 40 6, 72 36, 110 20 S 170 4, 205 22 S 268 38, 300 18 S 360 6, 394 22"
              stroke="url(#pre-grad)"
              strokeWidth="5"
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset={1 - count / 100}
            />
            <defs>
              <linearGradient id="pre-grad" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#6366f1" />
                <stop offset="0.45" stopColor="#22d3ee" />
                <stop offset="0.8" stopColor="#10b981" />
                <stop offset="1" stopColor="#c8f560" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Bottom: giant counter + status */}
        <div className="flex items-end justify-between gap-6">
          <div className="font-display text-[26vw] sm:text-[15vw] font-extrabold leading-[0.78] tracking-[-0.06em] text-slate-50 tabular-nums">
            {count}
            <span className="text-[var(--marker)]">%</span>
          </div>
          <div className="mb-2 max-w-[40vw] text-right">
            <div className="font-hand text-2xl sm:text-3xl text-slate-300">{status}…</div>
            <div className="mt-3 ml-auto h-px w-32 sm:w-48 overflow-hidden bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-[#c8f560]"
                style={{ width: `${count}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
