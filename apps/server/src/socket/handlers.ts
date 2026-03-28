import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@karalama/shared';
import { categories } from '@karalama/shared';
import { GameManager } from '../game/GameManager';
import { nanoid } from 'nanoid';

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerHandlers(io: GameServer, manager: GameManager): void {
  io.on('connection', (socket: GameSocket) => {
    console.log(`[connect] ${socket.id}`);

    // --- Room: Create ---
    socket.on('room:create', ({ playerName, avatarColor, settings }) => {
      const room = manager.createRoom(settings);
      const player = room.addPlayer(socket, playerName, avatarColor);
      manager.setSocketRoom(socket.id, room.code);

      socket.emit('room:created', {
        roomCode: room.code,
        room: room.toState(),
      });
    });

    // --- Room: Join ---
    socket.on('room:join', ({ roomCode, playerName, avatarColor }) => {
      const room = manager.getRoom(roomCode);
      if (!room) {
        socket.emit('room:error', {
          code: 'ROOM_NOT_FOUND',
          message: 'Oda bulunamadı',
        });
        return;
      }

      if (room.playerCount >= room.settings.maxPlayers) {
        socket.emit('room:error', {
          code: 'ROOM_FULL',
          message: 'Oda dolu',
        });
        return;
      }

      const player = room.addPlayer(socket, playerName, avatarColor);
      manager.setSocketRoom(socket.id, room.code);

      socket.emit('room:joined', {
        room: room.toState(),
        playerId: player.id,
      });

      socket.to(room.code).emit('room:playerJoined', {
        player: player.toPublic(),
      });

      // System message
      io.to(room.code).emit('chat:message', {
        id: nanoid(10),
        type: 'system',
        text: `${playerName} odaya katıldı`,
        timestamp: Date.now(),
      });
    });

    // --- Room: Leave ---
    socket.on('room:leave', () => {
      manager.removeSocket(socket.id);
    });

    // --- Room: Kick ---
    socket.on('room:kick', ({ playerId }) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.hostId !== socket.id) return;

      const target = room.players.get(playerId);
      if (!target) return;

      const targetSocket = io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.emit('room:error', {
          code: 'KICKED',
          message: 'Odadan atıldınız',
        });
        targetSocket.leave(room.code);
        manager.removeSocket(target.socketId);
      }
    });

    // --- Room: Update Settings ---
    socket.on('room:updateSettings', (partial) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.hostId !== socket.id) return;
      if (room.phase !== 'WAITING') return;

      room.updateSettings(partial);
      io.to(room.code).emit('room:settingsUpdated', room.settings);
    });

    // --- Player: Ready ---
    socket.on('player:ready', () => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      const player = room.players.get(socket.id);
      if (!player) return;

      player.isReady = !player.isReady;
      io.to(room.code).emit('player:readyChanged', {
        playerId: player.id,
        ready: player.isReady,
      });
    });

    // --- Game: Start ---
    socket.on('game:start', () => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.hostId !== socket.id) return;
      room.startGame();
    });

    // --- Game: Word Selected ---
    socket.on('game:wordSelected', ({ word }) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.currentDrawerId !== socket.id) return;

      // Find difficulty from the word database
      let difficulty: 1 | 2 | 3 = 1;
      for (const cat of Object.values(categories)) {
        const found = cat.words.find((w) => w.word === word);
        if (found) {
          difficulty = found.difficulty;
          break;
        }
      }

      room.selectWord(word, difficulty);
    });

    // --- Drawing Events ---
    socket.on('draw:stroke', (data) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.currentDrawerId !== socket.id) return;
      room.addStroke(data);
      socket.to(room.code).emit('draw:stroke', data);
    });

    socket.on('draw:fill', (data) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.currentDrawerId !== socket.id) return;
      socket.to(room.code).emit('draw:fill', data);
    });

    socket.on('draw:undo', () => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.currentDrawerId !== socket.id) return;
      room.undoStroke();
      socket.to(room.code).emit('draw:undo');
    });

    socket.on('draw:clear', () => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.currentDrawerId !== socket.id) return;
      room.clearDrawing();
      socket.to(room.code).emit('draw:clear');
    });

    // --- Reactions ---
    socket.on('chat:reaction', ({ emoji }) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      const player = room.players.get(socket.id);
      if (!player) return;
      socket.to(room.code).emit('chat:reaction', {
        emoji,
        playerId: player.id,
        playerName: player.name,
      });
    });

    // --- Chat ---
    socket.on('chat:message', ({ text }) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;

      const trimmed = text.trim().slice(0, 100);
      if (!trimmed) return;

      // If game is active, check for guess
      if (room.phase === 'DRAWING') {
        const msg = room.handleGuess(socket.id, trimmed);
        if (msg) {
          io.to(room.code).emit('chat:message', msg);
        }
        return;
      }

      // Normal chat
      const player = room.players.get(socket.id);
      if (!player) return;

      io.to(room.code).emit('chat:message', {
        id: nanoid(10),
        type: 'user',
        playerId: player.id,
        playerName: player.name,
        playerColor: player.avatarColor,
        text: trimmed,
        timestamp: Date.now(),
      });
    });

    // --- Disconnect ---
    socket.on('disconnect', () => {
      console.log(`[disconnect] ${socket.id}`);
      const room = manager.getSocketRoom(socket.id);
      if (room) {
        const player = room.players.get(socket.id);
        if (player) {
          io.to(room.code).emit('chat:message', {
            id: nanoid(10),
            type: 'system',
            text: `${player.name} ayrıldı`,
            timestamp: Date.now(),
          });
        }
      }
      manager.removeSocket(socket.id);
    });
  });
}
