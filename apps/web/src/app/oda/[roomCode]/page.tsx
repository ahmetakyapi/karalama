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

  const { phase, isConnected, roomError } = store;
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (isConnected) setWasConnected(true);
  }, [isConnected]);

  // Room error (e.g. game in progress, room full, kicked)
  if (roomError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-white/70 text-lg font-medium">{roomError}</p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl bg-accent-indigo text-white font-medium text-sm hover:bg-accent-indigo/80 transition-colors"
          >
            Ana Sayfaya Dön
          </a>
        </div>
      </div>
    );
  }

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
