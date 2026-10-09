'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { RollText } from '@/components/motion/primitives';
import { EXPO } from '@/components/motion/hooks';
import { useSmoothScroll } from '@/components/motion/SmoothScroll';

const COLS = [
  {
    title: 'Oyun',
    links: [
      { href: '#nasil', label: 'Nasıl Oynanır' },
      { href: '#ozellikler', label: 'Özellikler' },
      { href: '#topluluk', label: 'SSS' },
    ],
  },
  { title: 'Sen', links: [{ href: '/profil', label: 'Profil & Rozetler' }] },
  {
    title: 'Yasal',
    links: [
      { href: '/gizlilik', label: 'Gizlilik' },
      { href: '/kosullar', label: 'Koşullar' },
    ],
  },
];

const WORD = 'Karalama';

export function SiteFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -5% 0px' });
  const { scrollTo } = useSmoothScroll();

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/[0.07] pt-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="max-w-xs font-display text-3xl font-bold leading-tight tracking-[-0.03em] text-slate-100">
            Arkadaşlarınla eğlencenin <span className="font-hand text-4xl font-bold text-[var(--marker)]">adresi.</span>
          </p>
          <button
            type="button"
            onClick={() => scrollTo(0)}
            className="roll-host mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:border-white/25 hover:text-white"
          >
            <span aria-hidden="true">↑</span>
            <RollText text="Başa dön" />
          </button>
        </div>
        {COLS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500">{c.title}</h3>
            <ul className="space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="roll-host text-sm font-medium text-slate-300 transition-colors hover:text-white">
                    <RollText text={l.label} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div ref={ref} className="relative mt-16 select-none px-2 sm:px-4">
        <div aria-hidden="true" className="flex justify-center overflow-hidden font-display text-[20.5vw] font-extrabold leading-[0.8] tracking-[-0.07em] text-outline">
          {WORD.split('').map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.04em]">
              <motion.span
                className="inline-block"
                initial={{ y: '100%' }}
                animate={inView ? { y: '0%' } : undefined}
                transition={{ duration: 1.1, ease: EXPO, delay: i * 0.05 }}
              >
                <span className="wordmark-letter">{ch}</span>
              </motion.span>
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 border-t border-white/[0.06] px-5 py-6 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-600 sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} Karalama</span>
        <span>Türkiye&apos;de sevgiyle karalandı ✎</span>
      </div>
    </footer>
  );
}
