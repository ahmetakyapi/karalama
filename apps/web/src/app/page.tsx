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
  useScroll,
} from 'framer-motion';
import { AVATAR_CHARACTERS } from '@karalama/shared';
import { cn } from '@/lib/utils';

/* ============================================================
   Motion system
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

const scaleUp = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: (d: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: EASE, delay: d },
  }),
};

/* ============================================================
   Spotlight + aurora background
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
  const bg = useMotionTemplate`radial-gradient(600px circle at ${x}px ${y}px, rgba(99,102,241,0.08), transparent 70%)`;
  return { bg, onMove };
}

function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-20 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-0 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]"
      />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04070d]" />
    </div>
  );
}

/* ============================================================
   3D tilt card
   ============================================================ */
function TiltCard({
  children,
  className,
  glowColor = 'rgba(99,102,241,0.12)',
  tiltStrength = 6,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  tiltStrength?: number;
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
      rx.set(-((e.clientY - r.top) / r.height - 0.5) * tiltStrength);
      ry.set(((e.clientX - r.left) / r.width - 0.5) * tiltStrength);
      mx.set((e.clientX - r.left) / r.width);
      my.set((e.clientY - r.top) / r.height);
    },
    [rx, ry, mx, my, tiltStrength]
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
   Top Navigation
   ============================================================ */
function TopNav() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    return scrollY.on('change', (y) => setScrolled(y > 20));
  }, [scrollY]);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-500',
        scrolled ? 'py-3' : 'py-5'
      )}
    >
      <div className={cn(
        'mx-auto max-w-6xl px-5 transition-all duration-500',
      )}>
        <div className={cn(
          'flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-500',
          scrolled
            ? 'bg-[#070b14]/80 border border-white/[0.06] backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.25)]'
            : 'bg-transparent border border-transparent'
        )}>
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px]">
              <div className="w-full h-full rounded-[10px] bg-[#04070d] flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
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
            <span className="text-base font-bold text-slate-100 tracking-tight">
              Karalama
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
              Canlı
            </span>
          </a>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { href: '#ozellikler', label: 'Özellikler' },
              { href: '#nasil', label: 'Nasıl Oynanır' },
              { href: '#topluluk', label: 'Topluluk' },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] transition-all"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <a
              href="/profil"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profil
            </a>
            <button
              onClick={() => document.getElementById('oyna')?.scrollIntoView({ behavior: 'smooth' })}
              className="relative overflow-hidden rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-400 px-4 py-2 text-xs font-bold text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] transition-all"
            >
              Hemen Oyna
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

/* ============================================================
   Hero Demo (animated preview on the right side of hero)
   ============================================================ */
const HERO_STEPS = [
  { id: 'lobby', label: 'Lobi', icon: '🚪' },
  { id: 'draw', label: 'Çiz', icon: '✏️' },
  { id: 'guess', label: 'Tahmin', icon: '💬' },
  { id: 'winners', label: 'Podyum', icon: '🏆' },
] as const;

function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % 4), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
      className="relative hidden lg:flex lg:flex-col"
    >
      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-4">
        {HERO_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setStep(i)}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300',
              step === i
                ? 'bg-white/[0.08] text-slate-100 border border-white/[0.12]'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <span className="text-sm">{s.icon}</span>
            {step === i && (
              <motion.span
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="overflow-hidden whitespace-nowrap"
              >
                {s.label}
              </motion.span>
            )}
          </button>
        ))}
      </div>

      {/* Preview screen */}
      <div className="glass rounded-3xl p-1.5 overflow-hidden flex-1 flex flex-col">
        <div className="rounded-[20px] bg-[#060a14] overflow-hidden flex-1 relative min-h-[360px]">
          {/* Window dots */}
          <div className="absolute top-3 left-4 flex gap-1.5 z-20">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && <HeroLobby key="lobby" />}
            {step === 1 && <HeroDraw key="draw" />}
            {step === 2 && <HeroGuess key="guess" />}
            {step === 3 && <HeroWinners key="winners" />}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 p-2 pt-1.5">
          {HERO_STEPS.map((s, i) => (
            <div key={s.id} className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              {step === i && (
                <motion.div
                  key={`p-${step}`}
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 6, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const heroTransition = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.45, ease: EASE },
};

function HeroLobby() {
  const players = [
    { name: 'Seda', emoji: '🤖', color: '#6366f1', ready: true },
    { name: 'Elif', emoji: '🐱', color: '#f59e0b', ready: true },
    { name: 'Can', emoji: '👽', color: '#10b981', ready: false },
    { name: 'Zeynep', emoji: '🧙', color: '#8b5cf6', ready: true },
    { name: 'Burak', emoji: '🥷', color: '#f43f5e', ready: false },
  ];
  return (
    <motion.div {...heroTransition} className="absolute inset-0 flex flex-col p-6 pt-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-[10px] text-slate-500 mb-0.5">Oda Kodu</div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold font-mono tracking-[0.25em] text-gradient"
          >
            XK4M2P
          </motion.div>
        </div>
        <div className="glass rounded-lg px-3 py-1.5">
          <span className="text-xs text-slate-400">
            <span className="text-indigo-400 font-bold">5</span> / 8
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        {players.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.4, ease: EASE }}
            className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
              style={{ background: `linear-gradient(135deg, ${p.color}40, ${p.color}70)` }}
            >
              {p.emoji}
            </div>
            <span className="text-xs font-medium text-slate-300 flex-1">{p.name}</span>
            {i === 0 && (
              <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded-md">HOST</span>
            )}
            <div className={cn(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px]',
              p.ready ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.04] text-slate-600'
            )}>
              {p.ready ? '✓' : '·'}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function HeroDraw() {
  const pathRef = useRef<SVGPathElement>(null);
  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    el.style.strokeDasharray = `${len}`;
    el.style.strokeDashoffset = `${len}`;
    const anim = el.animate(
      [{ strokeDashoffset: `${len}` }, { strokeDashoffset: '0' }],
      { duration: 2800, fill: 'forwards', easing: 'ease-out', delay: 300 }
    );
    return () => anim.cancel();
  }, []);

  return (
    <motion.div {...heroTransition} className="absolute inset-0 flex flex-col p-5 pt-10">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-1">
          {['#6366f1', '#ef4444', '#10b981', '#f59e0b'].map((c) => (
            <div key={c} className="w-5 h-5 rounded-full border border-white/10" style={{ background: c }} />
          ))}
        </div>
        <div className="text-[10px] font-mono text-slate-500 tabular-nums">
          0:<motion.span initial={{ opacity: 0.6 }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1, repeat: Infinity }}>54</motion.span>
        </div>
      </div>

      <div className="flex-1 rounded-xl bg-white/[0.02] border border-white/[0.05] relative overflow-hidden">
        <svg viewBox="0 0 300 200" className="w-full h-full" fill="none">
          <path
            ref={pathRef}
            d="M 80 160 Q 80 90 100 80 Q 88 50 95 40 L 105 65 Q 125 55 150 55 Q 175 55 180 65 L 190 40 Q 200 50 190 80 Q 215 90 220 160 Z"
            stroke="rgba(99,102,241,0.85)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <motion.circle
            cx="130" cy="105" r="4"
            fill="rgba(99,102,241,0.85)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 2.8, duration: 0.3 }}
          />
          <motion.circle
            cx="170" cy="105" r="4"
            fill="rgba(99,102,241,0.85)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 3.0, duration: 0.3 }}
          />
        </svg>
      </div>

      <div className="mt-3 flex justify-center gap-1.5">
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
      </div>
    </motion.div>
  );
}

function HeroGuess() {
  const messages = [
    { name: 'Seda', text: 'çiçek mi?', emoji: '🤖', color: '#6366f1', delay: 0.3 },
    { name: 'Elif', text: 'ağaç', emoji: '🐱', color: '#f59e0b', delay: 0.9 },
    { name: 'Can', text: 'dağ değil mi', emoji: '👽', color: '#10b981', delay: 1.5 },
    { name: 'Zeynep', text: 'volkan', emoji: '🧙', color: '#8b5cf6', delay: 2.2, correct: true },
    { name: 'Burak', text: 'bende diyecektim!', emoji: '🥷', color: '#f43f5e', delay: 3 },
  ];

  return (
    <motion.div {...heroTransition} className="absolute inset-0 flex flex-col p-5 pt-10">
      <div className="h-24 rounded-xl bg-white/[0.02] border border-white/[0.06] mb-3 flex items-center justify-center overflow-hidden relative">
        <svg viewBox="0 0 200 80" className="w-40 h-16" fill="none">
          <path
            d="M40 70 L60 30 L80 50 L100 15 L120 50 L140 30 L160 70"
            stroke="rgba(16,185,129,0.7)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="100" cy="15" r="4" fill="rgba(239,68,68,0.7)" />
        </svg>
        <div className="absolute top-1.5 right-2 flex gap-1">
          {['V', '_', '_', '_', '_', 'N'].map((ch, i) => (
            <div key={i} className={cn(
              'w-4 h-5 rounded text-[8px] font-bold flex items-center justify-center',
              ch !== '_' ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-white/[0.04] text-slate-600 border border-white/[0.06]'
            )}>
              {ch}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-hidden">
        {messages.map((m) => (
          <motion.div
            key={m.text}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: m.delay, duration: 0.35, ease: EASE }}
            className={cn(
              'flex items-center gap-2 rounded-xl px-2.5 py-1.5',
              m.correct ? 'bg-emerald-500/10 border border-emerald-500/25' : 'bg-white/[0.02]'
            )}
          >
            <div
              className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px]"
              style={{ background: `linear-gradient(135deg, ${m.color}40, ${m.color}70)` }}
            >
              {m.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] font-medium text-slate-500 mr-1.5">{m.name}</span>
              <span className={cn('text-[10px]', m.correct ? 'font-bold text-emerald-400' : 'text-slate-300')}>
                {m.text}
              </span>
            </div>
            {m.correct && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: m.delay + 0.3, type: 'spring', stiffness: 400, damping: 15 }}
                className="text-[9px] font-bold text-emerald-400 shrink-0"
              >
                +850
              </motion.span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function HeroWinners() {
  const podium = [
    { name: 'Elif', emoji: '🐱', score: 3820, rank: 2, color: '#f59e0b', barH: 'h-16' },
    { name: 'Zeynep', emoji: '🧙', score: 4150, rank: 1, color: '#8b5cf6', barH: 'h-24' },
    { name: 'Seda', emoji: '🤖', score: 3540, rank: 3, color: '#6366f1', barH: 'h-12' },
  ];

  return (
    <motion.div {...heroTransition} className="absolute inset-0 flex flex-col items-center justify-center p-6 pt-10">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -10, x: Math.random() * 280, opacity: 1, rotate: 0 }}
          animate={{
            y: 260,
            opacity: [1, 1, 0],
            rotate: Math.random() * 360,
            x: Math.random() * 280,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 1,
            repeat: Infinity,
            repeatDelay: Math.random() * 2,
          }}
          className="absolute top-0 w-1.5 h-1.5 rounded-sm"
          style={{
            background: ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#f97316'][i % 7],
            left: 0,
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
        className="text-3xl mb-2"
      >
        🏆
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm font-bold text-slate-100 mb-6"
      >
        Oyun Bitti!
      </motion.div>

      <div className="flex items-end gap-3 mb-5">
        {podium.map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.2, duration: 0.5, ease: EASE }}
            className="flex flex-col items-center"
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-base mb-1.5"
              style={{
                background: `linear-gradient(135deg, ${p.color}40, ${p.color}70)`,
                boxShadow: p.rank === 1 ? `0 0 16px ${p.color}40` : 'none',
              }}
            >
              {p.emoji}
            </div>
            <span className="text-[9px] font-semibold text-slate-300 mb-1">{p.name}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              transition={{ delay: 0.8 + i * 0.2, duration: 0.5, ease: EASE }}
              className={cn(
                'w-16 rounded-t-lg flex flex-col items-center justify-start pt-2',
                p.barH
              )}
              style={{
                background: `linear-gradient(180deg, ${p.color}30, ${p.color}10)`,
                borderTop: `2px solid ${p.color}60`,
              }}
            >
              <span className="text-[9px] font-bold" style={{ color: p.color }}>
                #{p.rank}
              </span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 + i * 0.2 }}
                className="text-[8px] font-mono text-slate-400 mt-0.5"
              >
                {p.score}
              </motion.span>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ============================================================
   Scrolling Marquee
   ============================================================ */
function Marquee() {
  const items = [
    { emoji: '🎨', label: 'Gerçek Zamanlı Çizim' },
    { emoji: '🇹🇷', label: '1070+ Türkçe Kelime' },
    { emoji: '⚡', label: 'Anında Bağlan' },
    { emoji: '📱', label: 'Her Cihazda' },
    { emoji: '🤖', label: 'Bot Desteği' },
    { emoji: '🏆', label: 'Skor Tablosu' },
    { emoji: '💬', label: 'Canlı Chat' },
    { emoji: '🎯', label: 'Akıllı İpuçları' },
    { emoji: '🌈', label: 'Özel Renkler' },
    { emoji: '🚀', label: 'Kayıt Gerektirmez' },
  ];
  const doubled = [...items, ...items];

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-6 -mt-6 sm:-mt-10">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] py-5"
        style={{
          background:
            'linear-gradient(90deg, rgba(99,102,241,0.05), rgba(12,18,34,0.55) 20%, rgba(12,18,34,0.55) 80%, rgba(34,211,238,0.05))',
          backdropFilter: 'blur(14px)',
          boxShadow:
            'inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 50px -20px rgba(0,0,0,0.6)',
        }}
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none rounded-l-2xl"
          style={{ background: 'linear-gradient(to right, rgba(12,18,34,0.98), transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none rounded-r-2xl"
          style={{ background: 'linear-gradient(to left, rgba(12,18,34,0.98), transparent)' }}
        />
        <motion.div
          className="flex items-center gap-8 whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        >
          {doubled.map((it, i) => (
            <div key={i} className="flex items-center gap-2.5 shrink-0">
              <span className="text-xl">{it.emoji}</span>
              <span className="text-sm font-semibold text-slate-400">{it.label}</span>
              <span className="text-indigo-400/40 text-lg">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

/* ============================================================
   Stats Row (animated counters)
   ============================================================ */
function Counter({ to, suffix = '', duration = 1.6 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const fromV = 0;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.floor(fromV + (to - fromV) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return <span ref={ref}>{value.toLocaleString('tr-TR')}{suffix}</span>;
}

function StatsRow() {
  const stats = [
    { value: 1070, suffix: '+', label: 'Türkçe Kelime', color: '#6366f1' },
    { value: 18, suffix: '', label: 'Kategori', color: '#22d3ee' },
    { value: 12, suffix: '', label: 'Oyuncu/Oda', color: '#10b981' },
    { value: 100, suffix: '%', label: 'Ücretsiz', color: '#f59e0b' },
  ];

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={scaleUp}
            custom={i * 0.08}
            className="glass rounded-2xl p-6 text-center relative overflow-hidden group"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: `radial-gradient(circle at center, ${s.color}15, transparent 70%)` }}
            />
            <div
              className="text-3xl sm:text-4xl font-extrabold tabular-nums mb-1 relative"
              style={{
                background: `linear-gradient(135deg, ${s.color}, ${s.color}aa)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              <Counter to={s.value} suffix={s.suffix} />
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider relative">
              {s.label}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ============================================================
   Animated Game Demo Section (how to play)
   ============================================================ */
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
          <svg viewBox="0 0 300 220" className="w-full h-full" fill="none">
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
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ============================================================
   Bento Features
   ============================================================ */
function BentoFeatures() {
  return (
    <section id="ozellikler" className="relative z-10 mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mb-14 text-center"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-4 flex justify-center">
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
            Özellikler
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          custom={0.06}
          className="mb-3 text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl"
        >
          Neden <span className="text-gradient">Karalama?</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={0.12}
          className="mx-auto max-w-lg text-base text-slate-400"
        >
          Her detay, mükemmel bir oyun gecesi için düşünüldü.
        </motion.p>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[minmax(200px,auto)]"
      >
        {/* 1. Real-time drawing - big */}
        <motion.div variants={fadeUp} custom={0} className="md:col-span-4 md:row-span-2 min-h-[320px]">
          <TiltCard className="rounded-3xl p-8 h-full relative" glowColor="rgba(99,102,241,0.15)">
            <div className="flex flex-col h-full">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-slate-100 mb-2 tracking-tight">
                Gerçek Zamanlı Çizim
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-md">
                Fırça her hareketi milisaniyeler içinde tüm oyunculara iletilir. Basınç hassas, pürüzsüz ve akıcı.
              </p>
              {/* Live draw visualization */}
              <div className="mt-auto rounded-2xl bg-[#060a14] border border-white/[0.05] p-4 relative overflow-hidden flex-1 min-h-[140px]">
                <div className="absolute top-3 left-3 flex gap-1.5">
                  {['#6366f1', '#ef4444', '#22d3ee', '#f59e0b'].map((c) => (
                    <motion.div
                      key={c}
                      whileHover={{ scale: 1.2 }}
                      className="w-5 h-5 rounded-full border border-white/15"
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <svg viewBox="0 0 300 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <motion.path
                    d="M 30 80 Q 60 20 100 60 T 170 55 T 260 70"
                    fill="none"
                    stroke="rgba(99,102,241,0.85)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    initial={{ strokeDashoffset: 1000 }}
                    whileInView={{ strokeDashoffset: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 2.2, ease: 'easeOut', delay: 0.3 }}
                  />
                  <motion.circle
                    cx="260" cy="70" r="5"
                    fill="#22d3ee"
                    animate={{ cx: [30, 260, 30], cy: [80, 70, 80] }}
                    transition={{ duration: 4.4, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </svg>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* 2. 1070+ words */}
        <motion.div variants={fadeUp} custom={0.08} className="md:col-span-2">
          <TiltCard className="rounded-3xl p-6 h-full" glowColor="rgba(34,211,238,0.15)">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502" />
              </svg>
            </div>
            <div className="text-3xl font-extrabold text-slate-100 mb-1 tracking-tight">
              <Counter to={1070} suffix="+" />
            </div>
            <div className="text-sm font-semibold text-slate-300 mb-1">Türkçe Kelime</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              18 kategori · 3 zorluk seviyesi
            </p>
          </TiltCard>
        </motion.div>

        {/* 3. Mobile friendly */}
        <motion.div variants={fadeUp} custom={0.12} className="md:col-span-2">
          <TiltCard className="rounded-3xl p-6 h-full" glowColor="rgba(16,185,129,0.15)">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mb-1.5">Mobil Uyumlu</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Telefondan parmağınla çiz, tabletten oyna. Her cihazda aynı deneyim.
            </p>
          </TiltCard>
        </motion.div>

        {/* 4. Instant start */}
        <motion.div variants={fadeUp} custom={0.16} className="md:col-span-3">
          <TiltCard className="rounded-3xl p-6 h-full relative overflow-hidden" glowColor="rgba(245,158,11,0.15)">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-1.5">Anında Başla</h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-[240px]">
                  Kayıt yok, indirme yok. İsmini yaz, linki paylaş, oyna.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 mt-1">
                {['✓ Kayıt Yok', '✓ İndirme Yok', '✓ Ücretsiz'].map((t, i) => (
                  <motion.span
                    key={t}
                    initial={{ opacity: 0, x: 12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                  >
                    {t}
                  </motion.span>
                ))}
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* 5. Hint system */}
        <motion.div variants={fadeUp} custom={0.2} className="md:col-span-3">
          <TiltCard className="rounded-3xl p-6 h-full" glowColor="rgba(168,85,247,0.15)">
            <div className="flex items-start gap-4">
              <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-slate-100 mb-1.5">Akıllı İpuçları</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Harfler zamanla açılır. &quot;Yaklaştın&quot; uyarıları seni yönlendirir.
                </p>
                <div className="flex gap-1">
                  {['K', 'A', 'L', '_', 'M'].map((ch, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.6, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 300 }}
                      className={cn(
                        'w-7 h-8 rounded-md flex items-center justify-center text-xs font-bold',
                        ch !== '_'
                          ? 'bg-violet-500/15 border border-violet-500/30 text-violet-300'
                          : 'bg-white/[0.03] border border-white/[0.06] text-slate-500'
                      )}
                    >
                      {ch}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ============================================================
   Testimonials / Community
   ============================================================ */
function Testimonials() {
  const testimonials = [
    {
      name: 'Zeynep Kaya',
      role: 'Üniversite Öğrencisi',
      emoji: '🧙',
      color: '#8b5cf6',
      text: 'Arkadaşlarla online takılırken en çok eğlendiğim oyun. Türkçe kelime hazinesi inanılmaz.',
    },
    {
      name: 'Emre Demir',
      role: 'Yazılım Geliştirici',
      emoji: '🥷',
      color: '#f43f5e',
      text: 'Skribbl\'i bırakıp buna geçtik. Arayüz çok daha modern, bot desteği harika.',
    },
    {
      name: 'Ayşe Yıldız',
      role: 'Öğretmen',
      emoji: '🐱',
      color: '#f59e0b',
      text: 'Sınıfımla online ders sonunda oynuyoruz. Kategoriler çok zengin, çocuklar bayılıyor.',
    },
  ];

  return (
    <section id="topluluk" className="relative z-10 mx-auto max-w-6xl px-6 py-28">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mb-14 text-center"
      >
        <motion.div variants={fadeUp} custom={0} className="mb-4 flex justify-center">
          <span className="chip">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Topluluk
          </span>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          custom={0.06}
          className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl"
        >
          Oyuncular <span className="text-gradient">Ne Diyor?</span>
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid md:grid-cols-3 gap-4"
      >
        {testimonials.map((t, i) => (
          <motion.div key={t.name} variants={fadeUp} custom={i * 0.08}>
            <TiltCard
              className="rounded-3xl p-6 h-full flex flex-col"
              glowColor={`${t.color}26`}
              tiltStrength={4}
            >
              <div className="mb-4 text-2xl opacity-20 leading-none">&ldquo;</div>
              <p className="text-sm leading-relaxed text-slate-300 mb-6 flex-1">
                {t.text}
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-white/[0.05]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${t.color}40, ${t.color}70)`,
                    boxShadow: `0 0 12px ${t.color}30`,
                  }}
                >
                  {t.emoji}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-slate-100">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.role}</div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

/* ============================================================
   Local helpers
   ============================================================ */
function loadSavedPlayer() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('karalama_player');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function savePlayer(name: string, avatarId: string, color: string) {
  try {
    localStorage.setItem('karalama_player', JSON.stringify({ name, avatarId, color }));
  } catch { /* quota exceeded */ }
}

/* ============================================================
   Player Setup Card — the main interactive form
   ============================================================ */
function PlayerSetup({
  playerName,
  setPlayerName,
  roomCode,
  setRoomCode,
  selectedAvatar,
  setSelectedAvatar,
  selectedColor,
  setSelectedColor,
  hasSaved,
  onCreate,
  onJoin,
}: {
  playerName: string;
  setPlayerName: (v: string) => void;
  roomCode: string;
  setRoomCode: (v: string) => void;
  selectedAvatar: typeof AVATAR_CHARACTERS[number];
  setSelectedAvatar: (v: typeof AVATAR_CHARACTERS[number]) => void;
  selectedColor: string;
  setSelectedColor: (v: string) => void;
  hasSaved: boolean;
  onCreate: () => void;
  onJoin: () => void;
}) {
  const [joinOpen, setJoinOpen] = useState(false);
  const nameReady = playerName.trim().length > 0;
  const joinReady = nameReady && roomCode.trim().length >= 4;

  return (
    <TiltCard
      className="rounded-3xl p-6 sm:p-7 relative"
      glowColor={`${selectedColor}20`}
      tiltStrength={3}
    >
      {/* Saved indicator */}
      {hasSaved && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          Kayıtlı
        </div>
      )}

      <div className="space-y-5">
        {/* Name input — the centerpiece */}
        <div>
          <label className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em]">
              Oyuncu Adın
            </span>
            <span className="text-[10px] text-slate-600 tabular-nums">
              {playerName.length}/20
            </span>
          </label>
          <div className="relative">
            <motion.div
              layout
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-xl z-10"
              style={{
                background: `linear-gradient(135deg, ${selectedColor}35, ${selectedColor}70)`,
                boxShadow: `0 4px 18px ${selectedColor}30, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {selectedAvatar.emoji}
            </motion.div>
            <input
              type="text"
              autoComplete="off"
              placeholder="örn: Ahmet"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
              maxLength={20}
              className={cn(
                'w-full pl-[64px] pr-4 h-14 rounded-2xl',
                'bg-white/[0.04] border',
                'text-lg font-semibold text-slate-50',
                'placeholder:text-slate-700 placeholder:font-normal placeholder:italic',
                'focus:outline-none transition-all duration-300',
                nameReady
                  ? 'border-white/[0.12] focus:border-indigo-400/50'
                  : 'border-white/[0.08] focus:border-white/20'
              )}
              style={nameReady ? {
                boxShadow: `0 0 0 1px ${selectedColor}22, 0 0 24px ${selectedColor}15`,
              } : undefined}
            />
          </div>
        </div>

        {/* Avatar picker — compact, premium */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-2.5">
            Karakter Seç
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {AVATAR_CHARACTERS.map((avatar, i) => {
              const active = selectedAvatar.id === avatar.id;
              return (
                <motion.button
                  key={avatar.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3, ease: EASE }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setSelectedColor(avatar.color);
                  }}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 rounded-2xl p-2.5 sm:p-3 transition-all duration-300',
                    active
                      ? 'bg-white/[0.06]'
                      : 'bg-white/[0.02] hover:bg-white/[0.04]'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="avatar-active-ring"
                      className="absolute inset-0 rounded-2xl border-2"
                      style={{ borderColor: avatar.color }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg relative"
                    style={{
                      background: `linear-gradient(135deg, ${avatar.color}30, ${avatar.color}60)`,
                      boxShadow: active ? `0 0 18px ${avatar.color}50` : 'none',
                    }}
                  >
                    {avatar.emoji}
                  </div>
                  <span className={cn(
                    'text-[9px] sm:text-[10px] font-semibold transition-colors relative',
                    active ? 'text-slate-200' : 'text-slate-500'
                  )}>
                    {avatar.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Primary CTA — Create Room */}
        <div className="relative">
          <motion.button
            whileHover={nameReady ? { scale: 1.01, y: -1 } : undefined}
            whileTap={nameReady ? { scale: 0.985 } : undefined}
            onClick={onCreate}
            disabled={!nameReady}
            className={cn(
              'group relative w-full overflow-hidden rounded-2xl h-14 flex items-center justify-center gap-2 text-base font-bold transition-all duration-300',
              nameReady
                ? 'text-white cursor-pointer'
                : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 cursor-not-allowed'
            )}
            style={nameReady ? {
              background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}cc)`,
              boxShadow: `0 10px 30px ${selectedColor}35, 0 4px 12px ${selectedColor}25, inset 0 1px 0 rgba(255,255,255,0.2)`,
            } : undefined}
          >
            <span className="relative z-10 flex items-center gap-2">
              {nameReady ? (
                <>
                  Yeni Oda Oluştur
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                  Önce adını yaz
                </>
              )}
            </span>
            {nameReady && (
              <motion.span
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none"
                animate={{ x: ['0%', '500%'] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              />
            )}
          </motion.button>
        </div>

        {/* Join collapse */}
        <div className="relative">
          <div className="flex items-center gap-3 my-1">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <button
              onClick={() => setJoinOpen((v) => !v)}
              className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em] hover:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              Oda kodu ile katıl
              <motion.svg
                animate={{ rotate: joinOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <AnimatePresence>
            {joinOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Oda kodu"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                    maxLength={6}
                    onKeyDown={(e) => { if (e.key === 'Enter' && joinReady) onJoin(); }}
                    className="flex-1 px-4 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-mono tracking-[0.2em] uppercase text-sm placeholder:text-slate-700 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-indigo-400/40 transition-colors"
                  />
                  <motion.button
                    whileHover={joinReady ? { scale: 1.02 } : undefined}
                    whileTap={joinReady ? { scale: 0.97 } : undefined}
                    onClick={onJoin}
                    disabled={!joinReady}
                    className={cn(
                      'h-11 px-5 rounded-xl text-sm font-bold transition-all',
                      joinReady
                        ? 'bg-white text-slate-900 shadow-[0_4px_16px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.22)]'
                        : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 cursor-not-allowed'
                    )}
                  >
                    Katıl
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TiltCard>
  );
}

/* ============================================================
   Main Page
   ============================================================ */
export default function HomePage() {
  const router = useRouter();
  const spotlight = useSpotlight();

  const saved = useRef(loadSavedPlayer());
  const hasSaved = !!saved.current?.name;

  const [playerName, setPlayerName] = useState(saved.current?.name || '');
  const [roomCode, setRoomCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    () => AVATAR_CHARACTERS.find((a) => a.id === saved.current?.avatarId) || AVATAR_CHARACTERS[0]
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    () => saved.current?.color || AVATAR_CHARACTERS[0].color
  );

  const handleJoin = useCallback(() => {
    if (!playerName.trim() || !roomCode.trim()) return;
    savePlayer(playerName.trim(), selectedAvatar.id, selectedColor);
    const params = new URLSearchParams({
      name: playerName.trim(),
      color: selectedColor,
    });
    router.push(`/oda/${roomCode.toUpperCase()}?${params}`);
  }, [playerName, roomCode, selectedAvatar.id, selectedColor, router]);

  const handleCreate = useCallback(() => {
    if (!playerName.trim()) return;
    savePlayer(playerName.trim(), selectedAvatar.id, selectedColor);
    const params = new URLSearchParams({
      name: playerName.trim(),
      color: selectedColor,
    });
    router.push(`/oda/olustur?${params}`);
  }, [playerName, selectedAvatar.id, selectedColor, router]);

  const [liveCount, setLiveCount] = useState<number | null>(null);
  useEffect(() => {
    setLiveCount(140 + Math.floor(Math.random() * 80));
  }, []);

  return (
    <div className="relative min-h-screen" onMouseMove={spotlight.onMove}>
      <AuroraBackground />

      {/* Spotlight cursor glow */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: spotlight.bg }}
      />

      <TopNav />

      {/* ===== HERO ===== */}
      <section id="oyna" className="relative z-10 pt-32 pb-16 lg:pt-36 lg:pb-24 px-6">
        <div className="relative mx-auto w-full max-w-7xl grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
          {/* LEFT: Hero copy + Form */}
          <motion.div initial="hidden" animate="visible" className="flex flex-col justify-center max-w-2xl">
            {/* Live players chip */}
            <motion.div variants={fadeUp} custom={0} className="mb-7 flex">
              <a
                href="#topluluk"
                className="group inline-flex items-center gap-2 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] px-3 py-1.5 text-xs font-medium text-slate-300 transition-all backdrop-blur"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-slate-200 font-semibold tabular-nums">
                  {liveCount ?? '—'}
                </span>
                <span className="text-slate-500">oyuncu şu an aktif</span>
                <svg className="w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              custom={0.06}
              className="mb-4 text-[44px] sm:text-6xl xl:text-7xl font-extrabold leading-[0.95] tracking-[-0.035em] text-slate-50"
            >
              Çiz, Tahmin Et,{' '}
              <span className="relative inline-block">
                <span className="text-gradient">Eğlen.</span>
                <motion.svg
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.8, ease: EASE }}
                  className="absolute -bottom-3 left-0 w-full"
                  viewBox="0 0 220 10"
                  fill="none"
                >
                  <motion.path
                    d="M 4 6 Q 110 -2 216 6"
                    stroke="url(#underlineGrad)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="underlineGrad" x1="0" y1="0" x2="220" y2="0">
                      <stop offset="0" stopColor="#6366f1" />
                      <stop offset="0.5" stopColor="#22d3ee" />
                      <stop offset="1" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </motion.svg>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              custom={0.12}
              className="mb-8 max-w-lg text-base sm:text-lg leading-relaxed text-slate-400"
            >
              Arkadaşlarınla saniyeler içinde oyna. Kayıt yok, indirme yok, reklam yok — tamamen{' '}
              <span className="text-slate-200 font-semibold">ücretsiz</span>.
            </motion.p>

            {/* Setup Card */}
            <motion.div variants={scaleUp} custom={0.18} className="max-w-md w-full">
              <PlayerSetup
                playerName={playerName}
                setPlayerName={setPlayerName}
                roomCode={roomCode}
                setRoomCode={setRoomCode}
                selectedAvatar={selectedAvatar}
                setSelectedAvatar={setSelectedAvatar}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                hasSaved={hasSaved}
                onCreate={handleCreate}
                onJoin={handleJoin}
              />
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={fadeUp}
              custom={0.3}
              className="mt-6 flex items-center gap-4 text-xs text-slate-500"
            >
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Güvenli bağlantı
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                &lt;100ms gecikme
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: Animated Preview */}
          <HeroDemo />
        </div>
      </section>

      {/* ===== MARQUEE ===== */}
      <Marquee />

      {/* ===== STATS ===== */}
      <StatsRow />

      {/* ===== GAME DEMO ===== */}
      <GameDemo />

      {/* ===== BENTO FEATURES ===== */}
      <BentoFeatures />

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />

      {/* ===== BIG CTA ===== */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-32 pt-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="relative overflow-hidden rounded-[32px] p-10 sm:p-16 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.06) 50%, rgba(16,185,129,0.08))',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Animated orbs inside CTA */}
          <motion.div
            animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/15 blur-3xl"
          />

          <motion.div variants={fadeUp} custom={0} className="relative mb-4 flex justify-center">
            <span className="chip">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Hazır mısın?
            </span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={0.06}
            className="relative mb-4 text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-[-0.03em] text-slate-50"
          >
            Hadi <span className="text-gradient">Oynayalım!</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={0.12}
            className="relative mx-auto mb-10 max-w-lg text-base text-slate-400 leading-relaxed"
          >
            Arkadaşlarını topla, bir oda oluştur ve eğlenceye başla. Tek gereken bir tarayıcı.
          </motion.p>

          <motion.div variants={fadeUp} custom={0.2} className="relative flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => {
                document.getElementById('oyna')?.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => {
                  const input = document.querySelector<HTMLInputElement>('input[placeholder^="örn"]');
                  input?.focus();
                }, 600);
              }}
              className="group relative overflow-hidden inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-8 h-14 text-base font-bold text-white shadow-[0_12px_32px_rgba(99,102,241,0.35)] hover:shadow-[0_16px_40px_rgba(99,102,241,0.5)] transition-all active:scale-[0.98]"
            >
              <span className="relative z-10 flex items-center gap-2">
                Şimdi Oyna
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <motion.span
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
                animate={{ x: ['0%', '500%'] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
              />
            </button>
            <a
              href="/profil"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] px-6 h-14 text-base font-semibold text-slate-200 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all"
            >
              İstatistiklerim
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-white/[0.05] py-10">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-cyan-400 to-emerald-400 p-[1.5px]">
              <div className="w-full h-full rounded-[7px] bg-[#04070d] flex items-center justify-center">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M4 18c4-8 12-10 16-4" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <span className="text-sm font-semibold text-slate-300">Karalama</span>
            <span className="text-xs text-slate-600">— Arkadaşlarınla eğlencenin adresi</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="#ozellikler" className="hover:text-slate-300 transition-colors">Özellikler</a>
            <a href="#nasil" className="hover:text-slate-300 transition-colors">Oyun Akışı</a>
            <a href="/profil" className="hover:text-slate-300 transition-colors">Profil</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
