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
        <p className="text-slate-400 text-sm">
          {isDrawer ? 'Bir kelime seç…' : 'Çizen oyuncu kelime seçiyor…'}
        </p>
      </div>
    );
  }

  if (!hint) return null;

  const chars = hint.split(' ');
  const letters = chars.filter((c) => c !== '').length;

  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex flex-wrap items-end justify-center gap-1" aria-label={`${letters} harfli kelime`}>
        {chars.map((ch, i) => {
          if (ch === '') {
            return <div key={i} className="w-3" />;
          }
          const isRevealed = ch !== '_';
          return (
            <span key={i} className="relative flex h-8 w-6 items-end justify-center sm:w-7">
              {isRevealed && (
                <motion.span
                  initial={{ y: -10, opacity: 0, rotate: -12 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 18 }}
                  className="mb-1 font-display text-lg font-extrabold uppercase leading-none text-slate-50"
                >
                  {ch}
                </motion.span>
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0.5 bottom-0 h-[3px] rounded-full',
                  isRevealed ? 'bg-[var(--marker)]' : 'bg-slate-500/60'
                )}
                style={{ rotate: `${((i * 53) % 7) - 3}deg` }}
              />
            </span>
          );
        })}
      </div>
      <span className="font-hand text-lg leading-none text-slate-400">{letters} harf</span>
    </div>
  );
}
