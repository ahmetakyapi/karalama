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
import { Badge } from '@/components/ui/Badge';
import { EmojiReactions } from './EmojiReactions';
import { CorrectGuessEffect } from './CorrectGuessEffect';
import { DrawingRules } from './DrawingRules';
import { SettingsPanel } from './SettingsPanel';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProgressStore, getXPForNextLevel } from '@/stores/progressStore';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/components/motion/hooks';

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
      <div className="flex items-center justify-between px-3 py-2 sm:px-4 border-b border-white/[0.06] bg-bg-secondary/50 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant="info">
            Tur {currentRound}/{totalRounds}
          </Badge>
          {drawer && (
            <div className="flex items-center gap-2 min-w-0">
              <Avatar name={drawer.name} color={drawer.avatarColor} size="sm" />
              <span className="text-sm text-slate-300 truncate">
                {isDrawer ? 'Sen Çiziyorsun!' : `${drawer.name} Çiziyor`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden lg:block">
            <WordHint />
          </div>

          {/* Compact XP bar - desktop only */}
          <Link
            href="/profil"
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-all group"
            title="Profilim"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-violet-500/30 to-cyan-400/30 border border-white/10 text-xs font-bold text-white">
              {level}
            </span>
            <div className="w-16 h-1 rounded-full bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            {currentStreak >= 3 && (
              <span className="text-xs font-bold text-amber-400 whitespace-nowrap">🔥 {currentStreak}</span>
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
          <div className="w-52 shrink-0">
            <ScoreBoard />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 relative">
              {isDrawer ? <DrawingCanvas /> : <SpectatorCanvas />}
              {phase === 'DRAWING' && isDrawer && <DrawingRules />}
              {phase === 'PICKING' && isDrawer && <WordSelection />}
              {phase === 'ROUND_RESULT' && <RoundTransition />}
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
