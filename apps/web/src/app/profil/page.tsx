'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useProgressStore, getXPForNextLevel } from '@/stores/progressStore';
import { useAchievementsStore, ACHIEVEMENTS, type Achievement } from '@/stores/achievementsStore';
import { Glyph, PointerLight, Tape, type GlyphName } from '@/components/ui/Sketch';
import { cn } from '@/lib/utils';
import { loadSavedPlayer } from '@/lib/player';

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
  // Turkish decimal comma: 2,5
  const perGame = gamesPlayed > 0 ? Math.round((totalCorrectGuesses / gamesPlayed) * 10) / 10 : 0;
  const winRate = perGame.toLocaleString('tr-TR');

  const saved = loadSavedPlayer();
  const playerName = saved?.name || 'Oyuncu';
  const playerColor = saved?.color || '#6366f1';

  const groupedAchievements: Record<Achievement['tier'], Achievement[]> = {
    bronze: [],
    silver: [],
    gold: [],
    platinum: [],
  };
  for (const a of ACHIEVEMENTS) groupedAchievements[a.tier].push(a);

  const TIER_NAME: Record<Achievement['tier'], string> = { platinum: 'Platin', gold: 'Altın', silver: 'Gümüş', bronze: 'Bronz' };
  const TIER_PAPER: Record<Achievement['tier'], string> = { platinum: '#bae6fd', gold: '#fde68a', silver: '#e2e8f0', bronze: '#fed7aa' };
  const stats: { glyph: GlyphName; label: string; value: number | string; hint?: string }[] = [
    { glyph: 'smile', label: 'Oyun', value: gamesPlayed },
    { glyph: 'star', label: 'Doğru Tahmin', value: totalCorrectGuesses },
    { glyph: 'bolt', label: 'En İyi Seri', value: bestStreak },
    { glyph: 'spiral', label: 'Oyun Başına Doğru', value: winRate, hint: 'ortalama' },
  ];

  return (
    <div className="dot-paper relative min-h-screen overflow-x-clip px-4 pb-16 pt-6 sm:px-6">
      <PointerLight />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] text-accent-indigo/10 glow" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] text-accent-cyan/10 glow" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100">
            <span aria-hidden="true" className="transition-transform duration-500 ease-expo group-hover:-translate-x-1">←</span>
            Ana Sayfa
          </Link>
          <p className="text-[13px] text-slate-500">İlerleme bu cihazda saklanıyor</p>
        </div>

        <h1 className="mb-10 font-display text-6xl font-extrabold tracking-[-0.05em] text-slate-50 sm:text-7xl">
          <span className="line-mask !inline-block align-bottom"><span style={{ ['--d' as string]: '0.05s' }}>Profilim</span></span>
          <span className="pop-in ml-3 inline-block -rotate-6 align-top font-hand text-3xl font-bold tracking-normal text-[var(--marker)]" style={{ ['--d' as string]: '0.5s' }}>
            defterin
          </span>
        </h1>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-14">
          {/* ===== Player card ===== */}
          <motion.section
            aria-label="Oyuncu kartı"
            initial={{ opacity: 0, y: 40, rotate: -4 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-md lg:sticky lg:top-8"
          >
            <Tape className="-top-3 left-1/2 z-10 -translate-x-1/2 -rotate-3" />
            <div className="paper-sheet rounded-[6px] px-6 pb-7 pt-9 shadow-[0_30px_70px_-24px_rgba(0,0,0,0.75)] sm:pl-16 sm:pr-8">
              <p className="font-hand text-2xl font-bold text-[var(--paper-red)]">Oyuncu Kartı</p>
              <div className="mt-4 flex items-center gap-4">
                <span
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full font-display text-2xl font-extrabold text-white ring-4 ring-white/70"
                  style={{ background: playerColor }}
                  aria-hidden="true"
                >
                  {playerName.charAt(0).toLocaleUpperCase('tr-TR')}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-display text-3xl font-extrabold tracking-[-0.03em]">{playerName}</h2>
                  {currentStreak >= 3 && <p className="font-hand text-lg text-[var(--paper-red)]">{currentStreak} seri sürüyor!</p>}
                </div>
                <span className="ml-auto flex h-16 w-16 shrink-0 rotate-12 flex-col items-center justify-center rounded-full border-2 border-[var(--paper-red)] text-[var(--paper-red)]" aria-label={`Seviye ${level}`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider">Seviye</span>
                  <span className="font-display text-2xl font-extrabold leading-none">{level}</span>
                </span>
              </div>

              <div className="mt-6">
                <div className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-[var(--paper-muted)]">
                  <span>Sonraki Seviyeye</span>
                  <span className="font-display font-bold tabular-nums text-[var(--paper-ink)]">{xp} / {xpForNext} XP</span>
                </div>
                <div className="relative h-3 overflow-hidden rounded-full bg-[rgba(31,36,48,0.1)]">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: xpPercent / 100 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
                    className="hatch absolute inset-0 origin-left text-[var(--paper-ink)]"
                  />
                </div>
              </div>

              <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-6 border-t border-dashed border-[rgba(31,36,48,0.22)] pt-6">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="flex items-center gap-1.5 font-hand text-lg leading-tight text-[var(--paper-muted)]">
                      <Glyph name={s.glyph} className="h-4 w-4 shrink-0" strokeWidth={3} />
                      {s.label}
                    </dt>
                    <dd className="font-display text-4xl font-extrabold tabular-nums tracking-[-0.05em]">
                      {s.value}
                      {s.hint && <span className="ml-1 font-sans text-xs font-medium tracking-normal text-[var(--paper-muted)]">{s.hint}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.section>

          {/* ===== Sticker album ===== */}
          <section aria-labelledby="album-title" className="min-w-0">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 id="album-title" className="font-display text-4xl font-extrabold tracking-[-0.045em] text-slate-50">Çıkartma Albümü</h2>
                <p className="mt-2 text-sm text-slate-400">Oynadıkça boş yerler dolar.</p>
              </div>
              <p className="font-display text-3xl font-extrabold tabular-nums text-slate-50">
                {unlockedCount}
                <span className="text-lg text-slate-500">/{ACHIEVEMENTS.length}</span>
              </p>
            </div>

            <div className="space-y-9">
              {(['platinum', 'gold', 'silver', 'bronze'] as Achievement['tier'][]).map((tier) => {
                const list = groupedAchievements[tier];
                if (list.length === 0) return null;
                return (
                  <div key={tier}>
                    <h3 className={cn('mb-3 flex items-center gap-3 text-[13px] font-semibold', TIER_COLORS[tier].text)}>
                      {TIER_NAME[tier]}
                      <span className="h-px flex-1 bg-white/[0.06]" />
                    </h3>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                      {list.map((a, k) => {
                        const isUnlocked = Boolean(unlocked[a.id]);
                        const tilt = ((k * 37) % 9) - 4;
                        return (
                          <motion.li
                            key={a.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-5% 0px' }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: (k % 4) * 0.06 }}
                            className="group flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#070b14]/70 px-3 pb-4 pt-5 text-center"
                          >
                            {isUnlocked ? (
                              <span
                                className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full text-3xl shadow-[0_10px_20px_-8px_rgba(0,0,0,0.8)] ring-[3px] ring-white transition-transform duration-500 ease-expo group-hover:rotate-0 group-hover:scale-110"
                                style={{ background: TIER_PAPER[a.tier], rotate: `${tilt}deg` }}
                              >
                                <span aria-hidden="true">{a.icon}</span>
                                <span aria-hidden="true" className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-gradient-to-br from-transparent via-transparent to-black/20" />
                              </span>
                            ) : (
                              <span className="relative flex h-[72px] w-[72px] items-center justify-center text-slate-600" aria-label="Kilitli">
                                <span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-dashed border-slate-600/70 transition-transform duration-700 ease-expo group-hover:rotate-45" />
                                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                                  <rect x="5" y="11" width="14" height="10" rx="2" />
                                  <path d="M8 11V8a4 4 0 018 0v3" />
                                </svg>
                              </span>
                            )}
                            <p className={cn('mt-3 text-[13px] font-bold leading-snug', isUnlocked ? 'text-white' : 'text-slate-300')}>{a.title}</p>
                            <p className="mt-0.5 text-xs leading-snug text-slate-400">{a.description}</p>
                            <p className={cn('mt-1.5 font-hand text-base', isUnlocked ? TIER_COLORS[tier].text : 'text-slate-500')}>+{a.xpReward} XP</p>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
