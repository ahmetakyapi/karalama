'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore, getXPForNextLevel } from '@/stores/progressStore';
import { useAchievementsStore, ACHIEVEMENTS, type Achievement } from '@/stores/achievementsStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { cn } from '@/lib/utils';

const TIER_COLORS: Record<Achievement['tier'], { border: string; bg: string; text: string }> = {
  bronze: { border: 'border-amber-700/60', bg: 'from-amber-800/20 to-amber-900/10', text: 'text-amber-400' },
  silver: { border: 'border-slate-300/60', bg: 'from-slate-400/20 to-slate-700/10', text: 'text-slate-200' },
  gold: { border: 'border-amber-300/60', bg: 'from-amber-400/20 to-yellow-700/10', text: 'text-amber-300' },
  platinum: { border: 'border-cyan-300/60', bg: 'from-cyan-400/20 to-violet-500/10', text: 'text-cyan-300' },
};

export default function ProfilPage() {
  const [mounted, setMounted] = useState(false);
  const { xp, level, gamesPlayed, totalCorrectGuesses, currentStreak, bestStreak } = useProgressStore();
  const { unlocked } = useAchievementsStore();
  const xpForNext = getXPForNextLevel(level);
  const xpPercent = Math.min((xp / xpForNext) * 100, 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const unlockedCount = Object.keys(unlocked).length;
  const winRate = gamesPlayed > 0 ? Math.round((totalCorrectGuesses / gamesPlayed) * 10) / 10 : 0;

  let playerName = 'Oyuncu';
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('karalama_player');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.name) playerName = parsed.name;
      }
    } catch {}
  }

  const groupedAchievements: Record<Achievement['tier'], Achievement[]> = {
    bronze: [],
    silver: [],
    gold: [],
    platinum: [],
  };
  for (const a of ACHIEVEMENTS) groupedAchievements[a.tier].push(a);

  return (
    <div className="min-h-screen px-4 py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Ana Sayfa
        </Link>
        <h1 className="text-xl font-bold text-gradient">Profilim</h1>
        <div className="w-20" />
      </div>

      {/* Hero card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <GlassCard className="p-6 relative overflow-hidden" glowColor="rgba(99,102,241,0.15)">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative">
            <div className="flex items-end justify-between gap-4 mb-4 flex-wrap">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Oyuncu</p>
                <h2 className="text-2xl font-bold text-white mb-1">{playerName}</h2>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-violet-500/20 to-cyan-400/20 border border-white/10 text-xs font-bold text-white">
                    Seviye {level}
                  </span>
                  {currentStreak >= 3 && (
                    <span className="text-xs text-amber-400 font-bold">🔥 {currentStreak} seri</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/40 uppercase tracking-wider">XP</p>
                <p className="text-lg font-mono font-bold text-white">{xp}<span className="text-white/30 text-sm"> / {xpForNext}</span></p>
              </div>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400"
              />
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
      >
        <StatCard icon="🎮" label="Oyun" value={gamesPlayed} />
        <StatCard icon="🎯" label="Doğru Tahmin" value={totalCorrectGuesses} />
        <StatCard icon="🔥" label="En İyi Seri" value={bestStreak} accent />
        <StatCard icon="📊" label="Oyun Başı" value={winRate} subtitle="ortalama" />
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white">Başarımlar</h2>
            <span className="text-xs text-white/50">
              <span className="text-white font-bold">{unlockedCount}</span> / {ACHIEVEMENTS.length}
            </span>
          </div>

          <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden mb-5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-violet-500"
              style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>

          {(['platinum', 'gold', 'silver', 'bronze'] as Achievement['tier'][]).map((tier) => {
            const list = groupedAchievements[tier];
            if (list.length === 0) return null;
            return (
              <div key={tier} className="mb-5 last:mb-0">
                <p className={cn('text-xs font-bold uppercase tracking-wider mb-2', TIER_COLORS[tier].text)}>
                  {tier === 'platinum' ? 'Platin' : tier === 'gold' ? 'Altın' : tier === 'silver' ? 'Gümüş' : 'Bronz'}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {list.map((a) => {
                    const isUnlocked = Boolean(unlocked[a.id]);
                    const style = TIER_COLORS[a.tier];
                    return (
                      <div
                        key={a.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border transition-all',
                          isUnlocked
                            ? `bg-gradient-to-br ${style.bg} ${style.border}`
                            : 'bg-white/[0.02] border-white/[0.06] opacity-50',
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0',
                            isUnlocked ? 'bg-white/[0.08]' : 'bg-white/[0.04] grayscale',
                          )}
                        >
                          {isUnlocked ? a.icon : '🔒'}
                        </div>
                        <div className="min-w-0">
                          <p className={cn('text-xs font-bold truncate', isUnlocked ? 'text-white' : 'text-white/50')}>
                            {a.title}
                          </p>
                          <p className="text-[10px] text-white/50 truncate">{a.description}</p>
                          <p className={cn('text-[10px] font-mono mt-0.5', isUnlocked ? style.text : 'text-white/30')}>
                            +{a.xpReward} XP
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </GlassCard>
      </motion.div>

      <p className="text-center text-xs text-white/25 mt-8">
        İlerleme bu cihazda saklanıyor
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  accent,
}: {
  icon: string;
  label: string;
  value: number | string;
  subtitle?: string;
  accent?: boolean;
}) {
  return (
    <GlassCard className="p-4">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-[10px] text-white/40 uppercase tracking-wider mb-0.5">{label}</p>
      <p className={cn('text-xl font-bold', accent ? 'text-amber-400' : 'text-white')}>{value}</p>
      {subtitle && <p className="text-[10px] text-white/30">{subtitle}</p>}
    </GlassCard>
  );
}
