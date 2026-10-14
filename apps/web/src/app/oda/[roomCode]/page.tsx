'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/stores/gameStore';
import { LobbyView } from '@/components/lobby/LobbyView';
import { JoinGate } from '@/components/lobby/JoinGate';
import { GameView } from '@/components/game/GameView';
import { GameOverScreen } from '@/components/game/GameOverScreen';
import { getSocket } from '@/lib/socket';
import { loadSavedPlayer } from '@/lib/player';
import { InkLoader } from '@/components/ui/InkLoader';
import { ServerUnreachable } from '@/components/ui/ServerUnreachable';

type Identity = { name: string; color: string };

export default function RoomPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><InkLoader /></div>}>
      <RoomContent />
    </Suspense>
  );
}

function RoomContent() {
  const { roomCode: rawCode } = useParams<{ roomCode: string }>();
  const roomCode = rawCode.toUpperCase();
  const params = useSearchParams();
  useSocket();
  const store = useGameStore();

  // Who joins: the landing page passes ?name=…; the host arrives already in
  // the room; anyone opening a shared link is asked first (JoinGate). Kept in
  // state so reconnects rejoin under the same name after the URL is cleaned.
  const [identity, setIdentity] = useState<Identity | null>(() => {
    const name = params.get('name');
    if (name) return { name, color: params.get('color') || '#6366f1' };
    const st = useGameStore.getState();
    if (st.playerId && st.roomCode === roomCode) {
      const saved = loadSavedPlayer();
      return { name: saved?.name || 'Oyuncu', color: saved?.color || '#6366f1' };
    }
    return null;
  });
  const identityRef = useRef(identity);
  identityRef.current = identity;

  useEffect(() => {
    if (!identity) return;
    const s = getSocket();

    const joinRoom = () => {
      const me = identityRef.current;
      if (!me) return;
      s.emit('room:join', { roomCode, playerName: me.name, avatarColor: me.color });
      useGameStore.getState().setRoomCode(roomCode);
    };

    const st = useGameStore.getState();
    const alreadyIn = !!st.playerId && st.roomCode === roomCode;
    if (s.connected && !alreadyIn) joinRoom();
    if (!s.connected) s.connect();
    // Initial connect and every reconnect (a new socket is a new seat)
    s.on('connect', joinRoom);
    return () => {
      s.off('connect', joinRoom);
    };
  }, [identity, roomCode]);

  // Once in, drop ?name=&color= from the address bar: people copy it to
  // invite friends, and the next person would join under this name.
  const { playerId } = store;
  useEffect(() => {
    if (playerId && window.location.search) {
      window.history.replaceState(window.history.state, '', `/oda/${roomCode}`);
    }
  }, [playerId, roomCode]);

  const { phase, isConnected, connectionFailed, roomError } = store;
  const [wasConnected, setWasConnected] = useState(false);

  useEffect(() => {
    if (isConnected) setWasConnected(true);
  }, [isConnected]);

  // Room error (e.g. room not found, room full, kicked)
  if (roomError) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center space-y-4 animate-rise px-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <svg aria-hidden="true" className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-slate-100">{roomError}</h1>
          <p className="mx-auto max-w-xs text-sm text-slate-400">
            Oda kodunu kontrol et ya da ana sayfadan yeni bir oda kur.
          </p>
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

  if (!identity) {
    return <JoinGate roomCode={roomCode} onJoin={(name, color) => setIdentity({ name, color })} />;
  }

  // First time connecting
  if (!isConnected && !wasConnected) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center px-6">
        {connectionFailed ? (
          <ServerUnreachable />
        ) : (
          <div className="text-center animate-rise">
            <p className="mb-6 text-[13px] font-medium text-slate-400">
              <span className="font-mono font-bold tracking-[0.18em] text-[var(--marker)]">{roomCode}</span> Odası
            </p>
            <InkLoader label="Bağlanıyor" />
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Reconnecting banner */}
      {!isConnected && wasConnected && (
        <div role="status" className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/90 text-center py-2 px-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium text-white">Bağlantı koptu, yeniden bağlanılıyor…</span>
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
