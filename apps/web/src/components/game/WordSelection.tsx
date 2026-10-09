'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { getSocket } from '@/lib/socket';
import { easeCurve } from '@/styles/animations';

const difficultyLabels: Record<number, { text: string; variant: 'success' | 'warning' | 'danger' }> = {
  1: { text: 'Kolay', variant: 'success' },
  2: { text: 'Orta', variant: 'warning' },
  3: { text: 'Zor', variant: 'danger' },
};

export function WordSelection() {
  const { wordOptions, timeLeft } = useGameStore();

  if (wordOptions.length === 0) return null;

  const handleSelect = (word: string) => {
    getSocket().emit('game:wordSelected', { word });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl"
    >
      <div className="text-center p-6">
        <motion.p
          initial={{ opacity: 0, y: 10, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.6, ease: easeCurve }}
          className="font-hand text-4xl font-bold text-[var(--marker)]"
        >
          Sıra sende!
        </motion.p>
        <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
          Bir kelime seç · <span className="tabular-nums text-white/80">{timeLeft}s</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {wordOptions.map((opt, i) => {
            const diff = difficultyLabels[opt.difficulty];
            return (
              <motion.div
                key={opt.word}
                initial={{ opacity: 0, y: 40, rotate: (i - 1) * 6 }}
                animate={{ opacity: 1, y: 0, rotate: (i - 1) * 2 }}
                whileHover={{ y: -6, rotate: 0, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: i * 0.08 }}
              >
                <GlassCard
                  hoverable
                  className="p-4 cursor-pointer min-w-[120px]"
                  onClick={() => handleSelect(opt.word)}
                >
                  <p className="font-display text-2xl font-bold tracking-[-0.03em] text-white mb-2">
                    {opt.word}
                  </p>
                  <Badge variant={diff.variant}>{diff.text}</Badge>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
