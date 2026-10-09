'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Magnetic } from '@/components/motion/primitives';
import { useSmoothScroll } from '@/components/motion/SmoothScroll';

export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  const { scrollTo } = useSmoothScroll();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 0.5], ['-18%', '0%']);
  const x2 = useTransform(scrollYProgress, [0, 0.5], ['18%', '0%']);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.82, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-30, 60]);

  const play = () => {
    scrollTo('#oyna', { offset: -40 });
    setTimeout(() => document.getElementById('player-name-input')?.focus({ preventScroll: true }), 1100);
  };

  return (
    <section
      ref={ref}
      aria-labelledby="cta-title"
      className="relative z-10 overflow-hidden px-5 py-28 sm:py-44"
    >
      <motion.div style={{ scale }} className="relative mx-auto max-w-7xl text-center">
        <h2
          id="cta-title"
          className="font-display text-[15vw] lg:text-[190px] font-extrabold leading-[0.82] tracking-[-0.065em] text-slate-50"
        >
          <motion.span style={{ x: x1 }} className="block">
            Hadi<span className="font-hand font-bold text-[var(--marker)] tracking-normal">,</span>
          </motion.span>
          <motion.span style={{ x: x2 }} className="block text-gradient pb-[0.16em] -mb-[0.12em]">
            Oynayalım!
          </motion.span>
        </h2>

        {/* Hand-drawn arrow pointing at the button */}
        <svg
          viewBox="0 0 160 120"
          className="pointer-events-none absolute left-[8%] top-[58%] hidden w-40 text-slate-400 md:block"
          fill="none"
          aria-hidden="true"
        >
          <motion.path
            d="M8 12 C 40 4, 90 18, 110 60 S 128 100, 146 104"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
          <motion.path
            d="M132 92 L148 105 L130 112"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 1.4 }}
          />
        </svg>
        <p className="pointer-events-none absolute left-[3%] top-[50%] hidden -rotate-6 font-hand text-2xl text-slate-400 md:block">
          bir tık uzağında!
        </p>

        <div className="mt-14 flex flex-col items-center gap-8">
          <Magnetic strength={0.4}>
            <button
              onClick={play}
              data-cursor="Başla"
              aria-label="Şimdi Oyna"
              className="group relative flex h-40 w-40 sm:h-48 sm:w-48 items-center justify-center rounded-full"
            >
              <motion.svg style={{ rotate }} viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <defs>
                  <path id="cta-ring" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
                </defs>
                <text className="fill-slate-400 font-mono text-[13px] uppercase tracking-[0.34em]">
                  <textPath href="#cta-ring">şimdi oyna • ücretsiz • üyelik yok • </textPath>
                </text>
              </motion.svg>
              <span className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-[var(--marker)] text-[#04070d] shadow-[0_0_60px_rgba(200,245,96,0.35)] transition-transform duration-700 ease-expo group-hover:scale-110">
                <svg className="h-8 w-8 transition-transform duration-700 ease-expo group-hover:-rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </Magnetic>
          <p className="max-w-md text-base leading-relaxed text-slate-400">
            Arkadaşlarını topla, bir oda kur ve eğlence başlasın. Tek ihtiyacın bir tarayıcı.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
