'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/stores/gameStore';
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas';
import { SpectatorCanvas } from '@/components/canvas/SpectatorCanvas';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { ChatPanel, GuessDock } from '@/components/chat/ChatPanel';
import { ScoreBoard } from './ScoreBoard';
import { Timer } from './Timer';
import { WordHint } from './WordHint';
import { WordSelection } from './WordSelection';
import { RoundTransition } from './RoundTransition';
import { Avatar } from '@/components/ui/Avatar';
import { EmojiReactions } from './EmojiReactions';
import { CorrectGuessEffect } from './CorrectGuessEffect';
import { DrawingRules } from './DrawingRules';
import { SettingsPanel } from './SettingsPanel';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProgressStore, getXPForNextLevel } from '@/stores/progressStore';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/components/motion/hooks';
import { Glyph, Tape } from '@/components/ui/Sketch';

const DESKTOP = '(min-width: 1024px)';

const COLORBLIND_FILTERS: Record<string, string> = {
  none: 'none',
  protanopia: 'url(#protanopia)',
  deuteranopia: 'url(#deuteranopia)',
  tritanopia: 'url(#tritanopia)',
};

const FONT_SIZE_CLASSES: Record<string, string> = {
  normal: '',
  large: 'text-lg',
  xl: 'text-xl',
};

type MobileTab = 'canvas' | 'chat' | 'scores';

export function GameView() {
  const { playerId, currentDrawerId, currentRound, totalRounds, players, phase } = useGameStore();
  const [mobileTab, setMobileTab] = useState<MobileTab>('canvas');
  const { colorblindMode, fontSize } = useSettingsStore();
  const { level, xp, currentStreak } = useProgressStore();
  const xpForNext = getXPForNextLevel(level);
  const xpPercent = Math.min((xp / xpForNext) * 100, 100);

  // Render ONE layout. Both used to be mounted (one hidden by CSS), so two
  // drawing canvases listened to the keyboard and the toolbar's undo went to
  // the hidden one: guessers lost strokes the drawer still saw.
  const desktop = useMediaQuery(DESKTOP, typeof window !== 'undefined' && window.matchMedia(DESKTOP).matches);

  const isDrawer = playerId === currentDrawerId;
  const drawer = currentDrawerId ? players[currentDrawerId] : null;

  return (
    <div
      className={cn('h-[100dvh] flex flex-col bg-bg-primary', FONT_SIZE_CLASSES[fontSize])}
      style={{
        filter:
          COLORBLIND_FILTERS[colorblindMode] !== 'none'
            ? COLORBLIND_FILTERS[colorblindMode]
            : undefined,
      }}
    >
      <svg aria-hidden="true" className="absolute w-0 h-0">
        <defs>
          <filter id="protanopia">
            <feColorMatrix type="matrix" values="0.567,0.433,0,0,0 0.558,0.442,0,0,0 0,0.242,0.758,0,0 0,0,0,1,0" />
          </filter>
          <filter id="deuteranopia">
            <feColorMatrix type="matrix" values="0.625,0.375,0,0,0 0.7,0.3,0,0,0 0,0.3,0.7,0,0 0,0,0,1,0" />
          </filter>
          <filter id="tritanopia">
            <feColorMatrix type="matrix" values="0.95,0.05,0,0,0 0,0.433,0.567,0,0 0,0.475,0.525,0,0 0,0,0,1,0" />
          </filter>
        </defs>
      </svg>
      <EmojiReactions />
      <CorrectGuessEffect />

      {/* Header */}
      <div className="relative flex items-center justify-between gap-3 border-b border-white/[0.06] bg-bg-secondary/60 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <RoundTally current={currentRound} total={totalRounds} />
          {drawer && (
            <div className="flex min-w-0 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.03] py-1 pl-1 pr-3">
              <Avatar name={drawer.name} color={drawer.avatarColor} size="sm" />
              <span className="truncate text-sm text-slate-200">
                {isDrawer ? (
                  <span className="font-hand text-lg font-bold leading-none text-[var(--marker)]">sen çiziyorsun!</span>
                ) : (
                  <>
                    <span className="font-semibold">{drawer.name}</span> <span className="text-slate-400">çiziyor</span>
                  </>
                )}
              </span>
              <Glyph name="pencil" className="wobble hidden h-4 w-4 shrink-0 text-slate-400 sm:block" strokeWidth={3} />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden lg:block">
            <WordHint />
          </div>

          {/* Compact XP bar - desktop only */}
          <Link
            href="/profil"
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors group"
            title="Profilim"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-violet-500/30 to-cyan-400/30 border border-white/10 text-xs font-bold text-white">
              {level}
            </span>
            <div className="w-16 h-1 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full w-full origin-left rounded-full bg-[var(--marker)] transition-transform duration-500"
                style={{ transform: `scaleX(${xpPercent / 100})` }}
              />
            </div>
            {currentStreak >= 3 && (
              <span className="flex items-center gap-0.5 whitespace-nowrap text-xs font-bold text-amber-400" aria-label={`${currentStreak} seri`}>
                <Glyph name="bolt" className="h-3.5 w-3.5" strokeWidth={3} />
                {currentStreak}
              </span>
            )}
          </Link>

          <Timer />
          <SettingsPanel />
        </div>
      </div>

      {/* Phones: the word gets its own row so long words never push the
          timer and settings off-screen */}
      <div className="border-b border-white/[0.06] px-2 py-2 lg:hidden">
        <WordHint />
      </div>

      {desktop ? (
        <div className="flex-1 flex gap-3 p-3 overflow-hidden">
          <div className="flex w-56 shrink-0 flex-col gap-3 overflow-y-auto">
            <ScoreBoard />
            <RoundCard current={currentRound} total={totalRounds} />
          </div>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div
                className="paper-frame relative w-full"
                style={{ maxWidth: `calc((100dvh - ${isDrawer && phase === 'DRAWING' ? '12.5rem' : '7.5rem'}) * 4 / 3)` }}
              >
                <Tape className="-left-6 -top-2 z-20 -rotate-[24deg]" />
                <Tape className="-right-6 -top-2 z-20 rotate-[22deg]" />
                {isDrawer ? <DrawingCanvas /> : <SpectatorCanvas />}
                {phase === 'DRAWING' && isDrawer && <DrawingRules />}
                {phase === 'PICKING' && isDrawer && <WordSelection />}
                {phase === 'ROUND_RESULT' && <RoundTransition />}
              </div>
            </div>
            {isDrawer && phase === 'DRAWING' && <CanvasToolbar />}
          </div>

          <div className="w-72 shrink-0">
            <ChatPanel />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-2 overflow-hidden">
            {/* Stays mounted on other tabs: unmounting wiped the drawer's
                local strokes while everyone else still saw them */}
            <div className={cn('h-full flex-col', mobileTab === 'canvas' ? 'flex' : 'hidden')}>
                <div className="relative shrink-0">
                  {isDrawer ? <DrawingCanvas /> : <SpectatorCanvas />}
                  {phase === 'PICKING' && isDrawer && <WordSelection />}
                  {phase === 'ROUND_RESULT' && <RoundTransition />}
                </div>
                {isDrawer && phase === 'DRAWING' ? (
                  <>
                    <CanvasToolbar />
                    <GuessDock showInput={false} />
                  </>
                ) : (
                  <GuessDock />
                )}
            </div>
            {mobileTab === 'chat' && (
              <div className="h-full">
                <ChatPanel />
              </div>
            )}
            {mobileTab === 'scores' && (
              <div className="h-full">
                <ScoreBoard />
              </div>
            )}
          </div>

          <div role="tablist" aria-label="Oyun ekranı" className="flex border-t border-white/[0.06] bg-bg-secondary/50 pb-[env(safe-area-inset-bottom)]">
            {(['canvas', 'chat', 'scores'] as const).map((tab) => (
              <button
                key={tab}
                role="tab"
                aria-selected={mobileTab === tab}
                onClick={() => setMobileTab(tab)}
                className={cn(
                  'flex-1 py-3 text-[13px] font-medium transition-colors border-t-2',
                  mobileTab === tab
                    ? 'text-indigo-300 border-accent-indigo'
                    : 'text-slate-400 border-transparent',
                )}
              >
                {tab === 'canvas' ? 'Tuval' : tab === 'chat' ? 'Sohbet' : 'Puanlar'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Rounds as pencil tally marks: done rounds inked, the current one in marker. */
function RoundTally({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Tur ${current}/${total}`} role="img">
      <span className="font-display text-sm font-bold tabular-nums text-slate-100">
        Tur {current}
        <span className="text-slate-500">/{total}</span>
      </span>
      <span className="hidden items-end gap-[3px] sm:flex" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'block w-[3px] rounded-full transition-colors duration-500',
              i < current - 1 ? 'h-3.5 bg-slate-300' : i === current - 1 ? 'h-4 bg-[var(--marker)]' : 'h-3 bg-white/[0.12]'
            )}
            style={{ rotate: `${((i * 37) % 9) - 4}deg` }}
          />
        ))}
      </span>
    </div>
  );
}

/** Fills the space under the scoreboard with something worth reading. */
function RoundCard({ current, total }: { current: number; total: number }) {
  const left = Math.max(0, total - current);
  return (
    <div className="glass relative overflow-hidden rounded-xl p-4">
      <Glyph name="star" className="float-slow absolute -right-2 -top-2 h-12 w-12 text-lime-300/20" />
      <p className="text-[13px] font-semibold text-slate-300">Oyun Durumu</p>
      <p className="mt-2 font-display text-3xl font-extrabold tabular-nums tracking-[-0.04em] text-slate-50">
        {current}
        <span className="ml-1.5 font-sans text-sm font-semibold tracking-normal text-slate-400">/ {total} tur</span>
      </p>
      <div className="mt-3 flex gap-1" aria-hidden="true">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn('h-1.5 flex-1 rounded-full', i < current ? 'bg-[var(--marker)]' : 'bg-white/[0.08]')}
          />
        ))}
      </div>
      <p className="mt-3 font-hand text-lg leading-tight text-slate-400">
        {left === 0 ? 'son tur, hepsi ya da hiç!' : left === 1 ? 'bir tur kaldı' : `${left} tur daha var`}
      </p>
    </div>
  );
}
