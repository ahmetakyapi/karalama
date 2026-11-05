'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getSocket } from '@/lib/socket';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { easeCurve } from '@/styles/animations';
import { MAX_BOTS } from '@karalama/shared';
import { roomLink } from '@/lib/player';
import { Glyph, PointerLight, ScribbleUnderline, Tape } from '@/components/ui/Sketch';

export function LobbyView() {
  const { players, hostId, playerId, roomCode, settings } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const playerList = Object.values(players);
  const botList = playerList.filter((p) => p.isBot);
  const isHost = playerId === hostId;
  const notReady = playerList.filter((p) => p.id !== hostId && !p.isBot && !p.isReady);
  const allReady = playerList.length >= 2 && notReady.length === 0;
  const link = () => roomLink(roomCode ?? '');

  const handleReady = () => {
    getSocket().emit('player:ready');
  };

  const handleStart = () => {
    getSocket().emit('game:start');
  };

  const handleAddBot = () => {
    getSocket().emit('room:addBot');
  };

  const handleRemoveBot = (botId: string) => {
    getSocket().emit('room:removeBot', { botId });
  };

  const handleCopy = async () => {
    const url = link();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API blocked — fall back to selection
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const url = link();
    const text = `Karalama'da çizim oyunu oynayalım! Oda: ${roomCode}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Karalama', text, url });
        return;
      } catch { /* user dismissed */ }
    }
    handleCopy();
  };

  const me = players[playerId ?? ''];
  const seats = Math.max(settings.maxPlayers, playerList.length);
  const canAddBot = isHost && botList.length < MAX_BOTS && playerList.length < settings.maxPlayers;
  const shareText = `Karalama'da çizim oyunu oynayalım! Oda kodu: ${roomCode}`;

  return (
    <div className="dot-paper relative min-h-[100dvh] overflow-x-clip px-4 pb-16 pt-20 sm:px-6 lg:flex lg:items-center lg:pt-16">
      <PointerLight />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute left-[-10%] top-[-20%] h-[420px] w-[420px] text-accent-indigo/10 glow" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[420px] w-[420px] text-accent-cyan/10 glow" />
      </div>

      <a
        href="/"
        className="group absolute left-5 top-6 z-10 inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100 sm:left-8"
      >
        <span aria-hidden="true" className="transition-transform duration-500 ease-expo group-hover:-translate-x-1">←</span>
        Odadan Çık
      </a>

      <h1 className="sr-only">{roomCode} Odası</h1>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
        {/* ===== Ticket: code, settings, share ===== */}
        <motion.section
          aria-label="Oda bileti"
          initial={{ opacity: 0, y: 40, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -0.6 }}
          transition={{ duration: 0.9, ease: easeCurve }}
          className="relative mx-auto w-full max-w-md lg:sticky lg:top-16"
        >
          <Tape className="-top-3 left-8 z-10 -rotate-6" />
          <Tape className="-top-2 right-10 z-10 rotate-3" />
          <div className="ticket paper-plain rounded-[22px] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.75)]" style={{ ['--stub' as string]: showQR ? '248px' : '84px' }}>
            <div className="px-6 pb-6 pt-8 sm:px-8">
              <div className="flex items-center justify-between">
                <p className="font-hand text-2xl font-bold text-[var(--paper-red)]">Oda Kodu</p>
                <span className="rounded-full border border-[rgba(31,36,48,0.18)] px-2.5 py-0.5 text-[12px] font-semibold tabular-nums text-[var(--paper-muted)]">
                  {playerList.length}/{settings.maxPlayers} Kişi
                </span>
              </div>

              {/* Split-flap code */}
              <div className="mt-4 flex justify-between gap-1.5 sm:gap-2" aria-label={roomCode ?? undefined} role="img">
                {(roomCode ?? '').split('').map((ch, i) => (
                  <span key={`${ch}-${i}`} aria-hidden="true" className="relative flex-1 overflow-hidden rounded-lg bg-[#1f2430] shadow-[inset_0_-2px_0_rgba(0,0,0,0.4)]" style={{ perspective: 400 }}>
                    <motion.span
                      className="block py-2 text-center font-display text-4xl font-extrabold text-[#f3eee3] sm:text-5xl"
                      initial={{ rotateX: -90, opacity: 0 }}
                      animate={{ rotateX: 0, opacity: 1 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 + i * 0.08 }}
                      style={{ transformOrigin: '50% 0%' }}
                    >
                      {ch}
                    </motion.span>
                    <span className="absolute inset-x-0 top-1/2 h-px bg-black/50" />
                  </span>
                ))}
              </div>

              <dl className="mt-6 grid grid-cols-3 gap-3 border-y border-dashed border-[rgba(31,36,48,0.22)] py-4 text-center">
                {[
                  { k: 'Tur', v: settings.totalRounds },
                  { k: 'Saniye', v: settings.drawTime },
                  { k: 'Kişilik', v: settings.maxPlayers },
                ].map((s) => (
                  <div key={s.k}>
                    <dd className="font-display text-3xl font-extrabold tabular-nums tracking-[-0.05em]">{s.v}</dd>
                    <dt className="font-hand text-lg text-[var(--paper-muted)]">{s.k}</dt>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNativeShare}
                  aria-label="Oda Bağlantısını Paylaş"
                  className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#1f2430] px-4 text-sm font-semibold text-[#f3eee3] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7M16 6l-4-4-4 4M12 2v14" />
                  </svg>
                  {copied ? 'Kopyalandı!' : 'Davet Et'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQR((v) => !v)}
                  aria-expanded={showQR}
                  aria-label={showQR ? 'QR Kodu Gizle' : 'QR Kodu Göster'}
                  className={cn(
                    'inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
                    showQR ? 'border-[#1f2430] bg-[#1f2430] text-[#f3eee3]' : 'border-[rgba(31,36,48,0.2)] text-[#1f2430] hover:bg-black/5'
                  )}
                >
                  <svg className="h-4 w-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h3v3h-3zM19 14h2M14 19h2M17 17v4M19 17v2" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="perforation mx-6 text-[var(--paper-ink)]" aria-hidden="true" />

            {/* Stub */}
            <div className="px-6 py-4 sm:px-8">
              {showQR ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 py-2">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&color=1f2430&bgcolor=f3eee3&data=${encodeURIComponent(link())}`}
                    alt={`Oda ${roomCode} için QR kodu`}
                    width={200}
                    height={200}
                    className="block h-[200px] w-[200px] max-w-[55%] object-contain"
                    loading="lazy"
                  />
                  <p className="font-hand text-xl leading-snug text-[var(--paper-muted)]">Telefonla tara, doğrudan katıl!</p>
                </motion.div>
              ) : (
                <div className="flex h-[52px] items-center justify-between gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + link())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[40px] items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[#128C4A] transition-colors hover:bg-[#25D366]/10"
                  >
                    <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp
                  </a>
                  <button
                    type="button"
                    onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(link())}&text=${encodeURIComponent(shareText)}`, '_blank')}
                    className="flex min-h-[40px] items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[#1a7fb5] transition-colors hover:bg-[#26A5E4]/10"
                  >
                    <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    Telegram
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    aria-live="polite"
                    className="flex min-h-[40px] items-center gap-1.5 rounded-lg px-2 text-[13px] font-semibold text-[var(--paper-ink)] transition-colors hover:bg-black/5"
                  >
                    <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                    {copied ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="mt-5 hidden rotate-[-2deg] text-center font-hand text-xl text-slate-400 lg:block">
            bağlantıyı gönder, arkadaşların doğrudan masaya otursun ↗
          </p>
        </motion.section>

        {/* ===== Table: seats ===== */}
        <section aria-labelledby="seats-title" className="min-w-0">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 id="seats-title" className="font-display text-4xl font-extrabold tracking-[-0.045em] text-slate-50 sm:text-5xl">
                Masa{' '}
                <span className="relative inline-block font-hand text-[0.8em] font-bold tracking-normal text-[var(--marker)]">
                  kuruluyor
                  <ScribbleUnderline delay={0.6} />
                </span>
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                <span className="tabular-nums text-slate-200">{playerList.length}</span> kişi oturdu,{' '}
                <span className="tabular-nums text-slate-200">{Math.max(0, settings.maxPlayers - playerList.length)}</span> sandalye boş
              </p>
            </div>
            <WaitingDots />
          </div>

          <ul className="grid grid-cols-3 gap-2 sm:gap-3">
            <AnimatePresence initial={true}>
              {playerList.map((player, i) => (
                <motion.li
                  key={player.id}
                  layout
                  initial={{ opacity: 0, scale: 0.7, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24, delay: i * 0.05 }}
                  className={cn(
                    'group relative flex min-h-[118px] flex-col items-center justify-center gap-1.5 rounded-2xl border bg-[#070b14] p-2 sm:min-h-[132px] sm:gap-2 sm:p-3 text-center',
                    player.id === playerId ? 'border-[rgba(200,245,96,0.35)]' : 'border-white/[0.07]'
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${player.avatarColor}, transparent)` }}
                  />
                  <span className="relative">
                    <span
                      className="absolute -inset-1.5 rounded-full opacity-40 blur-md"
                      style={{ background: player.avatarColor }}
                      aria-hidden="true"
                    />
                    <Avatar name={player.name} color={player.avatarColor} size="lg" isHost={player.isHost} className="relative scale-[0.85] sm:scale-100" />
                  </span>
                  <span className="w-full truncate px-1 text-sm font-semibold text-slate-100">
                    {player.name}
                    {player.id === playerId && <span className="ml-1 font-hand text-base font-bold text-[var(--marker)]">sen</span>}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {player.isHost ? (
                      <Badge variant="warning">Kurucu</Badge>
                    ) : player.isBot ? (
                      <Badge variant="info">Bot</Badge>
                    ) : player.isReady ? (
                      <Badge variant="success">Hazır</Badge>
                    ) : (
                      <Badge>Bekliyor</Badge>
                    )}
                  </span>
                  {player.isBot && isHost && (
                    <button
                      onClick={() => handleRemoveBot(player.id)}
                      aria-label={`${player.name} botunu kaldır`}
                      className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                    >
                      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                  )}
                </motion.li>
              ))}
              {Array.from({ length: Math.max(0, seats - playerList.length) }).map((_, i) => {
                const isBotSeat = i === 0 && canAddBot;
                return (
                  <motion.li
                    key={`empty-${i}`}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.03 }}
                    className="relative min-h-[118px] sm:min-h-[132px]"
                  >
                    <span aria-hidden="true" className="pencil-seat absolute inset-0" />
                    {isBotSeat ? (
                      <button
                        type="button"
                        onClick={handleAddBot}
                        className="group relative flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl text-cyan-300 transition-colors hover:bg-cyan-400/[0.05]"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-400/30 transition-transform duration-500 ease-expo group-hover:rotate-90">
                          <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                        </span>
                        <span className="text-sm font-semibold">Bot Oturt</span>
                        <span className="text-[12px] tabular-nums text-slate-500">{botList.length}/{MAX_BOTS} bot</span>
                      </button>
                    ) : (
                      <span className="relative flex h-full flex-col items-center justify-center gap-1 text-slate-600">
                        <Glyph name={(['smile', 'star', 'cloud', 'heart', 'spiral', 'bolt'] as const)[i % 6]} className="h-8 w-8" strokeWidth={2} />
                        <span className="font-hand text-base sm:text-lg">boş sandalye</span>
                      </span>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            {isHost ? (
              <Button size="lg" onClick={handleStart} disabled={!allReady || playerList.length < 2} className="w-full">
                {playerList.length < 2 ? 'En Az 2 Oyuncu Gerekli' : !allReady ? 'Herkes Hazır Olmalı' : 'Oyunu Başlat'}
              </Button>
            ) : (
              <Button size="lg" variant={me?.isReady ? 'secondary' : 'primary'} onClick={handleReady} className="w-full">
                {me?.isReady ? 'Hazır (İptal)' : 'Hazırım'}
              </Button>
            )}
            {isHost && playerList.length >= 2 && notReady.length > 0 && (
              <p role="status" className="text-center text-[13px] text-slate-400">
                Hazır olması beklenen: <span className="text-slate-200">{notReady.map((p) => p.name).join(', ')}</span>
              </p>
            )}
            {isHost && playerList.length < 2 && (
              <p className="text-center text-[13px] text-slate-400">
                Bağlantıyı arkadaşlarına gönder ya da boş sandalyeye bot oturt
              </p>
            )}
            {!isHost && me?.isReady && (
              <p role="status" className="text-center text-[13px] text-slate-400">
                Kurucunun oyunu başlatması bekleniyor
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/** Three pencil dots bouncing in turn — "someone is coming". */
function WaitingDots() {
  return (
    <span className="ink-dots hidden shrink-0 items-center gap-1.5 pb-3 sm:flex" aria-hidden="true">
      <span className="h-2 w-2 rounded-full bg-[var(--marker)]" />
      <span className="h-2 w-2 rounded-full bg-[var(--marker)]" />
      <span className="h-2 w-2 rounded-full bg-[var(--marker)]" />
    </span>
  );
}
