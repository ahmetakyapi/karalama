'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { getSocket } from '@/lib/socket';

/** The game server didn't answer twice in a row — say so, offer a retry. */
export function ServerUnreachable({ heading: Heading = 'h1' }: { heading?: 'h1' | 'h2' }) {
  const [trying, setTrying] = useState(false);
  const retry = () => {
    setTrying(true);
    useGameStore.getState().setConnectionFailed(false);
    const s = getSocket();
    s.disconnect();
    s.connect();
    setTimeout(() => setTrying(false), 1500);
  };
  return (
    <div role="alert" className="max-w-sm text-center animate-rise">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10">
        <svg aria-hidden="true" className="h-8 w-8 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M8.5 16.5a5 5 0 017 0M5 12.9a10 10 0 012.9-2M12 20h.01M16.7 10.9A10 10 0 0119 12.9M1.4 9a15 15 0 014.1-2.7M10.7 5.1A15 15 0 0122.6 9" />
        </svg>
      </div>
      <Heading className="font-display text-2xl font-bold tracking-[-0.02em] text-slate-100">Oyun Sunucusuna Ulaşılamıyor</Heading>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        İnternet bağlantını kontrol et. Sorun bizdeyse birkaç dakika içinde düzelir; arka planda denemeye devam ediyoruz.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={retry}
          disabled={trying}
          className="h-11 rounded-xl bg-[var(--marker)] px-6 text-sm font-bold text-[#04070d] transition-opacity disabled:opacity-60"
        >
          {trying ? 'Deneniyor…' : 'Tekrar Dene'}
        </button>
        <a
          href="/"
          className="inline-flex h-11 items-center rounded-xl border border-white/[0.1] px-6 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.05]"
        >
          Ana Sayfa
        </a>
      </div>
    </div>
  );
}
