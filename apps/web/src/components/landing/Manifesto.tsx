'use client';

import { motion } from 'framer-motion';
import { ScrollWords } from '@/components/motion/primitives';
import { EXPO } from '@/components/motion/hooks';
import { Counter } from './common';

const STATS = [
  { value: 1070, suffix: '+', label: 'Türkçe kelime' },
  { value: 18, suffix: '', label: 'Kategori' },
  { value: 12, suffix: '', label: 'Oyuncu / oda' },
  { value: 0, suffix: '₺', label: 'Ücret, sonsuza dek' },
];

export function Manifesto() {
  return (
    <section aria-label="Manifesto" className="relative z-10 mx-auto max-w-6xl px-5 sm:px-6 py-24 sm:py-36">
      <div className="mb-10 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
        <span className="text-[var(--marker)]">(00)</span>
        <span className="h-px w-10 bg-slate-600" />
        <span>Manifesto</span>
      </div>

      <ScrollWords
        text="Bir kalem, birkaç arkadaş ve binlerce kelime. Karalama; kimsenin düzgün çizemediği o zürafayı herkesin aynı anda bildiği an için var. Yetenek gerekmez, sadece biraz cesaret."
        highlight={['kalem', 'zürafayı', 'cesaret']}
        className="font-display text-[32px] sm:text-5xl lg:text-[64px] font-bold leading-[1.08] tracking-[-0.035em] text-slate-50"
      />

      <motion.dl
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10% 0px' }}
        className="mt-20 grid grid-cols-2 border-t border-white/10 md:grid-cols-4"
      >
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 1, ease: EXPO, delay: i * 0.08 } },
            }}
            className="group relative flex flex-col-reverse border-b border-white/10 px-4 py-8 even:border-l md:border-b-0 md:px-6 md:[&:not(:first-child)]:border-l"
          >
            <dt className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">{s.label}</dt>
            <dd className="font-display text-5xl sm:text-6xl font-extrabold tabular-nums tracking-[-0.05em] text-slate-50 transition-colors duration-500 group-hover:text-[var(--marker)]">
              {s.value === 0 ? '0' : <Counter to={s.value} />}
              <span className="text-slate-500 group-hover:text-[var(--marker)]">{s.suffix}</span>
            </dd>
          </motion.div>
        ))}
      </motion.dl>
    </section>
  );
}
