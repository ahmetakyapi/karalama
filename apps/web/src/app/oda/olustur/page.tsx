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
import { ServerUnreachable } from '@/components/ui/ServerUnreachable';
import { useTransitionRouter } from '@/components/motion/PageTransition';
import { loadSavedPlayer } from '@/lib/player';

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

  // ?name= from the landing page, else this device's saved player
  const [saved] = useState(loadSavedPlayer);
  const playerName = params.get('name') || saved?.name || 'Oyuncu';
  const playerColor = params.get('color') || saved?.color || '#6366f1';
  const [creating, setCreating] = useState(false);

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
      setCreating(false);
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
    if (!s || !s.connected || creating) return;
    setCreating(true);

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
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] text-accent-indigo/10 glow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] text-accent-emerald/10 glow" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <a
        href="/"
        className="group absolute left-5 top-6 z-10 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100 sm:left-8"
      >
        <span className="transition-transform duration-500 ease-expo group-hover:-translate-x-1">←</span>
        Ana Sayfa
      </a>

      <div className="relative z-10 w-full max-w-lg">
        <h1 className="mb-10 flex justify-center gap-[0.25em] text-center font-display text-6xl sm:text-7xl font-extrabold tracking-[-0.05em] text-slate-50">
          <span className="line-mask"><span style={enter(0.1)}>Odanı</span></span>
          <span className="line-mask"><span style={enter(0.18)} className="text-gradient pr-[0.04em]">Kur</span></span>
        </h1>

        {store.roomError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-300"
          >
            {store.roomError}. Ana sayfaya yönlendiriliyorsun…
          </motion.div>
        )}

        <div className="intro-fade" style={enter(0.3)}>
        <GlassCard className="p-6 sm:p-8 space-y-7">
          {/* Rounds */}
          <div>
            <label htmlFor="opt-rounds" className="mb-3 flex items-end justify-between text-[13px] font-medium text-slate-300">
              <span>Tur Sayısı</span>
              <span className="font-display text-xl font-bold text-white tabular-nums">{rounds}</span>
            </label>
            <input
              id="opt-rounds"
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
            <label htmlFor="opt-time" className="mb-3 flex items-end justify-between text-[13px] font-medium text-slate-300">
              <span>Çizim Süresi</span>
              <span className="font-display text-xl font-bold text-white tabular-nums">
                {drawTime} <span className="text-sm font-semibold text-slate-400">sn</span>
              </span>
            </label>
            <input
              id="opt-time"
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
            <label htmlFor="opt-players" className="mb-3 flex items-end justify-between text-[13px] font-medium text-slate-300">
              <span>En Fazla Oyuncu</span>
              <span className="font-display text-xl font-bold text-white tabular-nums">{maxPlayers}</span>
            </label>
            <input
              id="opt-players"
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
            <p id="opt-categories" className="mb-3 flex items-baseline justify-between text-[13px] font-medium text-slate-300">
              Kategoriler
              <span className="tabular-nums text-slate-500">{selectedCategories.length} Seçili</span>
            </p>
            <div className="flex flex-wrap gap-2" role="group" aria-labelledby="opt-categories">
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
            <label htmlFor="opt-words" className="mb-2 block text-[13px] font-medium text-slate-300">
              Özel Kelimeler <span className="text-slate-500">(İsteğe Bağlı)</span>
            </label>
            <textarea
              id="opt-words"
              value={customWordsText}
              onChange={(e) => setCustomWordsText(e.target.value)}
              placeholder="Kelimeleri virgülle ya da alt alta yaz…&#10;Örnek: pizza, astronot, kaykay"
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm resize-none',
                'bg-white/[0.03] border border-white/[0.06]',
                'text-white placeholder:text-slate-500',
                'focus:outline-none focus:border-accent-indigo/40',
                'transition-all duration-200'
              )}
            />
            {customWordsText.trim() && (
              <p className="mt-1.5 text-[13px] text-slate-400">
                {customWordsText.split(/[,\n]/).filter((w) => w.trim()).length} özel kelime
              </p>
            )}
          </div>

          {store.connectionFailed && !store.isConnected ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-6">
              <ServerUnreachable heading="h2" />
            </div>
          ) : (
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={
                !store.isConnected || creating || (selectedCategories.length === 0 && !customWordsText.trim())
              }
              aria-busy={creating || !store.isConnected}
              className="w-full"
            >
              {!store.isConnected
                ? 'Sunucuya Bağlanıyor…'
                : creating
                  ? 'Oda Kuruluyor…'
                  : selectedCategories.length === 0 && !customWordsText.trim()
                    ? 'En Az Bir Kategori Seç'
                    : 'Oda Oluştur →'}
            </Button>
          )}
        </GlassCard>
        </div>
      </div>
    </div>
  );
}
