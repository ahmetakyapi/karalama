'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { GlassCard } from '@/components/ui/GlassCard';
import { getSocket } from '@/lib/socket';
import { easeCurve } from '@/styles/animations';
import { useProgressStore, getXPForNextLevel } from '@/stores/progressStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type EaseCurve = typeof easeCurve;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const CONFETTI_COUNT = 60;
const CONFETTI_COLORS = [
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#a855f7', // purple
  '#f43f5e', // rose
];

const PODIUM_CONFIG = [
  { orderIdx: 1, label: '2', height: 120, gradient: 'from-slate-400 to-slate-500', glowColor: '#94a3b8', ringColor: 'ring-slate-400/40' },
  { orderIdx: 0, label: '1', height: 160, gradient: 'from-amber-400 to-yellow-500', glowColor: '#f59e0b', ringColor: 'ring-amber-400/40' },
  { orderIdx: 2, label: '3', height: 90, gradient: 'from-orange-500 to-amber-700', glowColor: '#c2410c', ringColor: 'ring-orange-500/40' },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ---------------------------------------------------------------------------
// Animated counter hook
// ---------------------------------------------------------------------------
function AnimatedScore({ value, delay = 0 }: { value: number; delay?: number }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(mv, value, {
        duration: 1.4,
        ease: easeCurve as unknown as [number, number, number, number],
      });
      return () => controls.stop();
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [mv, value, delay]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => setDisplay(v));
    return unsubscribe;
  }, [rounded]);

  return <span>{display}</span>;
}

// ---------------------------------------------------------------------------
// Confetti particle
// ---------------------------------------------------------------------------
function ConfettiParticle({ index }: { index: number }) {
  const style = useMemo(() => {
    const left = randomBetween(0, 100);
    const size = randomBetween(4, 10);
    const duration = randomBetween(3, 7);
    const delay = randomBetween(0, 4);
    const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
    const isCircle = Math.random() > 0.5;
    const rotation = randomBetween(0, 360);
    const swayAmount = randomBetween(-60, 60);

    return { left, size, duration, delay, color, isCircle, rotation, swayAmount };
  }, [index]);

  return (
    <motion.div
      className="absolute top-0 pointer-events-none"
      style={{
        left: `${style.left}%`,
        width: style.size,
        height: style.isCircle ? style.size : style.size * 2.5,
        backgroundColor: style.color,
        borderRadius: style.isCircle ? '50%' : '2px',
        rotate: style.rotation,
      }}
      initial={{ y: -20, opacity: 1, x: 0 }}
      animate={{
        y: '110vh',
        opacity: [1, 1, 1, 0.6, 0],
        x: [0, style.swayAmount, -style.swayAmount / 2, style.swayAmount / 3],
        rotate: style.rotation + randomBetween(180, 720),
      }}
      transition={{
        duration: style.duration,
        delay: style.delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Trophy SVG
// ---------------------------------------------------------------------------
function TrophySVG() {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Glow filter */}
      <defs>
        <linearGradient id="trophyGold" x1="30" y1="10" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="trophyShine" x1="40" y1="15" x2="80" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Cup body */}
      <path
        d="M35 25 H85 L78 65 C76 75 68 82 60 82 C52 82 44 75 42 65 Z"
        fill="url(#trophyGold)"
        filter="url(#glow)"
      />
      {/* Shine overlay */}
      <path
        d="M42 28 H58 L54 62 C53 68 52 72 50 72 C48 72 46 68 45 62 Z"
        fill="url(#trophyShine)"
        opacity="0.4"
      />
      {/* Left handle */}
      <path
        d="M35 30 C20 30 15 45 20 55 C24 62 32 62 35 55"
        stroke="url(#trophyGold)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right handle */}
      <path
        d="M85 30 C100 30 105 45 100 55 C96 62 88 62 85 55"
        stroke="url(#trophyGold)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Stem */}
      <rect x="54" y="82" width="12" height="12" rx="2" fill="url(#trophyGold)" />
      {/* Base */}
      <rect x="40" y="94" width="40" height="8" rx="4" fill="url(#trophyGold)" />
      {/* Star on cup */}
      <path
        d="M60 40 L63 50 L73 50 L65 56 L68 66 L60 60 L52 66 L55 56 L47 50 L57 50 Z"
        fill="#fef3c7"
        opacity="0.7"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Crown icon for winner
// ---------------------------------------------------------------------------
function CrownIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M2 18 L4 8 L8 12 L12 4 L16 12 L20 8 L22 18 Z"
        fill="#fbbf24"
        stroke="#d97706"
        strokeWidth="1"
      />
      <circle cx="4" cy="8" r="1.5" fill="#fbbf24" />
      <circle cx="12" cy="4" r="1.5" fill="#fbbf24" />
      <circle cx="20" cy="8" r="1.5" fill="#fbbf24" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Sparkle component
// ---------------------------------------------------------------------------
function Sparkle({ delay, x, y }: { delay: number; x: string; y: string }) {
  return (
    <motion.div
      className="absolute w-1.5 h-1.5 bg-amber-300 rounded-full"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 1.5,
        delay,
        repeat: Infinity,
        repeatDelay: randomBetween(0.5, 2),
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function GameOverScreen() {
  const { podium, players, scores, playerId, hostId } = useGameStore();
  const isHost = playerId === hostId;
  const containerRef = useRef<HTMLDivElement>(null);

  const { xp, level, gamesPlayed, totalCorrectGuesses, currentStreak, bestStreak } = useProgressStore();
  const xpForNext = getXPForNextLevel(level);
  const xpPercent = Math.min((xp / xpForNext) * 100, 100);

  const handleBackToLobby = () => {
    getSocket().emit('game:backToLobby');
  };

  const sortedPlayers = useMemo(
    () =>
      Object.values(players).sort(
        (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
      ),
    [players, scores]
  );

  // Derive fun stats from the available data
  const stats = useMemo(() => {
    const entries = Object.values(players);
    if (entries.length === 0) return [];

    const topScorer = entries.reduce((best, p) =>
      (scores[p.id] || 0) > (scores[best.id] || 0) ? p : best
    );

    const result: { label: string; value: string; icon: string }[] = [];

    result.push({
      label: 'En Yüksek Skor',
      value: `${topScorer.name} (${scores[topScorer.id] || 0})`,
      icon: '\u{1F3AF}',
    });

    if (entries.length >= 2) {
      const sorted = [...entries].sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0));
      const diff = (scores[sorted[0].id] || 0) - (scores[sorted[1].id] || 0);
      result.push({
        label: 'Fark',
        value: diff === 0 ? 'Başabaş!' : `${diff} puan`,
        icon: '\u{26A1}',
      });
    }

    const totalScore = entries.reduce((sum, p) => sum + (scores[p.id] || 0), 0);
    result.push({
      label: 'Toplam Puan',
      value: `${totalScore}`,
      icon: '\u{1F4CA}',
    });

    result.push({
      label: 'Oyuncu Sayısı',
      value: `${entries.length}`,
      icon: '\u{1F465}',
    });

    return result;
  }, [players, scores]);

  const winner = podium[0];

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-start px-4 py-6 relative overflow-hidden"
    >
      {/* ---- Animated background gradients ---- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-accent-indigo/15 rounded-full blur-[140px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[15%] w-[400px] h-[400px] bg-accent-emerald/12 rounded-full blur-[120px]"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.12, 0.2, 0.12],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-[40%] right-[30%] w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[100px]"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.18, 0.1],
          }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      {/* ---- Confetti ---- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}
      </div>

      {/* ---- Main content ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-2xl flex flex-col items-center"
      >
        {/* ---- Title ---- */}
        <motion.h1
          initial={{ opacity: 0, y: -30, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: easeCurve as unknown as EaseCurve }}
          className="text-5xl sm:text-6xl font-extrabold text-center mb-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg"
        >
          Oyun Bitti!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-white/40 text-sm mb-6"
        >
          Skor tablosu aşağıda
        </motion.p>

        {/* ---- Trophy + Winner ---- */}
        {winner && (
          <motion.div
            className="relative flex flex-col items-center mb-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3,
              duration: 0.8,
              type: 'spring',
              stiffness: 200,
              damping: 12,
            }}
          >
            {/* Golden glow behind trophy */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                className="w-40 h-40 bg-amber-400/20 rounded-full blur-[60px]"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {/* Sparkles around trophy */}
            <div className="absolute inset-0 w-32 h-32 mx-auto">
              <Sparkle delay={0} x="5%" y="20%" />
              <Sparkle delay={0.3} x="85%" y="15%" />
              <Sparkle delay={0.6} x="90%" y="60%" />
              <Sparkle delay={0.9} x="10%" y="70%" />
              <Sparkle delay={1.2} x="50%" y="5%" />
              <Sparkle delay={0.5} x="70%" y="80%" />
            </div>

            <div className="w-28 h-28 relative z-10">
              <TrophySVG />
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5, ease: easeCurve as unknown as EaseCurve }}
              className="text-amber-300 font-bold text-lg mt-2"
            >
              {winner.playerName} kazandı!
            </motion.p>
          </motion.div>
        )}

        {/* ---- Podium ---- */}
        {podium.length > 0 && (
          <div className="flex items-end justify-center gap-4 sm:gap-6 mb-10 w-full max-w-md">
            {PODIUM_CONFIG.map((config, visualIdx) => {
              const entry = podium[config.orderIdx];
              if (!entry) {
                return <div key={config.orderIdx} className="flex-1" />;
              }

              const isWinner = config.orderIdx === 0;

              return (
                <motion.div
                  key={entry.playerId}
                  className="flex flex-col items-center flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 0.6 + visualIdx * 0.2,
                    duration: 0.5,
                    ease: easeCurve as unknown as EaseCurve,
                  }}
                >
                  {/* Avatar area */}
                  <motion.div
                    className="relative mb-2"
                    initial={{ opacity: 0, y: 30, scale: 0.5 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 1.2 + visualIdx * 0.15,
                      duration: 0.6,
                      type: 'spring',
                      stiffness: 300,
                      damping: 15,
                    }}
                  >
                    {isWinner && (
                      <motion.div
                        className="absolute -top-5 left-1/2 -translate-x-1/2 z-20"
                        initial={{ opacity: 0, y: -10, rotate: -15 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{ delay: 1.8, duration: 0.5, type: 'spring' }}
                      >
                        <CrownIcon className="w-7 h-7" />
                      </motion.div>
                    )}
                    <div className={`rounded-full ring-2 ${config.ringColor} p-0.5`}>
                      <Avatar
                        name={entry.playerName}
                        color={entry.avatarColor}
                        size="lg"
                      />
                    </div>
                  </motion.div>

                  {/* Name */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.4 + visualIdx * 0.1 }}
                    className="text-sm font-semibold text-white/90 mb-0.5 text-center truncate max-w-[80px]"
                  >
                    {entry.playerName}
                  </motion.p>

                  {/* Animated score */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 + visualIdx * 0.1 }}
                    className="text-xs font-mono font-bold text-accent-cyan mb-2"
                  >
                    <AnimatedScore value={entry.score} delay={1.6 + visualIdx * 0.15} />
                    <span className="text-white/30 ml-1">puan</span>
                  </motion.p>

                  {/* Podium bar */}
                  <motion.div
                    className={`w-full rounded-t-xl bg-gradient-to-t ${config.gradient} relative overflow-hidden`}
                    initial={{ height: 0 }}
                    animate={{ height: config.height }}
                    transition={{
                      delay: 0.8 + visualIdx * 0.2,
                      duration: 0.8,
                      ease: easeCurve as unknown as EaseCurve,
                    }}
                  >
                    {/* Shine overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      transition={{
                        delay: 1.8 + visualIdx * 0.2,
                        duration: 1,
                        ease: 'easeInOut',
                      }}
                    />
                    {/* Rank label */}
                    <div className="flex items-start justify-center pt-3">
                      <span className="text-2xl font-extrabold text-white/90 drop-shadow-md">
                        {config.label}.
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ---- Full Scoreboard ---- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.6, ease: easeCurve as unknown as EaseCurve }}
          className="w-full mb-6"
        >
          <GlassCard className="p-5" glowColor="rgba(99, 102, 241, 0.08)">
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
              Skor Tablosu
            </h2>
            <div className="space-y-1.5">
              {sortedPlayers.map((player, i) => {
                const isCurrentPlayer = player.id === playerId;
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 2.2 + i * 0.08,
                      duration: 0.4,
                      ease: easeCurve as unknown as EaseCurve,
                    }}
                    className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-colors ${
                      isCurrentPlayer
                        ? 'bg-accent-indigo/15 border border-accent-indigo/20'
                        : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    {/* Rank */}
                    <span
                      className={`w-7 text-center font-mono font-bold text-sm ${
                        i === 0
                          ? 'text-amber-400'
                          : i === 1
                            ? 'text-slate-400'
                            : i === 2
                              ? 'text-orange-500'
                              : 'text-white/25'
                      }`}
                    >
                      {i + 1}
                    </span>

                    {/* Avatar */}
                    <Avatar
                      name={player.name}
                      color={player.avatarColor}
                      size="sm"
                    />

                    {/* Name */}
                    <span
                      className={`flex-1 text-sm font-medium ${
                        isCurrentPlayer ? 'text-white' : 'text-white/70'
                      }`}
                    >
                      {player.name}
                      {isCurrentPlayer && (
                        <span className="ml-1.5 text-xs text-accent-indigo/70">(Sen)</span>
                      )}
                    </span>

                    {/* Score */}
                    <span className="font-mono font-bold text-sm text-white/80">
                      <AnimatedScore value={scores[player.id] || 0} delay={2.4 + i * 0.1} />
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* ---- Fun Stats ---- */}
        {stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.5, ease: easeCurve as unknown as EaseCurve }}
            className="w-full mb-8"
          >
            <GlassCard className="p-5" glowColor="rgba(16, 185, 129, 0.06)">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                İstatistikler
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 2.8 + i * 0.1,
                      duration: 0.4,
                      ease: easeCurve as unknown as EaseCurve,
                    }}
                    className="flex items-start gap-2.5 bg-white/[0.03] rounded-lg p-3"
                  >
                    <span className="text-xl leading-none mt-0.5">{stat.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-white/40 mb-0.5">{stat.label}</p>
                      <p className="text-sm font-semibold text-white/80 truncate">
                        {stat.value}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* ---- Player Progress ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.5, ease: easeCurve as unknown as EaseCurve }}
          className="w-full mb-6"
        >
          <GlassCard className="p-5" glowColor="rgba(139, 92, 246, 0.06)">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">
                Seviye {level}
              </h2>
              <div className="flex items-center gap-2">
                {currentStreak > 1 && (
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    &#x1F525; {currentStreak} seri
                  </span>
                )}
                <span className="text-xs text-white/30 font-mono">
                  {xp}/{xpForNext} XP
                </span>
              </div>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1.2, delay: 3.2, ease: easeCurve as unknown as [number, number, number, number] }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-white/80">{gamesPlayed}</p>
                <p className="text-[10px] text-white/30 uppercase">Oyun</p>
              </div>
              <div>
                <p className="text-lg font-bold text-white/80">{totalCorrectGuesses}</p>
                <p className="text-[10px] text-white/30 uppercase">Bilinen</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">{bestStreak}</p>
                <p className="text-[10px] text-white/30 uppercase">En iyi seri</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* ---- Action Buttons ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.5, ease: easeCurve as unknown as EaseCurve }}
          className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
        >
          {isHost ? (
            <Button
              size="lg"
              variant="primary"
              onClick={handleBackToLobby}
              className="flex-1 relative overflow-hidden"
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              />
              <span className="relative">Tekrar Oyna</span>
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              onClick={handleBackToLobby}
              className="flex-1"
            >
              Lobiye Dön
            </Button>
          )}
        </motion.div>

        {/* Host hint */}
        {!isHost && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2 }}
            className="text-xs text-white/30 mt-3 text-center"
          >
            Yeni oyun başlatmak için oda sahibini bekleyin
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
