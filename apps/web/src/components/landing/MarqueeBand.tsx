'use client';

import { VelocityMarquee } from '@/components/motion/primitives';

const BIG = ['Çiz', 'Tahmin Et', 'Kazan', 'Gül', 'Tekrarla'];
const SMALL = [
  { emoji: '🎨', label: 'Gerçek Zamanlı Çizim' },
  { emoji: '🇹🇷', label: '1.070+ Türkçe Kelime' },
  { emoji: '⚡', label: 'Anında Bağlan' },
  { emoji: '📱', label: 'Her Cihazda' },
  { emoji: '🤖', label: 'Bot Desteği' },
  { emoji: '🏆', label: 'Puan Tablosu' },
  { emoji: '💬', label: 'Canlı Sohbet' },
  { emoji: '🚀', label: 'Üyelik Gerekmez' },
];

/** Two crossed "tapes" whose speed and skew follow scroll velocity. */
export function MarqueeBand() {
  return (
    <section aria-label="Öne çıkanlar" className="relative z-10 overflow-hidden py-16 sm:py-24">
      <div className="relative -ml-[5%] w-[110%] -rotate-[3deg] bg-[var(--marker)] py-4 sm:py-5 shadow-[0_20px_60px_-20px_rgba(200,245,96,0.45)]">
        <VelocityMarquee baseVelocity={-2.2}>
          {BIG.map((w) => (
            <span key={w} className="flex items-center">
              <span className="px-6 font-display text-5xl sm:text-7xl font-extrabold tracking-[-0.045em] text-[#04070d]">
                {w}
              </span>
              <svg viewBox="0 0 24 24" className="h-8 w-8 sm:h-10 sm:w-10 text-[#04070d]" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 0c.6 5.9 6.1 11.4 12 12-5.9.6-11.4 6.1-12 12-.6-5.9-6.1-11.4-12-12C5.9 11.4 11.4 5.9 12 0z"
                />
              </svg>
            </span>
          ))}
        </VelocityMarquee>
      </div>
      <div className="relative -ml-[5%] -mt-3 w-[110%] rotate-[2deg] border-y border-white/10 bg-[#070b14] py-4">
        <VelocityMarquee baseVelocity={1.6}>
          {SMALL.map((it) => (
            <span key={it.label} className="flex items-center gap-3 px-6">
              <span className="text-xl">{it.emoji}</span>
              <span className="font-mono text-xs sm:text-sm uppercase tracking-[0.22em] text-slate-300">{it.label}</span>
              <span className="pl-3 text-[var(--marker)]">✦</span>
            </span>
          ))}
        </VelocityMarquee>
      </div>
    </section>
  );
}
