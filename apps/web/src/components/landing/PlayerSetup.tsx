'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AVATAR_CHARACTERS } from '@karalama/shared';
import { cn } from '@/lib/utils';
import { EASE, TiltCard } from './common';

/* ============================================================
   Player Setup Card — the main interactive form
   ============================================================ */
export function PlayerSetup({
  playerName,
  setPlayerName,
  roomCode,
  setRoomCode,
  selectedAvatar,
  setSelectedAvatar,
  selectedColor,
  setSelectedColor,
  hasSaved,
  onCreate,
  onJoin,
}: {
  playerName: string;
  setPlayerName: (v: string) => void;
  roomCode: string;
  setRoomCode: (v: string) => void;
  selectedAvatar: typeof AVATAR_CHARACTERS[number];
  setSelectedAvatar: (v: typeof AVATAR_CHARACTERS[number]) => void;
  selectedColor: string;
  setSelectedColor: (v: string) => void;
  hasSaved: boolean;
  onCreate: () => void;
  onJoin: () => void;
}) {
  const [joinOpen, setJoinOpen] = useState(false);
  const nameReady = playerName.trim().length > 0;
  const joinReady = nameReady && roomCode.trim().length >= 4;

  return (
    <TiltCard
      className="rounded-3xl p-6 sm:p-7 relative"
      glowColor={`${selectedColor}20`}
      tiltStrength={3}
    >
      {/* Saved indicator */}
      {hasSaved && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-semibold text-emerald-400">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          Kayıtlı
        </div>
      )}

      <div className="space-y-5">
        {/* Name input — the centerpiece */}
        <div>
          <label htmlFor="player-name-input" className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em]">
              Oyuncu Adın
            </span>
            <span className="text-[10px] text-slate-600 tabular-nums" aria-live="polite">
              {playerName.length}/20
            </span>
          </label>
          <span id="player-name-help" className="sr-only">
            En az bir karakter yazarak başla. Enter tuşuna basıp oda oluşturabilirsin.
          </span>
          <div className="relative">
            <motion.div
              layout
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center text-xl z-10"
              style={{
                background: `linear-gradient(135deg, ${selectedColor}35, ${selectedColor}70)`,
                boxShadow: `0 4px 18px ${selectedColor}30, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
            >
              {selectedAvatar.emoji}
            </motion.div>
            <input
              id="player-name-input"
              type="text"
              autoComplete="off"
              placeholder="örn: Ahmet"
              aria-label="Oyuncu Adı"
              aria-describedby="player-name-help"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
              onKeyDown={(e) => { if (e.key === 'Enter' && playerName.trim()) onCreate(); }}
              maxLength={20}
              className={cn(
                'w-full pl-[64px] pr-4 h-14 rounded-2xl',
                'bg-white/[0.04] border',
                'text-lg font-semibold text-slate-50',
                'placeholder:text-slate-700 placeholder:font-normal placeholder:italic',
                'focus:outline-none transition-all duration-300',
                nameReady
                  ? 'border-white/[0.12] focus:border-indigo-400/50'
                  : 'border-white/[0.08] focus:border-white/20'
              )}
              style={nameReady ? {
                boxShadow: `0 0 0 1px ${selectedColor}22, 0 0 24px ${selectedColor}15`,
              } : undefined}
            />
          </div>
        </div>

        {/* Avatar picker — compact, premium */}
        <div>
          <div id="avatar-label" className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.12em] mb-2.5">
            Karakter Seç
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="radiogroup" aria-labelledby="avatar-label">
            {AVATAR_CHARACTERS.map((avatar, i) => {
              const active = selectedAvatar.id === avatar.id;
              return (
                <motion.button
                  key={avatar.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  aria-label={`Karakter seç: ${avatar.name}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.3, ease: EASE }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedAvatar(avatar);
                    setSelectedColor(avatar.color);
                  }}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 rounded-2xl p-2.5 sm:p-3 transition-all duration-300',
                    active
                      ? 'bg-white/[0.06]'
                      : 'bg-white/[0.02] hover:bg-white/[0.04]'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="avatar-active-ring"
                      className="absolute inset-0 rounded-2xl border-2"
                      style={{ borderColor: avatar.color }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div
                    aria-hidden="true"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-lg relative"
                    style={{
                      background: `linear-gradient(135deg, ${avatar.color}30, ${avatar.color}60)`,
                      boxShadow: active ? `0 0 18px ${avatar.color}50` : 'none',
                    }}
                  >
                    {avatar.emoji}
                  </div>
                  <span className={cn(
                    'text-[9px] sm:text-[10px] font-semibold transition-colors relative',
                    active ? 'text-slate-200' : 'text-slate-500'
                  )}>
                    {avatar.name}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Primary CTA — Create Room */}
        <div className="relative">
          <motion.button
            whileHover={nameReady ? { scale: 1.01, y: -1 } : undefined}
            whileTap={nameReady ? { scale: 0.985 } : undefined}
            onClick={onCreate}
            disabled={!nameReady}
            data-cursor={nameReady ? 'Başla' : undefined}
            className={cn(
              'group relative w-full overflow-hidden rounded-2xl h-14 flex items-center justify-center gap-2 font-display text-lg font-bold tracking-[-0.02em] transition-all duration-300',
              nameReady
                ? 'text-white cursor-pointer'
                : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 cursor-not-allowed'
            )}
            style={nameReady ? {
              background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}cc)`,
              boxShadow: `0 10px 30px ${selectedColor}35, 0 4px 12px ${selectedColor}25, inset 0 1px 0 rgba(255,255,255,0.2)`,
            } : undefined}
          >
            <span className="relative z-10 flex items-center gap-2">
              {nameReady ? (
                <>
                  Yeni Oda Oluştur
                  <svg aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              ) : (
                <>
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                  Önce Adını Yaz
                </>
              )}
            </span>
            {nameReady && (
              <motion.span
                className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] pointer-events-none"
                animate={{ x: ['0%', '500%'] }}
                transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 2, ease: 'easeInOut' }}
              />
            )}
          </motion.button>
        </div>

        {/* Join collapse */}
        <div className="relative">
          <div className="flex items-center gap-3 my-1">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <button
              onClick={() => setJoinOpen((v) => !v)}
              className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.12em] hover:text-slate-300 transition-colors flex items-center gap-1.5"
            >
              Oda Koduyla Katıl
              <motion.svg
                animate={{ rotate: joinOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <AnimatePresence>
            {joinOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Oda Kodu"
                    aria-label="Oda kodu (6 karakter)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
                    maxLength={6}
                    onKeyDown={(e) => { if (e.key === 'Enter' && joinReady) onJoin(); }}
                    className="flex-1 px-4 h-11 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white font-mono tracking-[0.2em] uppercase text-sm placeholder:text-slate-700 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:border-indigo-400/40 transition-colors"
                  />
                  <motion.button
                    whileHover={joinReady ? { scale: 1.02 } : undefined}
                    whileTap={joinReady ? { scale: 0.97 } : undefined}
                    onClick={onJoin}
                    disabled={!joinReady}
                    className={cn(
                      'h-11 px-5 rounded-xl text-sm font-bold transition-all',
                      joinReady
                        ? 'bg-white text-slate-900 shadow-[0_4px_16px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.22)]'
                        : 'bg-white/[0.04] border border-white/[0.08] text-slate-500 cursor-not-allowed'
                    )}
                  >
                    Katıl
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TiltCard>
  );
}
