'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { EASE } from './common';

const HERO_STEPS = [
  { id: 'lobby', label: 'Lobi', icon: '🚪' },
  { id: 'draw', label: 'Çiz', icon: '✏️' },
  { id: 'guess', label: 'Tahmin', icon: '💬' },
  { id: 'winners', label: 'Podyum', icon: '🏆' },
] as const;

export default function HeroDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % 4), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="intro-pop relative flex flex-col mt-8 lg:mt-0"
      style={{ ['--d' as string]: '0.45s' }}
      aria-label="Oyun önizlemesi"
    >
      {/* Rotating sticker */}
      <div className="pointer-events-none absolute -right-3 -top-8 z-30 hidden sm:block">
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <path id="sticker-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <text className="fill-slate-300 font-mono text-[9.5px] uppercase tracking-[0.32em]">
              <textPath href="#sticker-circle">canlı önizleme • canlı önizleme •</textPath>
            </text>
          </svg>
          <div className="absolute inset-[30%] flex items-center justify-center rounded-full bg-[var(--marker)] text-lg text-[#04070d] shadow-[0_0_30px_rgba(200,245,96,0.35)]">
            ✎
          </div>
        </div>
      </div>
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
    </div>
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
              <span className="text-[9px] font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded-md">KURUCU</span>
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
        <svg aria-hidden="true" viewBox="0 0 300 200" className="w-full h-full" fill="none">
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
        <svg aria-hidden="true" viewBox="0 0 200 80" className="w-40 h-16" fill="none">
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
