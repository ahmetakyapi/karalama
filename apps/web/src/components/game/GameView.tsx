'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { DrawingCanvas } from '@/components/canvas/DrawingCanvas';
import { SpectatorCanvas } from '@/components/canvas/SpectatorCanvas';
import { CanvasToolbar } from '@/components/canvas/CanvasToolbar';
import { ChatPanel } from '@/components/chat/ChatPanel';
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
import { cn } from '@/lib/utils';

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
  const {
    playerId,
    currentDrawerId,
    currentRound,
    totalRounds,
    players,
    phase,
  } = useGameStore();

  const [mobileTab, setMobileTab] = useState<MobileTab>('canvas');
  const { colorblindMode, fontSize } = useSettingsStore();

  const isDrawer = playerId === currentDrawerId;
  const drawer = currentDrawerId ? players[currentDrawerId] : null;

  return (
    <div
      className={cn('h-screen flex flex-col bg-bg-primary', FONT_SIZE_CLASSES[fontSize])}
      style={{ filter: COLORBLIND_FILTERS[colorblindMode] !== 'none' ? COLORBLIND_FILTERS[colorblindMode] : undefined }}
    >
      {/* SVG filters for colorblind modes */}
      <svg className="absolute w-0 h-0">
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
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] bg-bg-secondary/50">
        <div className="flex items-center gap-3">
          <Badge variant="info">
            Tur {currentRound}/{totalRounds}
          </Badge>
          {drawer && (
            <div className="flex items-center gap-2">
              <Avatar
                name={drawer.name}
                color={drawer.avatarColor}
                size="sm"
              />
              <span className="text-sm text-white/60">
                {isDrawer ? 'Sen çiziyorsun!' : `${drawer.name} çiziyor`}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <WordHint />
          <Timer />
          <SettingsPanel />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="flex-1 hidden lg:flex gap-3 p-3 overflow-hidden">
        {/* Left - Scoreboard */}
        <div className="w-52 shrink-0">
          <ScoreBoard />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative">
            {isDrawer ? <DrawingCanvas /> : <SpectatorCanvas />}
            {phase === 'DRAWING' && isDrawer && <DrawingRules />}
            {phase === 'PICKING' && isDrawer && <WordSelection />}
            {phase === 'ROUND_RESULT' && <RoundTransition />}
          </div>
          {isDrawer && phase === 'DRAWING' && <CanvasToolbar />}
        </div>

        {/* Right - Chat */}
        <div className="w-72 shrink-0">
          <ChatPanel />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col lg:hidden overflow-hidden">
        <div className="flex-1 p-2 overflow-hidden">
          {mobileTab === 'canvas' && (
            <div className="h-full flex flex-col">
              <div className="flex-1 relative">
                {isDrawer ? <DrawingCanvas /> : <SpectatorCanvas />}
                {phase === 'PICKING' && isDrawer && <WordSelection />}
                {phase === 'ROUND_RESULT' && <RoundTransition />}
              </div>
              {isDrawer && phase === 'DRAWING' && <CanvasToolbar />}
            </div>
          )}
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

        {/* Mobile tabs */}
        <div className="flex border-t border-white/[0.06] bg-bg-secondary/50">
          {(['canvas', 'chat', 'scores'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={cn(
                'flex-1 py-3 text-xs font-medium transition-colors',
                mobileTab === tab
                  ? 'text-accent-indigo border-t-2 border-accent-indigo'
                  : 'text-white/40'
              )}
            >
              {tab === 'canvas'
                ? 'Tuval'
                : tab === 'chat'
                  ? 'Sohbet'
                  : 'Skorlar'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
