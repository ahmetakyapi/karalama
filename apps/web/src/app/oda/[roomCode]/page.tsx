'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { LobbyView } from '@/components/lobby/LobbyView';
import { GameView } from '@/components/game/GameView';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { getSocket } from '@/lib/socket';

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" /></div>}>
      <RoomContent />
    </Suspense>
  );
}

function RoomContent() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const params = useSearchParams();
  const { socket } = useSocket();
  const store = useGameStore();

  const playerName = params.get('name') || 'Oyuncu';
  const playerColor = params.get('color') || '#6366f1';

  useEffect(() => {
    const s = getSocket();
    if (!s.connected) {
      s.connect();
    }

    const joinRoom = () => {
      s.emit('room:join', {
        roomCode: roomCode.toUpperCase(),
        playerName,
        avatarColor: playerColor,
      });
      store.setRoomCode(roomCode.toUpperCase());
    };

    // Join on connect (initial + reconnect)
    const onConnect = () => {
      joinRoom();
    };

    if (s.connected && !store.playerId) {
      joinRoom();
    }
    s.on('connect', onConnect);

    return () => {
      s.off('connect', onConnect);
    };
  }, [roomCode, playerName, playerColor]);

  const { phase, isConnected } = store;
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (isConnected) setWasConnected(true);
  }, [isConnected]);

  // First time connecting
  if (!isConnected && !wasConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Bağlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Reconnecting banner */}
      {!isConnected && wasConnected && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 text-center py-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-white">Bağlantı koptu, yeniden bağlanılıyor...</span>
          </div>
        </div>
      )}
      {phase === 'GAME_OVER' ? (
        <GameOverScreen />
      ) : phase === 'WAITING' ? (
        <LobbyView />
      ) : (
        <GameView />
      )}
    </>
  );
}
