'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ScrollWords } from '@/components/motion/primitives';
import { EXPO } from '@/components/motion/hooks';
import { Counter } from './common';

const STATS = [
  { value: 1070, suffix: '+', label: 'Türkçe Kelime', tally: 5 },
  { value: 18, suffix: '', label: 'Kategori', tally: 3 },
  { value: 12, suffix: '', label: 'Oda Başına Oyuncu', tally: 2 },
  { value: 0, suffix: ' ₺', label: 'Üyelik Ücreti', tally: 0 },
];

/** Pencil tally marks (çetele): groups of four strokes crossed by a fifth. */
function Tally({ marks, play }: { marks: number; play: boolean }) {
  if (!marks) {
    return (
      <svg viewBox="0 0 60 30" className="h-7 w-14" fill="none" aria-hidden="true">
        <motion.path
          d="M6 15 C 18 4, 40 4, 52 15 C 40 26, 18 26, 6 15 Z"
          stroke="#1f2430"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: play ? 1 : 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut', delay: 0.3 }}
        />
      </svg>
    );
  }
  const strokes: { d: string; i: number }[] = [];
  let i = 0;
  for (let m = 0; m < marks; m++) {
    const group = Math.floor(m / 5);
    const pos = m % 5;
    const gx = group * 34;
    const d = pos < 4 ? `M${gx + 4 + pos * 6} 4 L${gx + 3 + pos * 6} 26` : `M${gx} 22 L${gx + 26} 8`;
    strokes.push({ d, i: i++ });
  }
  const width = Math.ceil(marks / 5) * 34;
  return (
    <svg viewBox={`-2 0 ${width + 4} 30`} className="h-7" style={{ width: (width + 4) * 1.2 }} fill="none" aria-hidden="true">
      {strokes.map((s) => (
        <motion.path
          key={s.i}
          d={s.d}
          stroke="#1f2430"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: play ? 1 : 0 }}
          transition={{ duration: 0.18, ease: 'easeOut', delay: 0.3 + s.i * 0.12 }}
        />
      ))}
    </svg>
  );
}

function Tape({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-7 w-28 bg-[#f8f4e3]/70 shadow-[0_1px_2px_rgba(0,0,0,0.15)] ${className}`}
      style={{ clipPath: 'polygon(3% 0, 97% 6%, 100% 92%, 2% 100%)' }}
    />
  );
}

/**
 * Our story on a sheet of ruled notebook paper — a deliberately light,
 * tactile moment in an otherwise dark page.
 */
export function Manifesto() {
  const statsRef = useRef<HTMLDListElement>(null);
  const play = useInView(statsRef, { once: true, margin: '-10% 0px' });

  return (
    <section aria-labelledby="hikaye-title" className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 60, rotate: -3 }}
        whileInView={{ opacity: 1, y: 0, rotate: -1 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.1, ease: EXPO }}
        className="relative rounded-[6px] bg-[#f3eee3] px-6 pb-10 pt-12 text-[#1f2430] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] sm:px-14 sm:pb-14 sm:pt-16"
        style={{
          backgroundImage:
            'linear-gradient(90deg, transparent 0, transparent 46px, rgba(225,80,80,0.45) 46px, rgba(225,80,80,0.45) 48px, transparent 48px),' +
            'repeating-linear-gradient(180deg, transparent 0, transparent 39px, rgba(70,110,170,0.18) 39px, rgba(70,110,170,0.18) 40px)',
        }}
      >
        <Tape className="-top-3 left-10 -rotate-6" />
        <Tape className="-top-3 right-12 rotate-3" />

        <h2 id="hikaye-title" className="mb-6 pl-6 font-hand text-3xl font-bold text-[#e04a4a] sm:pl-8 sm:text-4xl">
          Bizim Hikâyemiz
        </h2>

        <ScrollWords
          text="Bir kalem, birkaç arkadaş ve binlerce kelime. Karalama, kimsenin düzgün çizemediği o zürafayı herkesin aynı anda bildiği an için var. Yetenek gerekmez; biraz cesaret yeter."
          highlight={['kalem', 'zürafayı', 'cesaret']}
          className="pl-6 font-display text-[28px] font-bold leading-[1.18] tracking-[-0.03em] sm:pl-8 sm:text-5xl lg:text-[56px]"
          highlightClassName="bg-[linear-gradient(transparent_55%,rgba(200,245,96,0.9)_55%,rgba(200,245,96,0.9)_92%,transparent_92%)] px-1 -mx-1"
        />

        <dl ref={statsRef} className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 pl-6 sm:pl-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-col gap-2">
              <dt className="order-3 font-hand text-xl text-[#4a5060]">{s.label}</dt>
              <dd className="order-1 font-display text-4xl font-extrabold tabular-nums tracking-[-0.05em] sm:text-5xl">
                {s.value === 0 ? '0' : <Counter to={s.value} />}
                <span className="text-[#e04a4a]">{s.suffix}</span>
                <span className="mt-2 block">
                  <Tally marks={s.tally} play={play} />
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </section>
  );
}
