'use client';

import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function WordHint() {
  const { hint, phase, playerId, currentDrawerId } = useGameStore();
  const isDrawer = playerId === currentDrawerId;

  if (phase === 'PICKING') {
    return (
      <div className="text-center">
        <p className="text-white/40 text-sm">
          {isDrawer ? 'Bir kelime seç...' : 'Çizici kelime seçiyor...'}
        </p>
      </div>
    );
  }

  if (!hint) return null;

  const chars = hint.split(' ');

  return (
    <div className="flex items-center justify-center gap-1 flex-wrap">
      {chars.map((ch, i) => {
        if (ch === '') {
          return <div key={i} className="w-3" />;
        }
        const isRevealed = ch !== '_';
        return (
          <motion.div
            key={i}
            initial={isRevealed ? { scale: 1.3, color: '#22d3ee' } : {}}
            animate={isRevealed ? { scale: 1, color: '#f0f2f5' } : {}}
            className={cn(
              'w-7 h-8 flex items-center justify-center rounded-md text-sm font-bold font-mono',
              isRevealed
                ? 'bg-accent-indigo/20 text-white'
                : 'bg-white/[0.05] text-white/40'
            )}
          >
            {ch}
          </motion.div>
        );
      })}
    </div>
  );
}
