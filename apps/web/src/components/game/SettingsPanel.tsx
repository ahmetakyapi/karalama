'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/stores/settingsStore';
import { useProgressStore, getXPForNextLevel } from '@/stores/progressStore';
import { useAchievementsStore, ACHIEVEMENTS } from '@/stores/achievementsStore';
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

type Tab = 'ses' | 'gorunum' | 'erisim' | 'profil';

export function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('gorunum');
  const {
    colorblindMode,
    fontSize,
    fontFamily,
    contrast,
    soundEnabled,
    musicEnabled,
    hapticsEnabled,
    reduceMotion,
    showKeyboardHints,
    setColorblindMode,
    setFontSize,
    setFontFamily,
    setContrast,
    setSoundEnabled,
    setMusicEnabled,
    setHapticsEnabled,
    setReduceMotion,
    setShowKeyboardHints,
  } = useSettingsStore();
  const { level, xp, gamesPlayed, totalCorrectGuesses, bestStreak, currentStreak } = useProgressStore();
  const { unlocked } = useAchievementsStore();
  const xpForNext = getXPForNextLevel(level);
  const unlockedCount = Object.keys(unlocked).length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
        title="Ayarlar"
        aria-label="Ayarlar"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>

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
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 glass rounded-2xl border border-white/10 p-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Ayarlar</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                  aria-label="Kapat"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 bg-white/[0.03] p-1 rounded-lg">
                {([
                  ['gorunum', 'Görünüm'],
                  ['erisim', 'Erişim'],
                  ['ses', 'Ses'],
                  ['profil', 'Profil'],
                ] as const).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-medium rounded-md transition-all',
                      tab === id
                        ? 'bg-accent-indigo/20 text-accent-indigo'
                        : 'text-white/50 hover:text-white/80',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === 'gorunum' && (
                <div className="space-y-4">
                  <div>
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
                              : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ToggleRow
                    label="Yüksek Kontrast"
                    hint="Koyu arka plan, yüksek okunabilirlik"
                    value={contrast === 'high'}
                    onChange={(v) => setContrast(v ? 'high' : 'normal')}
                  />

                  <ToggleRow
                    label="Disleksi Dostu Yazı"
                    hint="OpenDyslexic fontu ile daha okunabilir"
                    value={fontFamily === 'dyslexic'}
                    onChange={(v) => setFontFamily(v ? 'dyslexic' : 'default')}
                  />

                  <ToggleRow
                    label="Hareketi Azalt"
                    hint="Animasyonları kapatır"
                    value={reduceMotion}
                    onChange={setReduceMotion}
                  />

                  <ToggleRow
                    label="Klavye İpuçları"
                    hint="Butonlarda kısayol göster"
                    value={showKeyboardHints}
                    onChange={setShowKeyboardHints}
                  />
                </div>
              )}

              {tab === 'erisim' && (
                <div className="space-y-3">
                  <p className="text-sm text-white/70 mb-1">Renk Körlüğü Modu</p>
                  {COLORBLIND_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setColorblindMode(opt.value)}
                      className={cn(
                        'w-full py-2 px-3 rounded-lg text-xs font-medium text-left transition-all',
                        colorblindMode === opt.value
                          ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                          : 'bg-white/[0.03] text-white/50 border border-white/[0.06] hover:bg-white/[0.06]',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}

              {tab === 'ses' && (
                <div className="space-y-4">
                  <ToggleRow
                    label="Ses Efektleri"
                    hint="Çizim, tahmin ve oyun sesleri"
                    value={soundEnabled}
                    onChange={setSoundEnabled}
                  />
                  <ToggleRow
                    label="Arka Plan Müziği"
                    hint="Lobi müziği (yakında)"
                    value={musicEnabled}
                    onChange={setMusicEnabled}
                    disabled
                  />
                  <ToggleRow
                    label="Titreşim"
                    hint="Mobil cihazlarda haptic geri bildirim"
                    value={hapticsEnabled}
                    onChange={setHapticsEnabled}
                  />
                </div>
              )}

              {tab === 'profil' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-cyan-400/10 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-base font-bold text-white">Seviye {level}</span>
                      <span className="text-xs font-mono text-white/50">
                        {xp}/{xpForNext} XP
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                        style={{ width: `${(xp / xpForNext) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <Stat label="Oyun" value={gamesPlayed} />
                      <Stat label="Bilinen" value={totalCorrectGuesses} />
                      <Stat label="Şu an" value={currentStreak} accent />
                      <Stat label="En İyi" value={bestStreak} accent />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-white/60 mb-2">
                      Başarımlar: <span className="text-white/90 font-bold">{unlockedCount}</span>/{ACHIEVEMENTS.length}
                    </p>
                    <Link
                      href="/profil"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-xs font-medium text-white/80 transition-all"
                    >
                      Tüm profilimi ve başarımları gör
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className={cn('text-sm font-bold', accent ? 'text-amber-400' : 'text-white/80')}>{value}</p>
      <p className="text-[9px] text-white/30 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn('flex items-start justify-between gap-3 py-2', disabled && 'opacity-40')}
    >
      <div className="min-w-0">
        <p className="text-sm text-white/80">{label}</p>
        {hint && <p className="text-[10px] text-white/40 mt-0.5">{hint}</p>}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={cn(
          'shrink-0 w-10 h-5 rounded-full transition-colors relative',
          value ? 'bg-accent-indigo' : 'bg-white/10',
        )}
        aria-pressed={value}
      >
        <div
          className={cn(
            'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform',
            value ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}
