'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE, fadeUp } from './common';

const DEMO_STEPS = [
  {
    id: 'create',
    title: 'Oda Oluştur',
    desc: 'Bir oda kodu oluştur ve arkadaşlarınla paylaş. Herkes saniyeler içinde katılır.',
  },
  {
    id: 'pick',
    title: 'Kelime Seç',
    desc: 'Sıra sana geldiğinde 3 kelimeden birini seç. Kolay, orta veya zor — strateji senin.',
  },
  {
    id: 'draw',
    title: 'Çiz',
    desc: 'Kalem, renk ve kalınlık seçenekleriyle kelimeyi çiz. Herkes gerçek zamanlı izler.',
  },
  {
    id: 'guess',
    title: 'Tahmin Et & Kazan',
    desc: 'Chat\'ten tahminini yaz. Hızlı bil, daha çok puan kazan. İpuçları zamanla açılır.',
  },
] as const;

export default function GameDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: '-20%' });

  useEffect(() => {
    if (!isInView) return;
    const timer = setInterval(() => {
      setActiveStep((s) => (s + 1) % DEMO_STEPS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isInView]);

  return (
    <section id="nasil" ref={ref} className="relative z-10 mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="text-center mb-20"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-4 flex justify-center">
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Oyun Akışı
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          custom={0.08}
          className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl"
        >
          Nasıl <span className="text-gradient">Oynanır?</span>
        </motion.h2>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-2">
          {DEMO_STEPS.map((step, i) => (
            <motion.button
              key={step.id}
              onClick={() => setActiveStep(i)}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
              className={cn(
                'w-full text-left rounded-2xl p-5 transition-all duration-500',
                activeStep === i
                  ? 'glass border-indigo-500/30'
                  : 'bg-transparent hover:bg-white/[0.02]'
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold transition-all duration-500',
                    activeStep === i
                      ? 'bg-indigo-500/20 text-gradient border border-indigo-500/30'
                      : 'bg-white/[0.04] text-slate-500 border border-white/[0.06]'
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="min-w-0">
                  <h3
                    className={cn(
                      'font-semibold transition-colors duration-300 mb-1',
                      activeStep === i ? 'text-slate-100' : 'text-slate-400'
                    )}
                  >
                    {step.title}
                  </h3>
                  <AnimatePresence mode="wait">
                    {activeStep === i && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="text-sm leading-relaxed text-slate-400"
                      >
                        {step.desc}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {activeStep === i && (
                <motion.div className="mt-3 ml-14 h-0.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4, ease: 'linear' }}
                    key={`progress-${activeStep}`}
                  />
                </motion.div>
              )}
            </motion.button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE }}
          className="relative"
        >
          <div className="glass rounded-3xl p-1 overflow-hidden">
            <div className="rounded-[20px] bg-[#060a14] overflow-hidden aspect-[4/3] relative">
              <AnimatePresence mode="wait">
                {activeStep === 0 && <DemoRoom key="room" />}
                {activeStep === 1 && <DemoPick key="pick" />}
                {activeStep === 2 && <DemoDraw key="draw" />}
                {activeStep === 3 && <DemoGuess key="guess" />}
              </AnimatePresence>
            </div>
          </div>
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-indigo-500/[0.06] blur-2xl" />
        </motion.div>
      </div>
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
      <div className="text-sm text-slate-300 mb-5 font-semibold">Bir kelime seç</div>
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
