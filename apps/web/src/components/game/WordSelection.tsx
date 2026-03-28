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
        <p className="text-white/50 text-sm mb-2">
          Bir kelime seç ({timeLeft}s)
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {wordOptions.map((opt, i) => {
            const diff = difficultyLabels[opt.difficulty];
            return (
              <motion.div
                key={opt.word}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, ease: easeCurve }}
              >
                <GlassCard
                  hoverable
                  className="p-4 cursor-pointer min-w-[120px]"
                  onClick={() => handleSelect(opt.word)}
                >
                  <p className="text-lg font-bold text-white mb-1">
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
