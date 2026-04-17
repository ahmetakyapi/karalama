import type { Server, Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from '@karalama/shared';
import { categories, CHAT_RATE_LIMIT_MS, DRAW_RATE_LIMIT_MS, MAX_BOTS } from '@karalama/shared';
import { GameManager } from '../game/GameManager';
import { nanoid } from 'nanoid';
import { sanitizePlayerName, sanitizeAvatarColor } from '../utils/nameFilter';

const NAME_ERROR_MESSAGES: Record<string, string> = {
  INVALID: 'Geçersiz isim',
  TOO_SHORT: 'İsim boş olamaz',
  TOO_LONG: 'İsim çok uzun (maks 20)',
  INVALID_CHARS: 'İsimde sadece harf, rakam, boşluk ve - _ olabilir',
  PROFANITY: 'Bu isim kullanılamaz',
};

// Per-socket rate limit tracking
const lastChatTime = new Map<string, number>();
const lastDrawTime = new Map<string, number>();

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export function registerHandlers(io: GameServer, manager: GameManager): void {
  io.on('connection', (socket: GameSocket) => {
    console.log(`[connect] ${socket.id}`);

    // --- Room: Create ---
    socket.on('room:create', ({ playerName, avatarColor, settings }) => {
      const nameCheck = sanitizePlayerName(playerName);
      if (!nameCheck.ok) {
        socket.emit('room:error', {
          code: 'INVALID_NAME',
          message: NAME_ERROR_MESSAGES[nameCheck.reason ?? 'INVALID'] ?? 'Geçersiz isim',
        });
        return;
      }
      const color = sanitizeAvatarColor(avatarColor);

      const room = manager.createRoom(settings);
      const player = room.addPlayer(socket, nameCheck.name, color);
      manager.setSocketRoom(socket.id, room.code);

      socket.emit('room:created', {
        roomCode: room.code,
        room: room.toState(),
      });
    });

    // --- Room: Join ---
    socket.on('room:join', ({ roomCode, playerName, avatarColor }) => {
      const nameCheck = sanitizePlayerName(playerName);
      if (!nameCheck.ok) {
        socket.emit('room:error', {
          code: 'INVALID_NAME',
          message: NAME_ERROR_MESSAGES[nameCheck.reason ?? 'INVALID'] ?? 'Geçersiz isim',
        });
        return;
      }
      const cleanName = nameCheck.name;
      const cleanColor = sanitizeAvatarColor(avatarColor);
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

      if (room.phase !== 'WAITING') {
        socket.emit('room:error', {
          code: 'GAME_IN_PROGRESS',
          message: 'Oyun devam ediyor, yeni oyuncular katılamaz',
        });
        return;
      }

      const player = room.addPlayer(socket, cleanName, cleanColor);
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
        text: `${cleanName} odaya katıldı`,
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

    // --- Bots: Add ---
    socket.on('room:addBot', () => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.hostId !== socket.id) return;
      if (room.phase !== 'WAITING') return;

      const existingBots = [...room.players.values()].filter((p) => p.isBot);
      if (existingBots.length >= MAX_BOTS) return;
      if (room.playerCount >= room.settings.maxPlayers) return;

      const bot = room.botController.createBot();
      if (!bot) return;

      io.to(room.code).emit('room:playerJoined', {
        player: bot.toPublic(),
      });

      io.to(room.code).emit('chat:message', {
        id: nanoid(10),
        type: 'system',
        text: `${bot.name} (Bot) odaya katıldı`,
        timestamp: Date.now(),
      });
    });

    // --- Bots: Remove ---
    socket.on('room:removeBot', ({ botId }) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.hostId !== socket.id) return;
      if (room.phase !== 'WAITING') return;

      const bot = room.players.get(botId);
      if (!bot || !bot.isBot) return;

      room.botController.removeBot(botId);
      io.to(room.code).emit('room:playerLeft', { playerId: botId });
    });

    // --- Vote Kick ---
    socket.on('room:voteKick', ({ targetId }) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      room.handleVoteKick(socket.id, targetId);
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

      // Rate limit draw strokes
      const now = Date.now();
      const lastDraw = lastDrawTime.get(socket.id) || 0;
      if (now - lastDraw < DRAW_RATE_LIMIT_MS) return;
      lastDrawTime.set(socket.id, now);

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

    // --- Game: Back to Lobby ---
    socket.on('game:backToLobby', () => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;
      if (room.hostId !== socket.id) return;
      if (room.phase !== 'GAME_OVER') return;
      room.backToLobby();
    });

    // --- Chat ---
    socket.on('chat:message', ({ text }) => {
      const room = manager.getSocketRoom(socket.id);
      if (!room) return;

      const trimmed = text.trim().slice(0, 100);
      if (!trimmed) return;

      // Rate limit chat messages
      const now = Date.now();
      const lastChat = lastChatTime.get(socket.id) || 0;
      if (now - lastChat < CHAT_RATE_LIMIT_MS) return;
      lastChatTime.set(socket.id, now);

      // If game is active, check for guess
      if (room.phase === 'DRAWING') {
        const msg = room.handleGuess(socket.id, trimmed);
        if (msg) {
          // Correct guess: broadcast to everyone
          if (msg.type === 'correct') {
            io.to(room.code).emit('chat:message', msg);
          } else if ((msg as any)._guessedChat) {
            // Already-guessed player chatting: only visible to other guessed players
            const { _guessedChat, ...cleanMsg } = msg as any;
            for (const gId of room.guessedPlayerIds) {
              const sock = io.sockets.sockets.get(gId);
              if (sock) sock.emit('chat:message', cleanMsg);
            }
          } else {
            // Normal guess: send to everyone EXCEPT the drawer
            // (Gartic.io behavior — drawer shouldn't see guesses)
            const drawerId = room.currentDrawerId;
            if (drawerId) {
              io.to(room.code).except(drawerId).emit('chat:message', msg);
            } else {
              io.to(room.code).emit('chat:message', msg);
            }
          }
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
      lastChatTime.delete(socket.id);
      lastDrawTime.delete(socket.id);
    });
  });
}
