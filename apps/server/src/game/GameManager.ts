import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  RoomSettings,
} from '@karalama/shared';
import { ROOM_EXPIRE_MINUTES } from '@karalama/shared';
import { Room } from './Room';
import { generateRoomCode } from '../utils/roomCodeGenerator';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export class GameManager {
  private rooms: Map<string, Room> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private io: GameServer;

  constructor(io: GameServer) {
    this.io = io;

    // Cleanup expired rooms every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  createRoom(settings: RoomSettings): Room {
    let code: string;
    do {
      code = generateRoomCode();
    } while (this.rooms.has(code));

    const room = new Room(code, this.io, settings);
    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  setSocketRoom(socketId: string, roomCode: string): void {
    this.socketToRoom.set(socketId, roomCode);
  }

  getSocketRoom(socketId: string): Room | undefined {
    const code = this.socketToRoom.get(socketId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  removeSocket(socketId: string): void {
    const code = this.socketToRoom.get(socketId);
    this.socketToRoom.delete(socketId);

    if (code) {
      const room = this.rooms.get(code);
      if (room) {
        const { newHostId } = room.removePlayer(socketId);

        this.io.to(code).emit('room:playerLeft', {
          playerId: socketId,
          newHostId,
        });

        if (room.playerCount === 0) {
          this.rooms.delete(code);
        }
      }
    }
  }

  private cleanup(): void {
    for (const [code, room] of this.rooms.entries()) {
      if (room.isExpired(ROOM_EXPIRE_MINUTES) && room.playerCount === 0) {
        this.rooms.delete(code);
      }
    }
  }

  get roomCount(): number {
    return this.rooms.size;
  }

  get totalPlayers(): number {
    let count = 0;
    for (const room of this.rooms.values()) {
      count += room.playerCount;
    }
    return count;
  }
}
