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
import { Glyph, PointerLight, Tape } from '@/components/ui/Sketch';

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

  const customCount = customWordsText.split(/[,\n]/).filter((w) => w.trim()).length;
  const noWords = selectedCategories.length === 0 && !customWordsText.trim();
  const totalMinutes = Math.max(1, Math.round((rounds * maxPlayers * (drawTime + 12)) / 60));

  return (
    <div className="dot-paper relative min-h-screen overflow-x-clip px-4 pb-20 pt-20 sm:px-6 lg:pt-24">
      <PointerLight />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] text-accent-indigo/10 glow" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] text-accent-emerald/10 glow" />
        <Glyph name="spiral" className="float-slow absolute left-[3%] top-[46%] hidden h-16 w-16 text-slate-600 lg:block" />
        <Glyph name="star" className="float-slow absolute right-[8%] top-[12%] hidden h-10 w-10 text-lime-300/50 lg:block" style={{ ['--r' as string]: '12deg', animationDelay: '-2s' }} />
        <Glyph name="squiggle" className="float-slow absolute bottom-[12%] left-[10%] hidden h-14 w-14 text-cyan-400/30 lg:block" style={{ animationDelay: '-4s' }} />
      </div>

      <a
        href="/"
        className="group absolute left-5 top-6 z-10 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100 sm:left-8"
      >
        <span className="transition-transform duration-500 ease-expo group-hover:-translate-x-1">←</span>
        Ana Sayfa
      </a>

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <header className="mb-10 text-center lg:mb-14 lg:text-left">
          <h1 className="font-display text-6xl font-extrabold tracking-[-0.05em] text-slate-50 sm:text-7xl lg:text-8xl">
            <span className="line-mask !inline-block align-bottom"><span style={enter(0.1)}>Odanı&nbsp;</span></span>
            <span className="line-mask !inline-block align-bottom">
              <span style={enter(0.18)} className="text-gradient pr-[0.04em]">Kur</span>
            </span>
            <span className="pop-in mt-1 block font-hand lg:ml-4 lg:mt-0 lg:inline-block lg:-rotate-6 lg:align-top text-3xl font-bold tracking-normal text-[var(--marker)] sm:text-4xl" style={{ ['--d' as string]: '0.7s' }}>
              kurallar senin!
            </span>
          </h1>
          <p style={enter(0.35)} className="intro-fade mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-400 lg:mx-0">
            Turu, süreyi ve kelimeleri seç. Oda biletin sen değiştirdikçe güncellenir.
          </p>
        </header>

        {store.roomError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
            className="mx-auto mb-6 max-w-lg rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 lg:mx-0"
          >
            {store.roomError}. Ana sayfaya yönlendiriliyorsun…
          </motion.div>
        )}

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
          {/* ===== Settings ===== */}
          <div className="intro-fade" style={enter(0.3)}>
            <GlassCard className="space-y-8 p-6 sm:p-8">
              <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
                <RulerField id="opt-rounds" label="Tur" value={rounds} unit="tur" min={1} max={10} onChange={setRounds} />
                <RulerField id="opt-time" label="Çizim Süresi" value={drawTime} unit="sn" min={30} max={120} step={10} onChange={setDrawTime} />
                <RulerField id="opt-players" label="En Fazla Oyuncu" value={maxPlayers} unit="kişi" min={2} max={12} onChange={setMaxPlayers} />
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Categories */}
              <div>
                <div className="mb-4 flex items-baseline justify-between gap-4">
                  <p id="opt-categories" className="text-[13px] font-semibold text-slate-200">Kategoriler</p>
                  <div className="flex items-center gap-3 text-[13px]">
                    <span className="tabular-nums text-slate-400">{selectedCategories.length} Seçili</span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          prev.length === Object.keys(categories).length ? [] : Object.keys(categories)
                        )
                      }
                      className="font-medium text-cyan-300 underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:text-cyan-200"
                    >
                      {selectedCategories.length === Object.keys(categories).length ? 'Hiçbiri' : 'Hepsi'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3" role="group" aria-labelledby="opt-categories">
                  {Object.entries(categories).map(([key, cat]) => {
                    const on = selectedCategories.includes(key);
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        aria-pressed={on}
                        onClick={() => toggleCategory(key)}
                        className={cn(
                          'group relative flex min-h-[44px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-sm transition-[background-color,border-color,color] duration-300',
                          on
                            ? 'border-[rgba(200,245,96,0.45)] bg-[rgba(200,245,96,0.08)] text-slate-50'
                            : 'border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                        )}
                      >
                        <span className="text-base leading-none" aria-hidden="true">{cat.emoji}</span>
                        <span className="min-w-0 flex-1 font-medium leading-tight">{cat.name}</span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            'flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors duration-300',
                            on ? 'border-[var(--marker)] bg-[var(--marker)] text-[#04070d]' : 'border-white/20'
                          )}
                        >
                          {on && (
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none">
                              <path d="M2 6.5 L5 9 L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="draw-in" />
                            </svg>
                          )}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Words */}
              <div>
                <label htmlFor="opt-words" className="mb-2 flex items-baseline justify-between text-[13px] font-semibold text-slate-200">
                  <span>
                    Özel Kelimeler <span className="font-medium text-slate-500">(İsteğe Bağlı)</span>
                  </span>
                  {customCount > 0 && <span className="font-medium tabular-nums text-slate-400">{customCount} kelime</span>}
                </label>
                <textarea
                  id="opt-words"
                  value={customWordsText}
                  onChange={(e) => setCustomWordsText(e.target.value)}
                  placeholder="Kelimeleri virgülle ya da alt alta yaz…&#10;Örnek: pizza, astronot, kaykay"
                  rows={3}
                  className={cn(
                    'w-full resize-none rounded-xl px-4 py-3 text-sm leading-relaxed',
                    'border border-white/[0.07] bg-white/[0.02]',
                    'text-white placeholder:text-slate-500',
                    'transition-colors duration-200 focus:border-lime-300/40 focus:outline-none'
                  )}
                />
                <p className="mt-2 font-hand text-lg text-slate-500">iç şakalarınız burada işe yarar ✎</p>
              </div>
            </GlassCard>
          </div>

          {/* ===== Live ticket ===== */}
          <aside className="intro-fade lg:sticky lg:top-24" style={enter(0.45)} aria-label="Oda özeti">
            <div className="relative mx-auto max-w-md rotate-[0.6deg] lg:mx-0">
              <Tape className="-top-3 left-8 z-10 -rotate-6" />
              <Tape className="-top-2 right-10 z-10 rotate-3" />
              <div className="ticket paper-plain rounded-[20px] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.75)]" style={{ ['--stub' as string]: '112px' }}>
                <div className="px-6 pb-6 pt-8 sm:px-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-hand text-2xl font-bold text-[var(--paper-red)]">Oda Bileti</p>
                      <p className="mt-1 text-[13px] font-medium text-[var(--paper-muted)]">Kurucu</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full ring-2 ring-white/70" style={{ background: playerColor }} aria-hidden="true" />
                        <span className="max-w-[12rem] truncate font-display text-xl font-bold tracking-[-0.02em]">{playerName}</span>
                      </div>
                    </div>
                    <Glyph name="pencil" className="wobble h-12 w-12 shrink-0 text-[var(--paper-ink)]" strokeWidth={2.2} />
                  </div>

                  <dl className="mt-7 grid grid-cols-3 gap-3 border-y border-dashed border-[rgba(31,36,48,0.22)] py-5">
                    {[
                      { k: 'Tur', v: rounds },
                      { k: 'Saniye', v: drawTime },
                      { k: 'Kişi', v: maxPlayers },
                    ].map((s) => (
                      <div key={s.k} className="text-center">
                        <dd className="font-display text-4xl font-extrabold tabular-nums tracking-[-0.05em]">
                          <motion.span key={s.v} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
                            {s.v}
                          </motion.span>
                        </dd>
                        <dt className="mt-1 font-hand text-lg text-[var(--paper-muted)]">{s.k}</dt>
                      </div>
                    ))}
                  </dl>

                  {/* Seats */}
                  <div className="mt-5">
                    <p className="mb-2 text-[13px] font-medium text-[var(--paper-muted)]">Sandalyeler</p>
                    <div className="flex flex-wrap gap-1.5" aria-label={`${maxPlayers} kişilik oda`}>
                      {Array.from({ length: maxPlayers }).map((_, i) => (
                        <motion.span
                          key={i}
                          layout
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                          className={cn(
                            'h-5 w-5 rounded-full',
                            i === 0 ? '' : 'border-[1.5px] border-dashed border-[rgba(31,36,48,0.4)]'
                          )}
                          style={i === 0 ? { background: playerColor } : undefined}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Category stamps */}
                  <div className="mt-5">
                    <p className="mb-2 text-[13px] font-medium text-[var(--paper-muted)]">
                      Kelime Havuzu{customCount > 0 && <span> · {customCount} özel</span>}
                    </p>
                    <div className="flex min-h-[2rem] flex-wrap gap-1.5">
                      {selectedCategories.length === 0 && customCount === 0 ? (
                        <span className="font-hand text-lg text-[var(--paper-red)]">en az bir kategori seç!</span>
                      ) : (
                        selectedCategories.map((k) => {
                          const cat = categories[k as keyof typeof categories];
                          if (!cat) return null;
                          return (
                            <motion.span
                              key={k}
                              initial={{ scale: 1.6, opacity: 0, rotate: -12 }}
                              animate={{ scale: 1, opacity: 1, rotate: 0 }}
                              className="inline-flex items-center gap-1 rounded-md border border-[rgba(31,36,48,0.14)] bg-white/50 px-2 py-0.5 text-[12px] font-semibold"
                            >
                              <span aria-hidden="true">{cat.emoji}</span>
                              {cat.name}
                            </motion.span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                <div className="perforation mx-6 text-[var(--paper-ink)]" aria-hidden="true" />

                <div className="flex h-[112px] items-center gap-4 px-6 sm:px-8">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-[var(--paper-muted)]">Oda Dolarsa En Uzun</p>
                    <p className="font-display text-2xl font-extrabold tabular-nums tracking-[-0.03em]">~{totalMinutes} dk</p>
                  </div>
                  <svg viewBox="0 0 120 40" className="h-10 w-28 shrink-0 text-[var(--paper-ink)]" aria-hidden="true">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <rect key={i} x={i * 4.3} y={0} width={(i * 7) % 3 === 0 ? 2.4 : 1.2} height={40} fill="currentColor" opacity={0.85} />
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-md lg:mx-0">
              {store.connectionFailed && !store.isConnected ? (
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-6">
                  <ServerUnreachable heading="h2" />
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handleCreate}
                  disabled={!store.isConnected || creating || noWords}
                  aria-busy={creating || !store.isConnected}
                  className="group w-full"
                >
                  {!store.isConnected
                    ? 'Sunucuya Bağlanıyor…'
                    : creating
                      ? 'Oda Kuruluyor…'
                      : noWords
                        ? 'En Az Bir Kategori Seç'
                        : (
                          <span className="inline-flex items-center gap-2">
                            Odayı Aç
                            <span aria-hidden="true" className="transition-transform duration-500 ease-expo group-hover:translate-x-1">→</span>
                          </span>
                        )}
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

/** A range input drawn like a pencil ruler: ticks under the track, big value. */
function RulerField({
  id,
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  const steps = (max - min) / step;
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-slate-200">
        {label}
      </label>
      <p className="mb-3 mt-1 font-display text-4xl font-extrabold tabular-nums tracking-[-0.05em] text-white" aria-hidden="true">
        <motion.span key={value} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block">
          {value}
        </motion.span>
        <span className="ml-1 text-sm font-semibold tracking-normal text-slate-500">{unit}</span>
      </p>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${value} ${unit}`}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range"
        style={fill(value, min, max)}
      />
      <div className="ruler-ticks" style={{ ['--steps' as string]: steps }} aria-hidden="true" />
      <div className="mt-1 flex justify-between text-[11px] font-medium tabular-nums text-slate-500" aria-hidden="true">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
