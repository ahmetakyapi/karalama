'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getSocket, type GameSocket } from '@/lib/socket';
import { useGameStore } from '@/stores/gameStore';
import { useChatStore } from '@/stores/chatStore';
import { playSfx } from '@/hooks/useSoundEffects';
import { useProgressStore } from '@/stores/progressStore';

export function useSocket() {
  const socketRef = useRef<GameSocket | null>(null);
  const store = useGameStore();
  const chat = useChatStore();
  const progress = useProgressStore();

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', () => {
      store.setConnected(true);
    });

    socket.on('disconnect', () => {
      store.setConnected(false);
    });

    // Room events
    socket.on('room:created', ({ roomCode, room }) => {
      store.setRoomCode(roomCode);
      store.setPlayerId(socket.id!);
      store.syncRoomState(room);
    });

    socket.on('room:joined', ({ room, playerId }) => {
      store.setPlayerId(playerId);
      store.syncRoomState(room);
    });

    socket.on('room:playerJoined', ({ player }) => {
      store.addPlayer(player);
      playSfx('playerJoin');
    });

    socket.on('room:playerLeft', ({ playerId, newHostId }) => {
      store.removePlayer(playerId, newHostId);
    });

    socket.on('room:settingsUpdated', (settings) => {
      store.setSettings(settings);
    });

    socket.on('room:error', ({ message }) => {
      console.error('Room error:', message);
      store.setRoomError(message);
    });

    // Player events
    socket.on('player:readyChanged', ({ playerId, ready }) => {
      store.setPlayerReady(playerId, ready);
    });

    // Game events
    socket.on('game:started', ({ round, totalRounds }) => {
      store.setPhase('PICKING');
      chat.clear();
    });

    socket.on('game:roundStart', ({ round, drawerId, turnDuration }) => {
      store.setRoundStart(round, drawerId, turnDuration);
      if (drawerId === socket.id) {
        playSfx('yourTurn');
      }
    });

    socket.on('game:wordOptions', ({ words }) => {
      store.setWordOptions(words);
    });

    socket.on('game:wordSelected', ({ hint }) => {
      store.setWordSelected(hint);
    });

    socket.on('game:hintReveal', ({ hint }) => {
      store.setHint(hint);
    });

    socket.on('game:tick', ({ timeLeft }) => {
      store.setTimeLeft(timeLeft);
      if (timeLeft <= 5 && timeLeft > 0) {
        playSfx('tick');
      }
    });

    socket.on('game:correctGuess', ({ playerId, playerName, score }) => {
      store.setCorrectGuess(playerId, score);
      playSfx('correctGuess');
      // XP & streak for local player
      if (playerId === socket.id) {
        progress.addXP(score);
        progress.incrementStreak();
        progress.recordCorrectGuess();
      }
    });

    socket.on('game:closeGuess', () => {
      chat.addMessage({
        id: Date.now().toString(),
        type: 'close',
        text: 'Yaklaştın!',
        timestamp: Date.now(),
      });
    });

    socket.on('game:roundEnd', (data) => {
      store.setRoundEnd(data);
      playSfx('roundEnd');
      // Reset streak if player didn't guess this round
      const myId = socket.id;
      if (myId && !data.roundScores[myId]) {
        progress.resetStreak();
      }
    });

    socket.on('game:ended', ({ podium, finalScores }) => {
      store.setGameEnd(podium, finalScores);
      playSfx('gameOver');
      progress.recordGame();
      // Award bonus XP for game completion
      progress.addXP(50);
    });

    // Vote kick events
    socket.on('room:voteKickStarted' as any, (data: any) => {
      chat.addMessage({
        id: Date.now().toString(),
        type: 'system',
        text: `${data.voterName}, ${data.targetName} oyuncusunun atılması için oy başlattı (${data.currentVotes}/${data.votesNeeded})`,
        timestamp: Date.now(),
      });
    });

    socket.on('room:voteKickUpdate' as any, (data: any) => {
      chat.addMessage({
        id: Date.now().toString(),
        type: 'system',
        text: `Oylama güncellendi: ${data.currentVotes}/${data.votesNeeded} oy`,
        timestamp: Date.now(),
      });
    });

    socket.on('room:playerKicked' as any, (data: any) => {
      chat.addMessage({
        id: Date.now().toString(),
        type: 'system',
        text: `${data.playerName} oylama ile odadan atıldı`,
        timestamp: Date.now(),
      });
    });

    // Drawing events
    socket.on('draw:stroke', (stroke) => {
      store.addStroke(stroke);
    });

    socket.on('draw:undo', () => {
      store.undoStroke();
    });

    socket.on('draw:clear', () => {
      store.clearDrawing();
    });

    // Chat events
    socket.on('chat:message', (msg) => {
      chat.addMessage(msg);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, []);

  const emit = useCallback(
    (event: string, ...args: unknown[]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (socketRef.current as any)?.emit(event, ...args);
    },
    []
  );

  return { socket: socketRef, emit };
}
