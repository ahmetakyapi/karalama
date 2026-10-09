'use client';

import { useState, useRef, useCallback, useEffect, type CSSProperties, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AVATAR_CHARACTERS } from '@karalama/shared';
import { cn } from '@/lib/utils';
import { useIntroDone } from '@/lib/intro';
import { EXPO } from '@/components/motion/hooks';
import { useTransitionRouter } from '@/components/motion/PageTransition';
import { useSmoothScroll } from '@/components/motion/SmoothScroll';
import { SectionPlaceholder } from '@/components/landing/common';
import { TopNav } from '@/components/landing/TopNav';
import { PlayerSetup } from '@/components/landing/PlayerSetup';
import { InkTrail } from '@/components/landing/InkTrail';
import { MarqueeBand } from '@/components/landing/MarqueeBand';
import { Manifesto } from '@/components/landing/Manifesto';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { SiteFooter } from '@/components/landing/SiteFooter';
import HeroDemo from '@/components/landing/HeroDemo';

const GameDemo = dynamic(() => import('@/components/landing/GameDemo'), {
  loading: () => <SectionPlaceholder minHeight={600} />,
});
const BentoFeatures = dynamic(() => import('@/components/landing/BentoFeatures'), {
  loading: () => <SectionPlaceholder minHeight={720} />,
});
const FAQSection = dynamic(() => import('@/components/landing/FAQSection'), {
  loading: () => <SectionPlaceholder minHeight={400} />,
});

/* ============================================================
   Ambient background — slow aurora blobs under a fine grid
   ============================================================ */
function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-40 -left-20 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-1/3 -right-32 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[120px]"
      />
      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-0 left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[120px]"
      />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#04070d]" />
    </div>
  );
}

/* ============================================================
   Hero headline pieces
   ============================================================ */
function Line({ children, delay }: { children: ReactNode; delay: number }) {
  return (
    <span className="line-mask">
      <span style={{ ['--d' as string]: `${delay}s` }}>{children}</span>
    </span>
  );
}

/** CSS entrance (paints before hydration); `--d` is its delay. */
const enter = (delay: number) => ({ ['--d' as string]: `${delay}s` }) as CSSProperties;

function Doodle({ play }: { play: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 64 64"
      className="absolute -right-8 top-1 h-8 w-8 sm:-right-14 sm:-top-4 sm:h-14 sm:w-14 text-[var(--marker)]"
      fill="none"
      aria-hidden="true"
      initial={{ rotate: -40, scale: 0.4, opacity: 0 }}
      animate={play ? { rotate: 0, scale: 1, opacity: 1 } : undefined}
      transition={{ duration: 1, ease: EXPO, delay: 1.35 }}
    >
      <motion.path
        d="M32 6 L37 26 L58 28 L41 39 L47 59 L32 47 L17 59 L23 39 L6 28 L27 26 Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={play ? { pathLength: 1 } : undefined}
        transition={{ duration: 1.1, ease: 'easeInOut', delay: 1.4 }}
      />
    </motion.svg>
  );
}

/* ============================================================
   Local helpers
   ============================================================ */
function loadSavedPlayer() {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('karalama_player');
    return saved ? JSON.parse(saved) : null;
  } catch { return null; }
}

function savePlayer(name: string, avatarId: string, color: string) {
  try {
    localStorage.setItem('karalama_player', JSON.stringify({ name, avatarId, color }));
  } catch { /* quota exceeded */ }
}

/* ============================================================
   Main Page
   ============================================================ */
export default function HomePage() {
  const { navigate } = useTransitionRouter();
  const { scrollTo } = useSmoothScroll();
  const ready = useIntroDone();

  const saved = useRef(loadSavedPlayer());
  const hasSaved = !!saved.current?.name;

  const [playerName, setPlayerName] = useState(saved.current?.name || '');
  const [roomCode, setRoomCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(
    () => AVATAR_CHARACTERS.find((a) => a.id === saved.current?.avatarId) || AVATAR_CHARACTERS[0]
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    () => saved.current?.color || AVATAR_CHARACTERS[0].color
  );

  const handleJoin = useCallback(() => {
    if (!playerName.trim() || !roomCode.trim()) return;
    savePlayer(playerName.trim(), selectedAvatar.id, selectedColor);
    const params = new URLSearchParams({
      name: playerName.trim(),
      color: selectedColor,
    });
    navigate(`/oda/${roomCode.toUpperCase()}?${params}`);
  }, [playerName, roomCode, selectedAvatar.id, selectedColor, navigate]);

  const handleCreate = useCallback(() => {
    if (!playerName.trim()) return;
    savePlayer(playerName.trim(), selectedAvatar.id, selectedColor);
    const params = new URLSearchParams({
      name: playerName.trim(),
      color: selectedColor,
    });
    navigate(`/oda/olustur?${params}`);
  }, [playerName, selectedAvatar.id, selectedColor, navigate]);

  const [liveCount, setLiveCount] = useState<number | null>(null);
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://karalama-server.up.railway.app';
    let stopped = false;
    const poll = async () => {
      try {
        const r = await fetch(`${socketUrl}/health`, { cache: 'no-store' });
        if (!r.ok) return;
        const data = (await r.json()) as { players?: number };
        if (!stopped && typeof data.players === 'number') {
          setLiveCount(data.players);
        }
      } catch { /* network error, keep last */ }
    };
    poll();
    const id = setInterval(poll, 30_000);
    return () => { stopped = true; clearInterval(id); };
  }, []);

  // Hero drifts up and dims as you scroll past it
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const copyY = useTransform(heroProgress, [0, 1], [0, -140]);
  const demoY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroFade = useTransform(heroProgress, [0, 0.85], [1, 0.15]);


  return (
    <div className="relative min-h-screen">
      <AuroraBackground />
      <TopNav />

      <main id="main-content">
        {/* ===== HERO ===== */}
        <section
          ref={heroRef}
          id="oyna"
          aria-label="Başlangıç"
          className="relative z-10 min-h-[100svh] px-5 pb-20 pt-28 sm:px-6 lg:pt-36"
        >
          <InkTrail className="pointer-events-none absolute inset-0 h-full w-full" />

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            {/* LEFT: copy + form */}
            <motion.div style={{ y: copyY, opacity: heroFade }} className="flex max-w-2xl flex-col justify-center">
              <div className="intro-fade mb-7 flex" style={enter(0.05)}>
                <a
                  href="#topluluk"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur transition-all hover:border-white/[0.15]"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="font-semibold tabular-nums text-slate-200">{liveCount ?? '…'}</span>
                  <span className="text-slate-500">
                    {liveCount === 0 ? 'ilk oyuncu sen ol' : 'oyuncu çevrimiçi'}
                  </span>
                  <svg aria-hidden="true" className="h-3 w-3 text-slate-500 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              <h1 className="mb-7 font-display text-[56px] font-extrabold leading-[0.88] tracking-[-0.055em] text-slate-50 sm:text-[84px] xl:text-[104px]">
                <Line delay={0.1}>Çiz,</Line>
                <Line delay={0.2}>
                  Tahmin{' '}
                  <span className="inline-block -rotate-6 font-hand font-bold tracking-normal text-[var(--marker)]">et,</span>
                </Line>
                <span className="relative block w-fit">
                  <Line delay={0.3}>
                    <span className="text-gradient pr-2">Eğlen.</span>
                  </Line>
                  <Doodle play={ready} />
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 220 14"
                    fill="none"
                    aria-hidden="true"
                    preserveAspectRatio="none"
                  >
                    <motion.path
                      d="M 4 8 Q 60 1 110 8 T 216 6"
                      stroke="url(#underlineGrad)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={ready ? { pathLength: 1 } : undefined}
                      transition={{ duration: 1.2, delay: 1.05, ease: EXPO }}
                    />
                    <defs>
                      <linearGradient id="underlineGrad" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#6366f1" />
                        <stop offset="0.5" stopColor="#22d3ee" />
                        <stop offset="1" stopColor="#c8f560" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
              </h1>

              <p style={enter(0.5)} className="intro-fade mb-9 max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
                Arkadaşlarınla saniyeler içinde oyna. Kayıt yok, indirme yok, reklam yok — tamamen{' '}
                <span className="font-semibold text-slate-200">ücretsiz</span>.
              </p>

              <div className="intro-fade relative w-full max-w-md" style={enter(0.6)}>
                <PlayerSetup
                  playerName={playerName}
                  setPlayerName={setPlayerName}
                  roomCode={roomCode}
                  setRoomCode={setRoomCode}
                  selectedAvatar={selectedAvatar}
                  setSelectedAvatar={setSelectedAvatar}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  hasSaved={hasSaved}
                  onCreate={handleCreate}
                  onJoin={handleJoin}
                />
                {/* Hand-written nudge */}
                <motion.div
                  aria-hidden="true"
                  initial={{ opacity: 0, x: -10 }}
                  animate={ready ? { opacity: 1, x: 0 } : undefined}
                  transition={{ duration: 0.8, ease: EXPO, delay: 1.6 }}
                  className="pointer-events-none absolute -right-44 top-6 hidden w-40 xl:block"
                >
                  <svg viewBox="0 0 120 60" className="w-24 text-slate-500" fill="none">
                    <motion.path
                      d="M112 10 C 80 4, 40 10, 14 40 M14 40 L 30 38 M14 40 L 18 24"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={ready ? { pathLength: 1 } : undefined}
                      transition={{ duration: 1, delay: 1.7 }}
                    />
                  </svg>
                  <p className="-mt-1 rotate-[-4deg] font-hand text-2xl leading-tight text-slate-400">
                    adını yaz,
                    <br />
                    gerisi kolay!
                  </p>
                </motion.div>
              </div>

              <div style={enter(0.85)} className="intro-fade mt-6 flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <svg aria-hidden="true" className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Güvenli bağlantı
                </div>
                <div className="flex items-center gap-1.5">
                  <svg aria-hidden="true" className="h-3.5 w-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  &lt;100ms gecikme
                </div>
              </div>
            </motion.div>

            {/* RIGHT: animated preview */}
            <motion.div style={{ y: demoY }}>
              <HeroDemo />
            </motion.div>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-6 left-0 right-0 hidden justify-center lg:flex">
          <button
            type="button"
            onClick={() => scrollTo('#nasil')}
            style={enter(1.2)}
            className="intro-fade flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-slate-500 transition-colors hover:text-slate-300"
          >
            Kaydır
            <span className="relative block h-10 w-px overflow-hidden bg-white/10">
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-[var(--marker)]"
                animate={{ y: ['-100%', '200%'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              />
            </span>
          </button>
          </div>
        </section>

        <MarqueeBand />
        <Manifesto />
        <GameDemo />
        <BentoFeatures />
        <FAQSection />
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  );
}
