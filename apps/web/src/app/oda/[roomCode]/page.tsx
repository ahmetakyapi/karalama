'use client';

import { Suspense, useEffect } from 'react';
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

    // Wait for connection then join
    const onConnect = () => {
      if (!store.playerId) {
        s.emit('room:join', {
          roomCode: roomCode.toUpperCase(),
          playerName,
          avatarColor: playerColor,
        });
        store.setRoomCode(roomCode.toUpperCase());
      }
    };

    if (s.connected) {
      onConnect();
    } else {
      s.on('connect', onConnect);
    }

    return () => {
      s.off('connect', onConnect);
    };
  }, [roomCode, playerName, playerColor]);

  const { phase, isConnected } = store;

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50">Bağlanıyor...</p>
        </div>
      </div>
    );
  }

  if (phase === 'GAME_OVER') {
    return <GameOverScreen />;
  }

  if (phase === 'WAITING') {
    return <LobbyView />;
  }

  return <GameView />;
}
