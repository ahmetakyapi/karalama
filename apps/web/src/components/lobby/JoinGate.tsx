'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AVATAR_CHARACTERS } from '@karalama/shared';
import { cn } from '@/lib/utils';
import { EXPO } from '@/components/motion/hooks';
import { loadSavedPlayer, nameProblem, savePlayer } from '@/lib/player';

/**
 * Someone opened a shared room link: ask who they are before joining, instead
 * of dropping them in as "Oyuncu". Prefilled from this device's last name.
 */
export function JoinGate({
  roomCode,
  onJoin,
}: {
  roomCode: string;
  onJoin: (name: string, color: string) => void;
}) {
  const [saved] = useState(loadSavedPlayer);
  const [name, setName] = useState(saved?.name ?? '');
  const [avatar, setAvatar] = useState(
    () => AVATAR_CHARACTERS.find((a) => a.id === saved?.avatarId) ?? AVATAR_CHARACTERS[0]
  );
  const problem = nameProblem(name);
  const ready = name.trim().length > 0 && !problem;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const clean = name.trim();
    savePlayer({ name: clean, avatarId: avatar.id, color: avatar.color });
    onJoin(clean, avatar.color);
  };

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="glow absolute -left-24 -top-24 h-[360px] w-[360px] text-accent-indigo/10" />
        <div className="glow absolute -bottom-24 -right-24 h-[360px] w-[360px] text-accent-cyan/10" />
      </div>

      <a
        href="/"
        className="group absolute left-5 top-6 z-10 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100 sm:left-8"
      >
        <span aria-hidden="true" className="transition-transform duration-500 ease-expo group-hover:-translate-x-1">←</span>
        Ana Sayfa
      </a>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EXPO }}
        className="relative z-10 w-full max-w-md"
      >
        <h1 className="text-center font-display text-5xl font-extrabold tracking-[-0.045em] text-slate-50 sm:text-6xl">
          Odaya Katıl
        </h1>
        <p className="mt-3 text-center text-[15px] text-slate-400">
          <span className="font-mono font-bold tracking-[0.18em] text-[var(--marker)]">{roomCode}</span> odası seni
          bekliyor. Adını yaz, karakterini seç.
        </p>

        <div className="glass mt-8 space-y-6 rounded-3xl p-6 sm:p-7">
          <div>
            <label htmlFor="join-name" className="mb-2 flex items-center justify-between text-[13px] font-medium text-slate-300">
              <span>Oyuncu Adın</span>
              <span className="tabular-nums text-slate-500">{name.length}/20</span>
            </label>
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl text-xl"
                style={{ background: `linear-gradient(135deg, ${avatar.color}35, ${avatar.color}70)` }}
              >
                {avatar.emoji}
              </span>
              <input
                id="join-name"
                type="text"
                autoComplete="nickname"
                autoFocus={!saved}
                placeholder="örn: Elif"
                maxLength={20}
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                aria-invalid={!!problem}
                aria-describedby={problem ? 'join-name-problem' : undefined}
                className={cn(
                  'h-14 w-full rounded-2xl border bg-white/[0.04] pl-[64px] pr-4 text-lg font-semibold text-slate-50',
                  'placeholder:font-normal placeholder:text-slate-600 focus:outline-none transition-colors',
                  problem ? 'border-rose-400/50' : 'border-white/[0.1] focus:border-indigo-400/50'
                )}
              />
            </div>
            {problem && (
              <p id="join-name-problem" className="mt-2 text-[13px] text-rose-300">
                {problem}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="mb-2.5 text-[13px] font-medium text-slate-300">Karakterin</legend>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {AVATAR_CHARACTERS.map((a) => {
                const active = a.id === avatar.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setAvatar(a)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-2xl border-2 p-2 transition-colors',
                      active ? 'bg-white/[0.06]' : 'border-transparent bg-white/[0.02] hover:bg-white/[0.05]'
                    )}
                    style={active ? { borderColor: a.color } : undefined}
                  >
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-lg"
                      style={{ background: `linear-gradient(135deg, ${a.color}30, ${a.color}60)` }}
                    >
                      {a.emoji}
                    </span>
                    <span className={cn('text-[12px] font-medium', active ? 'text-slate-100' : 'text-slate-400')}>
                      {a.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={!ready}
            autoFocus={!!saved}
            className={cn(
              'flex h-14 w-full items-center justify-center gap-2 rounded-2xl font-display text-lg font-bold tracking-[-0.02em] transition-[box-shadow,opacity]',
              ready
                ? 'bg-[var(--marker)] text-[#04070d] shadow-[0_10px_30px_rgba(200,245,96,0.25)] hover:shadow-[0_12px_36px_rgba(200,245,96,0.4)]'
                : 'cursor-not-allowed border border-white/[0.08] bg-white/[0.04] text-slate-500'
            )}
          >
            Katıl
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </motion.form>
    </main>
  );
}
