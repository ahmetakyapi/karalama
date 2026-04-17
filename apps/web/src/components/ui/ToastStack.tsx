'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAchievementsStore, type Achievement } from '@/stores/achievementsStore';
import { useProgressStore } from '@/stores/progressStore';
import { playSfx } from '@/hooks/useSoundEffects';

interface Toast {
  id: string;
  kind: 'achievement' | 'levelUp' | 'info' | 'success' | 'warn';
  title: string;
  body?: string;
  icon?: string;
  tier?: Achievement['tier'];
  duration?: number;
}

type ToastHandler = (t: Omit<Toast, 'id'>) => void;

let registered: ToastHandler | null = null;

export function pushToast(t: Omit<Toast, 'id'>) {
  if (registered) registered(t);
}

const TIER_STYLE: Record<Achievement['tier'], { ring: string; bg: string; glow: string }> = {
  bronze: { ring: 'ring-amber-700/50', bg: 'from-amber-800/70 to-amber-900/70', glow: 'rgba(180,83,9,0.3)' },
  silver: { ring: 'ring-slate-300/50', bg: 'from-slate-400/60 to-slate-600/70', glow: 'rgba(203,213,225,0.3)' },
  gold: { ring: 'ring-amber-300/60', bg: 'from-amber-400/70 to-yellow-600/70', glow: 'rgba(251,191,36,0.4)' },
  platinum: { ring: 'ring-cyan-300/60', bg: 'from-cyan-400/70 to-violet-500/70', glow: 'rgba(34,211,238,0.4)' },
};

export function ToastStack() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { queue, dismissFirst } = useAchievementsStore();
  const level = useProgressStore((s) => s.level);
  const [lastLevel, setLastLevel] = useState(level);

  useEffect(() => {
    registered = (t) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((list) => [...list, { ...t, id }]);
      const duration = t.duration ?? 4500;
      setTimeout(() => {
        setToasts((list) => list.filter((x) => x.id !== id));
      }, duration);
    };
    return () => {
      registered = null;
    };
  }, []);

  // Drain achievement queue
  useEffect(() => {
    if (queue.length === 0) return;
    const ach = queue[0];
    pushToast({
      kind: 'achievement',
      title: ach.title,
      body: ach.description,
      icon: ach.icon,
      tier: ach.tier,
      duration: 5000,
    });
    try { playSfx('achievement'); } catch {}
    dismissFirst();
  }, [queue, dismissFirst]);

  // Level-up detection
  useEffect(() => {
    if (level > lastLevel) {
      pushToast({
        kind: 'levelUp',
        title: `Seviye ${level}!`,
        body: 'Yeni seviyeye ulaştın',
        icon: '⭐',
        duration: 4000,
      });
      try { playSfx('levelUp'); } catch {}
      setLastLevel(level);
    } else if (level < lastLevel) {
      setLastLevel(level);
    }
  }, [level, lastLevel]);

  return (
    <div className="fixed top-3 right-3 z-[100] flex flex-col gap-2 max-w-[340px] pointer-events-none">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const tierStyle = t.tier ? TIER_STYLE[t.tier] : null;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="pointer-events-auto relative overflow-hidden rounded-xl border border-white/10 backdrop-blur-lg"
              style={{
                background: tierStyle
                  ? `linear-gradient(135deg, ${tierStyle.glow}, rgba(10,16,33,0.92))`
                  : t.kind === 'levelUp'
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(10,16,33,0.92))'
                    : 'rgba(10,16,33,0.92)',
                boxShadow: tierStyle
                  ? `0 10px 30px ${tierStyle.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`
                  : '0 10px 30px rgba(0,0,0,0.4)',
              }}
            >
              {/* Shimmer highlight for achievement / level-up */}
              {(t.kind === 'achievement' || t.kind === 'levelUp') && (
                <div className="absolute inset-0 shimmer-bg pointer-events-none" />
              )}
              <div className="relative flex items-start gap-3 p-3.5">
                <div
                  className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                    tierStyle ? `ring-2 ${tierStyle.ring} bg-gradient-to-br ${tierStyle.bg}` : 'bg-white/10'
                  }`}
                >
                  {t.icon || (t.kind === 'levelUp' ? '⭐' : '🔔')}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-wider font-bold text-white/50 mb-0.5">
                    {t.kind === 'achievement' ? 'Başarım Açıldı' : t.kind === 'levelUp' ? 'Seviye Atladın' : ''}
                  </p>
                  <p className="text-sm font-bold text-white leading-tight truncate">{t.title}</p>
                  {t.body && <p className="text-xs text-white/60 mt-0.5 leading-snug">{t.body}</p>}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
