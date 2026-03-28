'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useTransform,
  AnimatePresence,
  useInView,
} from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { AVATAR_COLORS } from '@karalama/shared';
import { cn } from '@/lib/utils';

/* ============================================================
   Ahmetakyapi motion system
   ============================================================ */
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (d: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay: d },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (d: number = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: EASE, delay: d },
  }),
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (d: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: d },
  }),
};

/* ============================================================
   Spotlight hook
   ============================================================ */
function useSpotlight() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const onMove = useCallback(
    (e: React.MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    },
    [x, y]
  );
  const bg = useMotionTemplate`radial-gradient(700px circle at ${x}px ${y}px, rgba(99,102,241,0.06), transparent 70%)`;
  return { bg, onMove };
}

/* ============================================================
   3D tilt card
   ============================================================ */
function TiltCard({
  children,
  className,
  glowColor = 'rgba(99,102,241,0.10)',
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const ry = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 });
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
      ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    },
    [rx, ry, mx, my]
  );

  const onLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
    mx.set(0.5);
    my.set(0.5);
  }, [rx, ry, mx, my]);

  const shineX = useTransform(mx, [0, 1], ['0%', '100%']);
  const shineY = useTransform(my, [0, 1], ['0%', '100%']);
  const shine = useMotionTemplate`radial-gradient(360px circle at ${shineX} ${shineY}, ${glowColor}, transparent 70%)`;

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn('glass relative overflow-hidden', className)}
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: shine }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

/* ============================================================
   Animated Game Demo Section
   ============================================================ */
const DEMO_STEPS = [
  {
    id: 'create',
    title: 'Oda Oluştur',
    desc: 'Bir oda kodu oluştur ve arkadaşlarınla paylaş. Herkes saniyeler içinde katılır.',
    visual: 'room',
  },
  {
    id: 'pick',
    title: 'Kelime Seç',
    desc: 'Sıra sana geldiğinde 3 kelimeden birini seç. Kolay, orta veya zor — strateji senin.',
    visual: 'pick',
  },
  {
    id: 'draw',
    title: 'Çiz',
    desc: 'Kalem, renk ve kalınlık seçenekleriyle kelimeyi çiz. Herkes gerçek zamanlı izler.',
    visual: 'draw',
  },
  {
    id: 'guess',
    title: 'Tahmin Et & Kazan',
    desc: 'Chat\'ten tahminini yaz. Hızlı bil, daha çok puan kazan. İpuçları zamanla açılır.',
    visual: 'guess',
  },
] as const;

function GameDemo() {
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
    <section ref={ref} className="relative z-10 mx-auto max-w-6xl px-6 py-32">
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
        {/* Left: Steps */}
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
              {/* Progress bar */}
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

        {/* Right: Visual */}
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
          {/* Glow behind */}
          <div className="absolute -inset-4 -z-10 rounded-3xl bg-indigo-500/[0.06] blur-2xl" />
        </motion.div>
      </div>
    </section>
  );
}

/* Demo visuals */
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
                {['Ahmet', 'Elif', 'Can', 'Zeynep'][i]}
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
        {/* Canvas area */}
        <div className="absolute inset-0 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <svg viewBox="0 0 300 220" className="w-full h-full" fill="none">
            {/* Simple cat drawing */}
            <path
              ref={pathRef}
              d="M 100 160 Q 100 100 120 90 Q 110 60 115 50 L 125 75 Q 140 65 160 65 Q 180 65 185 75 L 195 50 Q 200 60 190 90 Q 210 100 210 160 Z"
              stroke="rgba(99,102,241,0.8)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Eyes */}
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
            {/* Whiskers */}
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
        {/* Word hint at bottom */}
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
        {/* Toolbar hint */}
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
      {/* Input */}
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
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   Features data
   ============================================================ */
const FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
      </svg>
    ),
    title: 'Gerçek Zamanlı Çizim',
    desc: 'Çizimler anında tüm oyunculara iletilir. Pürüzsüz ve akıcı.',
    glow: 'rgba(99,102,241,0.12)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
      </svg>
    ),
    title: '320+ Türkçe Kelime',
    desc: '8 farklı kategoride, 3 zorluk seviyesinde kelime havuzu.',
    glow: 'rgba(34,211,238,0.12)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: 'Mobil Uyumlu',
    desc: 'Telefondan parmağınla çiz, tabletten oyna. Her cihazda.',
    glow: 'rgba(16,185,129,0.12)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Anında Başla',
    desc: 'Kayıt yok, indirme yok. Link paylaş ve oyna.',
    glow: 'rgba(245,158,11,0.12)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: 'İpucu Sistemi',
    desc: 'Harfler zamanla açılır. Yaklaştığında uyarı alırsın.',
    glow: 'rgba(168,85,247,0.12)',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
      </svg>
    ),
    title: 'Skor & Podium',
    desc: 'Hız bonusu, zorluk çarpanı. Oyun sonunda podyum.',
    glow: 'rgba(244,63,94,0.12)',
  },
];

/* ============================================================
   Main Page
   ============================================================ */
export default function HomePage() {
  const router = useRouter();
  const spotlight = useSpotlight();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(AVATAR_COLORS[0]);

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    const params = new URLSearchParams({
      name: playerName.trim(),
      color: selectedColor,
    });
    router.push(`/oda/${roomCode.toUpperCase()}?${params}`);
  };

  const handleCreate = () => {
    if (!playerName.trim()) return;
    const params = new URLSearchParams({
      name: playerName.trim(),
      color: selectedColor,
    });
    router.push(`/oda/olustur?${params}`);
  };

  return (
    <div className="relative min-h-screen" onMouseMove={spotlight.onMove}>
      {/* Spotlight */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: spotlight.bg }}
      />
      {/* Grid */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-60" />

      {/* ===== HERO ===== */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-8 pb-20">
        <motion.div
          className="relative z-10 w-full max-w-3xl text-center"
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} custom={0} className="mb-6 flex justify-center">
            <span className="chip">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              Multiplayer Çizim Oyunu
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            custom={0.06}
            className="mb-5 text-[2.75rem] font-extrabold leading-[1.1] tracking-tight text-slate-50 sm:text-6xl lg:text-[4.25rem]"
          >
            Çiz, Tahmin Et
            <br />
            <span className="text-gradient">ve Eğlen!</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            custom={0.12}
            className="mx-auto mb-10 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            Oda oluştur, linki paylaş, saniyeler içinde oynamaya başla.
            Kayıt yok, indirme yok, tamamen ücretsiz.
          </motion.p>

          {/* Player Setup Card */}
          <motion.div
            variants={scaleUp}
            custom={0.2}
            className="mx-auto max-w-sm"
          >
            <div className="glass rounded-2xl p-5 space-y-3">
              {/* Name input + avatar */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white border-2 border-white/10 transition-colors duration-300"
                  style={{ backgroundColor: selectedColor }}
                >
                  {playerName ? playerName[0].toUpperCase() : '?'}
                </div>
                <Input
                  placeholder="Adını gir..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  maxLength={20}
                  className="flex-1"
                />
              </div>

              {/* Color picker - compact single row */}
              <div className="flex items-center gap-1.5 px-1 overflow-x-auto py-1">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'w-5 h-5 rounded-full shrink-0 transition-all duration-200',
                      selectedColor === color
                        ? 'ring-2 ring-white ring-offset-1 ring-offset-[#0a1021] scale-110'
                        : 'opacity-50 hover:opacity-100 hover:scale-110'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* Join with room code */}
              <div className="flex gap-2">
                <Input
                  placeholder="Oda kodu"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="font-mono tracking-[0.15em] uppercase flex-1 !py-2.5 text-sm"
                />
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleJoin}
                  disabled={!playerName.trim() || roomCode.length < 4}
                  className="rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:text-white hover:border-white/[0.2] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Katıl
                </motion.button>
              </div>

              {/* Create room */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={!playerName.trim()}
                className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Yeni Oda Oluştur
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
        >
          <div className="flex h-9 w-5 items-start justify-center rounded-full border border-slate-600/30 p-1">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="h-1.5 w-1 rounded-full bg-slate-400"
            />
          </div>
        </motion.div>
      </section>

      {/* ===== GAME DEMO (Animated) ===== */}
      <GameDemo />

      {/* ===== FEATURES ===== */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-16 text-center"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-4 flex justify-center">
            <span className="chip">Özellikler</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={0.06}
            className="mb-3 text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl"
          >
            Neden <span className="text-gradient">Çiz Tahmin Et?</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={0.12}
            className="mx-auto max-w-md text-sm text-slate-400"
          >
            Skribbl.io&apos;dan ilham aldık, daha güzel, daha hızlı ve tamamen Türkçe yaptık.
          </motion.p>
        </motion.div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i * 0.06}
            >
              <TiltCard className="rounded-2xl p-5 h-full" glowColor={f.glow}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-indigo-400">
                  {f.icon}
                </div>
                <h3 className="mb-1.5 text-sm font-semibold text-slate-100">{f.title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{f.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="glass overflow-hidden rounded-3xl p-10 sm:p-14 text-center relative"
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-indigo-500/[0.04] via-transparent to-cyan-500/[0.04]" />

          <motion.h2
            variants={fadeUp}
            custom={0}
            className="relative mb-3 text-3xl font-extrabold tracking-tight text-slate-50 sm:text-4xl"
          >
            Hadi <span className="text-gradient">Oynayalım!</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={0.08}
            className="relative mx-auto mb-8 max-w-md text-sm text-slate-400"
          >
            Arkadaşlarını topla, bir oda oluştur ve eğlenceye başla.
            Tek gereken bir tarayıcı.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.16} className="relative">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 active:scale-[0.97]"
            >
              Yukarı Kaydır ve Başla
              <svg
                className="h-4 w-4 transition-transform group-hover:-translate-y-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 text-center">
        <p className="text-xs text-slate-500">
          Çiz Tahmin Et &mdash; Arkadaşlarınla eğlencenin adresi
        </p>
      </footer>
    </div>
  );
}
