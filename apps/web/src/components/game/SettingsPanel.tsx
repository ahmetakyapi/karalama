'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProgressStore, getXPForNextLevel } from '@/stores/progressStore';
import { cn } from '@/lib/utils';

const COLORBLIND_OPTIONS = [
  { value: 'none', label: 'Normal' },
  { value: 'protanopia', label: 'Protanopi (Kırmızı-yeşil)' },
  { value: 'deuteranopia', label: 'Deuteranopi (Yeşil-kırmızı)' },
  { value: 'tritanopia', label: 'Tritanopi (Mavi-sarı)' },
] as const;

const FONT_SIZE_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'large', label: 'Büyük' },
  { value: 'xl', label: 'Çok Büyük' },
] as const;

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { colorblindMode, fontSize, soundEnabled, setColorblindMode, setFontSize, setSoundEnabled } = useSettingsStore();
  const { level, xp, gamesPlayed, totalCorrectGuesses, bestStreak } = useProgressStore();
  const xpForNext = getXPForNextLevel(level);

  return (
    <>
      {/* Settings toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
        title="Ayarlar"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

      {/* Settings modal */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-50 glass rounded-2xl border border-white/10 p-5"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-white">Ayarlar</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Player level */}
              <div className="mb-5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-white/70">Seviye {level}</span>
                  <span className="text-xs font-mono text-white/30">{xp}/{xpForNext} XP</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${(xp / xpForNext) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-white/25">
                  <span>{gamesPlayed} oyun</span>
                  <span>{totalCorrectGuesses} bilinen</span>
                  <span>{bestStreak} en iyi seri</span>
                </div>
              </div>

              {/* Sound */}
              <div className="mb-4">
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm text-white/70">Ses Efektleri</span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      soundEnabled ? 'bg-accent-indigo' : 'bg-white/10'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform',
                        soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </label>
              </div>

              {/* Font size */}
              <div className="mb-4">
                <p className="text-sm text-white/70 mb-2">Yazı Boyutu</p>
                <div className="flex gap-1.5">
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFontSize(opt.value)}
                      className={cn(
                        'flex-1 py-2 rounded-lg text-xs font-medium transition-all',
                        fontSize === opt.value
                          ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                          : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colorblind mode */}
              <div>
                <p className="text-sm text-white/70 mb-2">Renk Körlüğü Modu</p>
                <div className="space-y-1.5">
                  {COLORBLIND_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setColorblindMode(opt.value)}
                      className={cn(
                        'w-full py-2 px-3 rounded-lg text-xs font-medium text-left transition-all',
                        colorblindMode === opt.value
                          ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                          : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
