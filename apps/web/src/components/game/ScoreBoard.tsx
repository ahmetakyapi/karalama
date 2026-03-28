'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1] as const;

export function ScoreBoard() {
  const { players, scores, currentDrawerId, guessedPlayerIds, playerId, lastRoundData } =
    useGameStore();

  const sorted = Object.values(players).sort(
    (a, b) => (scores[b.id] || 0) - (scores[a.id] || 0)
  );

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="px-3 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
          Skor Tablosu
        </h3>
        <span className="text-[10px] text-white/20 font-mono">
          {sorted.length} oyuncu
        </span>
      </div>
      <div className="p-1.5 space-y-0.5">
        <AnimatePresence mode="popLayout">
          {sorted.map((player, i) => {
            const isDrawer = player.id === currentDrawerId;
            const hasGuessed = guessedPlayerIds.includes(player.id);
            const isMe = player.id === playerId;
            const roundScore = lastRoundData?.roundScores?.[player.id];
            const score = scores[player.id] || 0;

            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: EASE, delay: i * 0.03 }}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm transition-colors duration-300',
                  isDrawer && 'bg-indigo-500/[0.08] border border-indigo-500/20',
                  hasGuessed && !isDrawer && 'bg-emerald-500/[0.08] border border-emerald-500/20',
                  isMe && !isDrawer && !hasGuessed && 'bg-white/[0.03] border border-white/[0.08]',
                  !isDrawer && !hasGuessed && !isMe && 'border border-transparent'
                )}
              >
                {/* Rank */}
                <div className="w-5 flex items-center justify-center shrink-0">
                  {i === 0 && score > 0 ? (
                    <span className="text-amber-400 text-xs">👑</span>
                  ) : (
                    <span className="text-[11px] text-white/25 font-mono font-bold">
                      {i + 1}
                    </span>
                  )}
                </div>

                {/* Avatar */}
                <Avatar name={player.name} color={player.avatarColor} size="sm" />

                {/* Name + Status */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      'truncate text-xs font-medium',
                      isMe ? 'text-white' : 'text-white/70'
                    )}>
                      {player.name}
                    </span>
                    {isMe && (
                      <span className="text-[9px] text-white/20 font-medium">(sen)</span>
                    )}
                  </div>
                  {isDrawer && (
                    <span className="text-[10px] text-indigo-400 font-medium">Çiziyor ✏️</span>
                  )}
                  {hasGuessed && !isDrawer && (
                    <span className="text-[10px] text-emerald-400 font-medium">Bildi ✓</span>
                  )}
                </div>

                {/* Score */}
                <div className="flex flex-col items-end shrink-0">
                  <motion.span
                    key={score}
                    initial={{ scale: 1.3, color: '#22d3ee' }}
                    animate={{ scale: 1, color: 'rgba(255,255,255,0.7)' }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="font-mono text-xs font-bold"
                  >
                    {score}
                  </motion.span>
                  <AnimatePresence>
                    {roundScore && roundScore > 0 && (
                      <motion.span
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-[10px] font-mono font-bold text-emerald-400"
                      >
                        +{roundScore}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
