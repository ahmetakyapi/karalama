'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="word-pick-title"
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm lg:absolute lg:rounded-xl"
    >
      <div className="text-center p-6">
        <motion.h2
          id="word-pick-title"
          initial={{ opacity: 0, y: 10, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ duration: 0.6, ease: easeCurve }}
          className="font-hand text-4xl font-bold text-[var(--marker)]"
        >
          Sıra Sende!
        </motion.h2>
        <p className="mb-5 mt-1 text-sm font-medium text-slate-300">
          Bir kelime seç · <span className="tabular-nums text-white">{timeLeft} sn</span>
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {wordOptions.map((opt, i) => {
            const diff = difficultyLabels[opt.difficulty];
            return (
              <motion.button
                key={opt.word}
                type="button"
                autoFocus={i === 0}
                onClick={() => handleSelect(opt.word)}
                initial={{ opacity: 0, y: 40, rotate: (i - 1) * 6 }}
                animate={{ opacity: 1, y: 0, rotate: (i - 1) * 2 }}
                whileHover={{ y: -6, rotate: 0, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: i * 0.08 }}
                className="glass min-w-[120px] p-4 text-center transition-colors duration-500 ease-custom hover:border-white/[0.15]"
              >
                <span className="mb-2 block font-display text-2xl font-bold tracking-[-0.03em] text-white">
                  {opt.word}
                </span>
                <Badge variant={diff.variant}>{diff.text}</Badge>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
