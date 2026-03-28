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
import { easeCurve } from '@/styles/animations';

export default function CreateRoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" /></div>}>
      <CreateRoomContent />
    </Suspense>
  );
}

function CreateRoomContent() {
  const router = useRouter();
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
      router.push(`/oda/${store.roomCode}`);
    }
  }, [store.roomCode, router]);

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
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-accent-indigo/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent-emerald/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeCurve }}
        className="relative z-10 w-full max-w-lg"
      >
        <h1 className="text-3xl font-bold gradient-text text-center mb-8">
          Oda Oluştur
        </h1>

        <GlassCard className="p-6 space-y-6">
          {/* Rounds */}
          <div>
            <label className="flex justify-between text-sm text-white/50 mb-2">
              <span>Tur Sayısı</span>
              <span className="text-white">{rounds}</span>
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full accent-accent-indigo"
            />
          </div>

          {/* Draw Time */}
          <div>
            <label className="flex justify-between text-sm text-white/50 mb-2">
              <span>Çizim Süresi</span>
              <span className="text-white">{drawTime}s</span>
            </label>
            <input
              type="range"
              min={30}
              max={120}
              step={10}
              value={drawTime}
              onChange={(e) => setDrawTime(Number(e.target.value))}
              className="w-full accent-accent-indigo"
            />
          </div>

          {/* Max Players */}
          <div>
            <label className="flex justify-between text-sm text-white/50 mb-2">
              <span>Maks Oyuncu</span>
              <span className="text-white">{maxPlayers}</span>
            </label>
            <input
              type="range"
              min={2}
              max={12}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              className="w-full accent-accent-indigo"
            />
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm text-white/50 mb-3">
              Kategoriler
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categories).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => toggleCategory(key)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm transition-all duration-200',
                    selectedCategories.includes(key)
                      ? 'bg-accent-indigo/20 border border-accent-indigo/50 text-accent-indigo'
                      : 'bg-white/[0.03] border border-white/[0.08] text-white/50 hover:text-white/70'
                  )}
                >
                  {cat.emoji} {cat.name}
                </button>
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
            Oda Oluştur
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  );
}
