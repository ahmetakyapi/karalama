'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGameStore } from '@/stores/gameStore';
import { useSocket } from '@/hooks/useSocket';
import {
  DEFAULT_ROOM_SETTINGS,
  categories,
} from '@karalama/shared';
import { cn } from '@/lib/utils';
import { InkLoader } from '@/components/ui/InkLoader';
import { useTransitionRouter } from '@/components/motion/PageTransition';

const enter = (d: number) => ({ ['--d' as string]: `${d}s` }) as React.CSSProperties;

function fill(v: number, min: number, max: number) {
  return { '--fill': `${((v - min) / (max - min)) * 100}%` } as React.CSSProperties;
}

export default function CreateRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><InkLoader /></div>}>
      <CreateRoomContent />
    </Suspense>
  );
}

function CreateRoomContent() {
  const router = useRouter();
  const { navigate } = useTransitionRouter();
  const params = useSearchParams();
  const { socket } = useSocket();
  const store = useGameStore();

  const playerName = params.get('name') || 'Oyuncu';
  const playerColor = params.get('color') || '#6366f1';

  const [rounds, setRounds] = useState(DEFAULT_ROOM_SETTINGS.totalRounds);
  const [drawTime, setDrawTime] = useState(DEFAULT_ROOM_SETTINGS.drawTime);
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_ROOM_SETTINGS.maxPlayers);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    DEFAULT_ROOM_SETTINGS.categories
  );
  const [customWordsText, setCustomWordsText] = useState('');

  useEffect(() => {
    if (store.roomCode) {
      navigate(`/oda/${store.roomCode}`);
    }
  }, [store.roomCode, navigate]);

  useEffect(() => {
    if (store.roomError) {
      // Give user a chance to read, then bounce home
      const t = setTimeout(() => {
        store.setRoomError(null);
        router.push('/');
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [store.roomError, router, store]);

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleCreate = () => {
    const s = socket.current;
    if (!s) return;

    const customWords = customWordsText
      .split(/[,\n]/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    s.emit('room:create', {
      playerName,
      avatarColor: playerColor,
      settings: {
        ...DEFAULT_ROOM_SETTINGS,
        totalRounds: rounds,
        drawTime,
        maxPlayers,
        categories: selectedCategories,
        customWords,
      },
    });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-24">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-accent-indigo/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent-emerald/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <a
        href="/"
        className="group absolute left-5 top-6 z-10 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100 sm:left-8"
      >
        <span className="transition-transform duration-500 ease-expo group-hover:-translate-x-1">←</span>
        Ana sayfa
      </a>

      <div className="relative z-10 w-full max-w-lg">
        <div style={enter(0.05)} className="intro-fade mb-4 flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
          <span className="text-[var(--marker)]">(01)</span>
          <span className="h-px w-8 bg-slate-600" />
          <span>{playerName} için yeni oda</span>
        </div>
        <h1 className="mb-10 flex justify-center gap-[0.25em] text-center font-display text-6xl sm:text-7xl font-extrabold tracking-[-0.05em] text-slate-50">
          <span className="line-mask"><span style={enter(0.1)}>Odanı</span></span>
          <span className="line-mask"><span style={enter(0.18)} className="text-gradient">kur.</span></span>
        </h1>

        {store.roomError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-300"
          >
            {store.roomError} — Ana sayfaya yönlendiriliyorsun...
          </motion.div>
        )}

        <div className="intro-fade" style={enter(0.3)}>
        <GlassCard className="p-6 sm:p-8 space-y-7">
          {/* Rounds */}
          <div>
            <label className="flex items-end justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/50 mb-3">
              <span>Tur Sayısı</span>
              <span className="font-display text-xl font-bold text-white tabular-nums">{rounds}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="range"
              style={fill(rounds, 1, 10)}
            />
          </div>

          {/* Draw Time */}
          <div>
            <label className="flex items-end justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/50 mb-3">
              <span>Çizim Süresi</span>
              <span className="font-display text-xl font-bold text-white tabular-nums">{drawTime}s</span>
            </label>
            <input
              type="range"
              min={30}
              max={120}
              step={10}
              value={drawTime}
              onChange={(e) => setDrawTime(Number(e.target.value))}
              className="range"
              style={fill(drawTime, 30, 120)}
            />
          </div>

          {/* Max Players */}
          <div>
            <label className="flex items-end justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/50 mb-3">
              <span>Maks Oyuncu</span>
              <span className="font-display text-xl font-bold text-white tabular-nums">{maxPlayers}</span>
            </label>
            <input
              type="range"
              min={2}
              max={12}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="range"
              style={fill(maxPlayers, 2, 12)}
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm text-white/50 mb-3">
              Kategoriler
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categories).map(([key, cat]) => (
                <motion.button
                  key={key}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  whileHover={{ y: -2 }}
                  aria-pressed={selectedCategories.includes(key)}
                  onClick={() => toggleCategory(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-colors duration-300',
                    selectedCategories.includes(key)
                      ? 'bg-[var(--marker)] border border-transparent text-[#04070d] font-semibold'
                      : 'bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white/80 hover:border-white/20'
                  )}
                >
                  {cat.emoji} {cat.name}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom Words */}
          <div>
            <label className="block text-sm text-white/50 mb-2">
              Özel Kelimeler <span className="text-white/30">(opsiyonel)</span>
            </label>
            <textarea
              value={customWordsText}
              onChange={(e) => setCustomWordsText(e.target.value)}
              placeholder="Virgül veya satır ile ayırarak yaz...&#10;örnek: pizza, astronot, kaykay"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm resize-none',
                'bg-white/[0.03] border border-white/[0.06]',
                'text-white placeholder:text-white/20',
                'focus:outline-none focus:border-accent-indigo/40',
                'transition-all duration-200'
              )}
            />
            {customWordsText.trim() && (
              <p className="text-xs text-white/30 mt-1">
                {customWordsText.split(/[,\n]/).filter((w) => w.trim()).length} özel kelime
              </p>
            )}
          </div>

          <Button
            size="lg"
            onClick={handleCreate}
            disabled={selectedCategories.length === 0 && !customWordsText.trim()}
            className="w-full"
          >
            Oda Oluştur →
          </Button>
        </GlassCard>
        </div>
      </div>
    </div>
  );
}
