'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { getSocket } from '@/lib/socket';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { easeCurve } from '@/styles/animations';
import { MAX_BOTS } from '@karalama/shared';

export function LobbyView() {
  const { players, hostId, playerId, roomCode, settings } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const playerList = Object.values(players);
  const botList = playerList.filter((p) => p.isBot);
  const isHost = playerId === hostId;
  const allReady =
    playerList.length >= 2 &&
    playerList.filter((p) => p.id !== hostId && !p.isBot).every((p) => p.isReady);

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
    const url = window.location.href;
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
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const text = `Karalama'da çizim oyunu oynayalım! Oda: ${roomCode}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Karalama', text, url });
        return;
      } catch { /* user dismissed */ }
    }
    handleCopy();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-accent-indigo/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeCurve }}
        className="relative z-10 w-full max-w-lg space-y-4"
      >
        {/* Room Code */}
        <div className="text-center">
          <p className="text-sm text-white/40 mb-1">Oda Kodu</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-bold font-mono tracking-[0.3em] gradient-text">
              {roomCode}
            </span>
            <Button variant="ghost" size="sm" onClick={handleNativeShare} aria-label="Oda linkini paylaş">
              {copied ? 'Kopyalandı!' : 'Paylaş'}
            </Button>
            <button
              type="button"
              onClick={() => setShowQR((v) => !v)}
              aria-expanded={showQR}
              aria-label={showQR ? 'QR kodu gizle' : 'QR kodu göster'}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h3v3h-3zM19 14h2M14 19h2M17 17v4M19 17v2" />
              </svg>
            </button>
          </div>

          {/* QR panel */}
          {showQR && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 flex flex-col items-center gap-2"
            >
              <div className="p-3 rounded-2xl bg-white">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=0&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                  alt={`Oda ${roomCode} için QR kodu`}
                  width={200}
                  height={200}
                  className="block"
                  loading="lazy"
                />
              </div>
              <p className="text-[11px] text-white/40">
                Telefonla tara ve direkt katıl
              </p>
            </motion.div>
          )}
        </div>

        {/* Settings summary */}
        <div className="flex justify-center gap-3 flex-wrap">
          <Badge variant="info">{settings.totalRounds} Tur</Badge>
          <Badge variant="info">{settings.drawTime}s Çizim</Badge>
          <Badge variant="info">Maks {settings.maxPlayers} Oyuncu</Badge>
        </div>

        {/* Player List */}
        <GlassCard className="p-4">
          <h3 className="text-sm text-white/40 mb-3">
            Oyuncular ({playerList.length}/{settings.maxPlayers})
          </h3>
          <div className="space-y-2">
            {playerList.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: i * 0.08,
                  duration: 0.4,
                  ease: easeCurve,
                }}
                className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]"
              >
                <Avatar
                  name={player.name}
                  color={player.avatarColor}
                  isHost={player.isHost}
                />
                <span className="flex-1 font-medium">
                  {player.name}
                  {player.id === playerId && (
                    <span className="text-white/30 text-sm ml-1">(Sen)</span>
                  )}
                  {player.isBot && (
                    <span className="text-accent-cyan/60 text-sm ml-1">Bot</span>
                  )}
                </span>
                {player.isBot && isHost ? (
                  <button
                    onClick={() => handleRemoveBot(player.id)}
                    className="text-red-400/60 hover:text-red-400 text-xs transition-colors px-1.5 py-0.5 rounded hover:bg-red-500/10"
                  >
                    Kaldır
                  </button>
                ) : null}
                {player.isHost ? (
                  <Badge variant="warning">Host</Badge>
                ) : player.isBot ? (
                  <Badge variant="info">Bot</Badge>
                ) : player.isReady ? (
                  <Badge variant="success">Hazır</Badge>
                ) : (
                  <Badge>Bekliyor</Badge>
                )}
              </motion.div>
            ))}
          </div>

          {/* Bot controls */}
          {isHost && (
            <div className="mt-3 pt-3 border-t border-white/[0.06]">
              <button
                onClick={handleAddBot}
                disabled={botList.length >= MAX_BOTS || playerList.length >= settings.maxPlayers}
                className={cn(
                  'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all',
                  'bg-accent-cyan/[0.06] border border-accent-cyan/20 text-accent-cyan/80',
                  'hover:bg-accent-cyan/[0.12] hover:text-accent-cyan',
                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-accent-cyan/[0.06]'
                )}
              >
                <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Bot Ekle ({botList.length}/{MAX_BOTS})
              </button>
              {botList.length === 0 && (
                <p className="text-[11px] text-white/25 text-center mt-1.5">
                  Tek başına oynamak için bot ekleyebilirsin
                </p>
              )}
            </div>
          )}
        </GlassCard>

        {/* Actions */}
        <div className="flex gap-3">
          {isHost ? (
            <Button
              size="lg"
              onClick={handleStart}
              disabled={!allReady || playerList.length < 2}
              className="flex-1"
            >
              {playerList.length < 2
                ? 'En az 2 oyuncu gerekli'
                : !allReady
                  ? 'Herkes hazır olmalı'
                  : 'Oyunu Başlat'}
            </Button>
          ) : (
            <Button
              size="lg"
              variant={
                players[playerId ?? '']?.isReady ? 'secondary' : 'primary'
              }
              onClick={handleReady}
              className="flex-1"
            >
              {players[playerId ?? '']?.isReady ? 'Hazır (İptal)' : 'Hazırım'}
            </Button>
          )}
        </div>

        {/* Share buttons */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => {
              const url = window.location.href;
              const text = `Karalama'da çizim oyunu oynayalım! Oda kodu: ${roomCode}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 px-3 py-2 text-xs font-medium text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            WhatsApp
          </button>
          <button
            onClick={() => {
              const url = window.location.href;
              const text = `Karalama'da çizim oyunu oynayalım! Oda: ${roomCode}`;
              window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="flex items-center gap-1.5 rounded-xl bg-[#26A5E4]/10 border border-[#26A5E4]/20 px-3 py-2 text-xs font-medium text-[#26A5E4] hover:bg-[#26A5E4]/20 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            Telegram
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/60 hover:bg-white/[0.08] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
            {copied ? 'Kopyalandı!' : 'Link Kopyala'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
