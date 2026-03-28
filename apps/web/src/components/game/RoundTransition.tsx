'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { easeCurve } from '@/styles/animations';
import { Avatar } from '@/components/ui/Avatar';
import { CANVAS_WIDTH, CANVAS_HEIGHT, type DrawStroke, type DrawPoint } from '@karalama/shared';

const MEDALS = ['🥇', '🥈', '🥉'] as const;

function AnimatedScore({ target, duration = 1.2 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCurrent(Math.round(eased * target));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);

  return <>{current}</>;
}

function MiniReplay({ strokes }: { strokes: DrawStroke[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || strokes.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let strokeIdx = 0;
    const totalTime = 2000; // replay in 2 seconds
    const interval = totalTime / strokes.length;

    const timer = setInterval(() => {
      if (strokeIdx >= strokes.length) {
        clearInterval(timer);
        return;
      }
      const s = strokes[strokeIdx];
      if (s.points.length >= 2) {
        ctx.save();
        if (s.tool === 'eraser') {
          ctx.globalCompositeOperation = 'destination-out';
        }
        ctx.strokeStyle = s.color;
        ctx.lineWidth = s.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(s.points[0].x * CANVAS_WIDTH, s.points[0].y * CANVAS_HEIGHT);
        for (let i = 1; i < s.points.length; i++) {
          ctx.lineTo(s.points[i].x * CANVAS_WIDTH, s.points[i].y * CANVAS_HEIGHT);
        }
        ctx.stroke();
        ctx.restore();
      }
      strokeIdx++;
    }, interval);

    return () => clearInterval(timer);
  }, [strokes]);

  if (strokes.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="w-32 h-24 rounded-lg overflow-hidden border border-white/[0.08] bg-white/[0.02] mb-3"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </motion.div>
  );
}

export function RoundTransition() {
  const { phase, lastRoundData, players, playerId, currentRound, totalRounds, drawHistory } =
    useGameStore();

  const show = phase === 'ROUND_RESULT' && !!lastRoundData;

  const sortedEntries = show
    ? Object.entries(lastRoundData!.roundScores).sort(([, a], [, b]) => b - a)
    : [];

  const nobodyGuessed = sortedEntries.length === 0;
  const progressPercent = show ? (currentRound / totalRounds) * 100 : 0;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="round-transition-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: easeCurve }}
          className="absolute inset-0 z-40 flex items-center justify-center overflow-hidden rounded-xl"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#04070d]/85 backdrop-blur-xl" />

          {/* Ambient glow effects */}
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-emerald-500/8 rounded-full blur-[80px] pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6 py-8">

            {/* Mini Replay */}
            <MiniReplay strokes={drawHistory} />

            {/* Revealed Word Section */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeCurve }}
              className="text-center mb-8"
            >
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/30 font-medium">
                Kelime
              </span>

              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.7,
                  delay: 0.25,
                  ease: easeCurve,
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                }}
                className="mt-2"
              >
                <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-300 to-emerald-400 bg-clip-text text-transparent leading-tight">
                  {lastRoundData!.word}
                </h2>

                {/* Glow pulse behind the word */}
                <motion.div
                  className="absolute inset-0 mx-auto -mt-4 w-40 h-12 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>

              {/* Decorative divider */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.5, ease: easeCurve }}
                className="mt-5 mx-auto h-px w-48 bg-gradient-to-r from-transparent via-white/15 to-transparent origin-center"
              />
            </motion.div>

            {/* Score Cards or Nobody Guessed */}
            {nobodyGuessed ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6, ease: easeCurve }}
                className="flex flex-col items-center gap-3 py-6"
              >
                <span className="text-5xl">🤷</span>
                <p className="text-lg font-semibold text-white/60">
                  Kimse Bilemedi!
                </p>
                <p className="text-sm text-white/30">
                  Bu tur kimse doğru tahmin edemedi
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: { staggerChildren: 0.1, delayChildren: 0.55 },
                  },
                }}
                className="w-full space-y-2"
              >
                {sortedEntries.map(([id, roundScore], index) => {
                  const player = players[id];
                  if (!player) return null;

                  const totalScore = lastRoundData!.scores[id] ?? player.score;
                  const isMe = id === playerId;
                  const medal = index < 3 ? MEDALS[index] : null;

                  return (
                    <motion.div
                      key={id}
                      variants={{
                        hidden: { opacity: 0, x: -40 },
                        visible: {
                          opacity: 1,
                          x: 0,
                          transition: { duration: 0.5, ease: easeCurve },
                        },
                      }}
                      className="relative group"
                    >
                      {/* Card glow based on avatar color */}
                      <div
                        className="absolute inset-0 rounded-xl opacity-[0.07] blur-sm pointer-events-none"
                        style={{ backgroundColor: player.avatarColor }}
                      />

                      <div
                        className={`
                          relative flex items-center gap-3 px-4 py-3 rounded-xl
                          bg-white/[0.04] backdrop-blur-md
                          border transition-colors
                          ${isMe
                            ? 'border-indigo-500/40 bg-indigo-500/[0.06]'
                            : 'border-white/[0.06]'
                          }
                        `}
                      >
                        {/* Rank */}
                        <div className="w-7 text-center flex-shrink-0">
                          {medal ? (
                            <span className="text-lg">{medal}</span>
                          ) : (
                            <span className="text-sm font-mono text-white/25">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar
                          name={player.name}
                          color={player.avatarColor}
                          size="sm"
                        />

                        {/* Name */}
                        <span
                          className={`flex-1 text-sm font-medium truncate ${
                            isMe ? 'text-white' : 'text-white/80'
                          }`}
                        >
                          {player.name}
                          {isMe && (
                            <span className="ml-1.5 text-[10px] text-indigo-400/70 uppercase tracking-wider">
                              sen
                            </span>
                          )}
                        </span>

                        {/* Round score */}
                        <span className="text-emerald-400 font-bold font-mono text-sm tabular-nums">
                          +<AnimatedScore target={roundScore} duration={1.0 + index * 0.15} />
                        </span>

                        {/* Separator dot */}
                        <span className="text-white/10">|</span>

                        {/* Total score */}
                        <span className="text-white/40 font-mono text-xs tabular-nums w-12 text-right">
                          <AnimatedScore target={totalScore} duration={1.4 + index * 0.15} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Round progress */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9, ease: easeCurve }}
              className="mt-8 w-full"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-[0.15em] text-white/25 font-medium">
                  İlerleme
                </span>
                <span className="text-xs font-mono text-white/40">
                  Tur {currentRound} / {totalRounds}
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, delay: 1.1, ease: easeCurve }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
