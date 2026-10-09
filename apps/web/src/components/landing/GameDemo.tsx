'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ComponentType } from 'react';
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { cn } from '@/lib/utils';
import { SectionHeading, WhenVisible } from '@/components/motion/primitives';
import { EXPO, useMediaQuery } from '@/components/motion/hooks';
import { EASE } from './common';

type Step = {
  id: string;
  title: string;
  desc: string;
  accent: string;
  Scene: ComponentType;
};

const DEMO_STEPS: Step[] = [
  {
    id: 'create',
    title: 'Oda Oluştur',
    desc: 'Bir oda kur, bağlantıyı arkadaşlarına gönder. Herkes saniyeler içinde katılır.',
    accent: '#6366f1',
    Scene: DemoRoom,
  },
  {
    id: 'pick',
    title: 'Kelime Seç',
    desc: 'Sıra sana geldiğinde üç kelimeden birini seç: kolay, orta ya da zor. Karar senin.',
    accent: '#22d3ee',
    Scene: DemoPick,
  },
  {
    id: 'draw',
    title: 'Çiz',
    desc: 'Kalemini, rengini ve kalınlığını seç, kelimeyi çiz. Herkes seni anlık olarak izler.',
    accent: '#10b981',
    Scene: DemoDraw,
  },
  {
    id: 'guess',
    title: 'Tahmin Et ve Kazan',
    desc: 'Tahminini sohbete yaz. Ne kadar hızlı bilirsen o kadar çok puan alırsın; harfler zamanla açılır.',
    accent: '#c8f560',
    Scene: DemoGuess,
  },
];

function StepCard({ step, i, className }: { step: Step; i: number; className?: string }) {
  const { Scene } = step;
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#070b14] p-5 sm:p-7',
        className
      )}
    >
      <div
        className="glow absolute -right-24 -top-24 h-72 w-72 opacity-30 transition-opacity duration-700 group-hover:opacity-60"
        style={{ color: step.accent }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <span
          className="font-display text-[88px] sm:text-[120px] font-extrabold leading-[0.8] tracking-[-0.06em] text-outline transition-colors duration-700 group-hover:[-webkit-text-stroke-color:var(--hover)]"
          style={{ ['--hover' as string]: step.accent }}
        >
          {String(i + 1).padStart(2, '0')}
        </span>
        <span className="mt-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Adım {i + 1}/4
        </span>
      </div>
      <h3 className="relative mt-6 font-display text-3xl sm:text-4xl font-bold tracking-[-0.035em] text-slate-50">
        {step.title}
      </h3>
      <p className="relative mt-3 max-w-sm text-sm sm:text-base leading-relaxed text-slate-400">{step.desc}</p>
      <div className="relative mt-6 flex-1 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#060a14]">
        <WhenVisible className="relative aspect-[4/3] w-full" amount={0.5}>
          <Scene />
        </WhenVisible>
      </div>
    </article>
  );
}

function ProgressDots({ progress }: { progress: MotionValue<number> }) {
  const width = useTransform(progress, [0, 1], ['0%', '100%']);
  return (
    <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-6">
      <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500">Kaydırmaya Devam</span>
      <div className="relative h-px flex-1 bg-white/10">
        <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-cyan-400 to-[#c8f560]" style={{ width }} />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-slate-500">04</span>
    </div>
  );
}

/** Desktop: vertical scroll drives a pinned horizontal track of steps. */
function HorizontalTrack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  const x = useTransform(smooth, (v) => -v * distance);

  return (
    <div ref={sectionRef} style={{ height: `calc(100vh + ${distance}px)` }} className="relative">
      <div className="sticky top-0 flex h-screen flex-col justify-center gap-6 overflow-hidden pt-10">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-6 pl-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pr-[12vw]">
          <div className="flex w-[34vw] max-w-[460px] shrink-0 flex-col justify-center pr-8">
            <SectionHeading
              stacked
              title={['Nasıl', '\n', { text: 'Oynanır?', className: 'text-gradient' }]}
              desc="Dört adım, sıfır kurulum. Bağlantıyı gönder, gerisini kalemler halletsin."
            />
          </div>
          {DEMO_STEPS.map((s, i) => (
            <StepCard key={s.id} step={s} i={i} className="h-[76vh] max-h-[680px] w-[min(520px,42vw)] shrink-0" />
          ))}
        </motion.div>
        <ProgressDots progress={scrollYProgress} />
      </div>
    </div>
  );
}

export default function GameDemo() {
  const desktop = useMediaQuery('(min-width: 1024px)');
  return (
    <section id="nasil" aria-label="Nasıl oynanır" className="relative z-10">
      {desktop ? (
        <HorizontalTrack />
      ) : (
        <div className="mx-auto max-w-6xl px-5 sm:px-6 pt-20 pb-10">
          <SectionHeading
            title={['Nasıl', { text: 'Oynanır?', className: 'text-gradient' }]}
            desc="Dört adım, sıfır kurulum. Bağlantıyı gönder, gerisini kalemler halletsin."
          />
          <div className="space-y-5">
            {DEMO_STEPS.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 1, ease: EXPO }}
                className="sticky"
                style={{ top: 80 + i * 14 }}
              >
                <StepCard step={s} i={i} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

const demoTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.4, ease: EASE },
};

function DemoRoom() {
  return (
    <motion.div {...demoTransition} className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <div className="glass rounded-2xl p-6 w-full max-w-[280px] text-center">
        <div className="text-xs text-slate-500 mb-2 font-medium">Oda Kodu</div>
        <motion.div
          className="text-3xl font-bold font-mono tracking-[0.3em] text-gradient mb-5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
        >
          XK4M2P
        </motion.div>
        <div className="flex justify-center gap-2 mb-4">
          {['#6366f1', '#22d3ee', '#10b981', '#f59e0b'].map((c, i) => (
            <motion.div
              key={c}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 300, damping: 20 }}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-8 h-8 rounded-full border-2 border-white/10" style={{ background: c }} />
              <span className="text-[10px] text-slate-500">
                {['Seda', 'Elif', 'Can', 'Zeynep'][i]}
              </span>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.9, duration: 0.4, ease: EASE }}
          className="h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center overflow-hidden"
        >
          <span className="text-xs font-semibold text-indigo-300">4 / 8 Oyuncu</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

function DemoPick() {
  const words = [
    { text: 'Kedi', diff: 'Kolay', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { text: 'Teleskop', diff: 'Orta', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
    { text: 'Gravitasyon', diff: 'Zor', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  ];
  return (
    <motion.div {...demoTransition} className="absolute inset-0 flex flex-col items-center justify-center p-8">
      <div className="text-xs text-slate-500 mb-1 font-medium">Sıra Sende!</div>
      <div className="text-sm text-slate-300 mb-5 font-semibold">Bir Kelime Seç</div>
      <div className="flex gap-3">
        {words.map((w, i) => (
          <motion.div
            key={w.text}
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.15, type: 'spring', stiffness: 260, damping: 22 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className={cn(
              'glass rounded-xl p-4 cursor-pointer text-center min-w-[90px] border transition-all',
              i === 1 ? 'ring-1 ring-amber-500/40 scale-[1.02]' : ''
            )}
          >
            <div className="text-base font-bold text-slate-100 mb-1.5">{w.text}</div>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', w.color)}>
              {w.diff}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function DemoDraw() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    const anim = el.animate(
      [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
      { duration: 2200, fill: 'forwards', easing: 'ease-out', delay: 300 }
    );
    return () => anim.cancel();
  }, []);

  return (
    <motion.div {...demoTransition} className="absolute inset-0 flex items-center justify-center p-6">
      <div className="w-full h-full relative">
        <div className="absolute inset-0 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <svg aria-hidden="true" viewBox="0 0 300 220" className="w-full h-full" fill="none">
            <path
              ref={pathRef}
              d="M 100 160 Q 100 100 120 90 Q 110 60 115 50 L 125 75 Q 140 65 160 65 Q 180 65 185 75 L 195 50 Q 200 60 190 90 Q 210 100 210 160 Z"
              stroke="rgba(99,102,241,0.8)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <motion.circle
              cx="140" cy="110" r="4"
              fill="rgba(99,102,241,0.8)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.2, duration: 0.3 }}
            />
            <motion.circle
              cx="170" cy="110" r="4"
              fill="rgba(99,102,241,0.8)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2.4, duration: 0.3 }}
            />
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6, duration: 0.4 }}
            >
              <line x1="110" y1="125" x2="85" y2="120" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" />
              <line x1="110" y1="130" x2="85" y2="135" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" />
              <line x1="200" y1="125" x2="225" y2="120" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" />
              <line x1="200" y1="130" x2="225" y2="135" stroke="rgba(99,102,241,0.5)" strokeWidth="1.5" />
            </motion.g>
          </svg>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5"
        >
          {['K', '_', '_', '_'].map((ch, i) => (
            <div
              key={i}
              className={cn(
                'w-7 h-8 rounded-md flex items-center justify-center text-sm font-bold',
                ch !== '_'
                  ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                  : 'bg-white/[0.04] border border-white/[0.08] text-slate-500'
              )}
            >
              {ch}
            </div>
          ))}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute top-3 left-3 flex gap-1.5"
        >
          {['#6366f1', '#ef4444', '#10b981', '#f59e0b'].map((c) => (
            <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

function DemoGuess() {
  const messages = [
    { name: 'Can', text: 'hayvan mı?', color: '#10b981', delay: 0.2 },
    { name: 'Elif', text: 'köpek', color: '#22d3ee', delay: 0.8 },
    { name: 'Zeynep', text: 'kedi', color: '#f59e0b', delay: 1.5, correct: true },
  ];
  return (
    <motion.div {...demoTransition} className="absolute inset-0 flex flex-col justify-end p-5">
      <div className="space-y-2">
        {messages.map((m) => (
          <motion.div
            key={m.text}
            initial={{ opacity: 0, x: -16, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: m.delay, duration: 0.4, ease: EASE }}
            className={cn(
              'flex items-center gap-2.5 rounded-xl px-3.5 py-2',
              m.correct
                ? 'bg-emerald-500/15 border border-emerald-500/30'
                : 'bg-white/[0.03]'
            )}
          >
            <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white" style={{ background: m.color }}>
              {m.name[0]}
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-slate-500 mr-2">{m.name}</span>
              <span className={cn('text-sm', m.correct ? 'font-bold text-emerald-400' : 'text-slate-300')}>
                {m.text}
              </span>
            </div>
            {m.correct && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: m.delay + 0.3, type: 'spring', stiffness: 400, damping: 15 }}
                className="ml-auto text-xs font-bold text-emerald-400"
              >
                +850
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mt-3 flex gap-2"
      >
        <div className="flex-1 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] px-3 flex items-center">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ delay: 2, duration: 1.5, repeat: Infinity }}
            className="text-xs text-slate-500"
          >
            Tahminin...
          </motion.span>
        </div>
        <div className="h-9 w-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
          <svg aria-hidden="true" className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}
