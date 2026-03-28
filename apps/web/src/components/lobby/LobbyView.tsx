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

export function LobbyView() {
  const { players, hostId, playerId, roomCode, settings } = useGameStore();
  const [copied, setCopied] = useState(false);

  const playerList = Object.values(players);
  const isHost = playerId === hostId;
  const allReady =
    playerList.length >= 2 &&
    playerList.filter((p) => p.id !== hostId).every((p) => p.isReady);

  const handleReady = () => {
    getSocket().emit('player:ready');
  };

  const handleStart = () => {
    getSocket().emit('game:start');
  };

  const handleCopy = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? 'Kopyalandı!' : 'Kopyala'}
            </Button>
          </div>
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
                </span>
                {player.isHost ? (
                  <Badge variant="warning">Host</Badge>
                ) : player.isReady ? (
                  <Badge variant="success">Hazır</Badge>
                ) : (
                  <Badge>Bekliyor</Badge>
                )}
              </motion.div>
            ))}
          </div>
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

        {/* Invite hint */}
        <p className="text-center text-white/30 text-sm">
          Arkadaşlarını davet etmek için linki paylaş
        </p>
      </motion.div>
    </div>
  );
}
