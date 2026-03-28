import type { Player, PodiumEntry } from './player';
import type { DrawStroke, DrawPoint } from './drawing';
import type { WordOption } from './word';

export type GamePhase = 'WAITING' | 'PICKING' | 'DRAWING' | 'ROUND_RESULT' | 'GAME_OVER';

export interface RoomSettings {
  maxPlayers: number;
  totalRounds: number;
  drawTime: number;
  wordCount: number;
  categories: string[];
  hintsEnabled: boolean;
  customWords: string[];
}

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  totalRounds: 3,
  drawTime: 80,
  wordCount: 3,
  categories: ['hayvanlar', 'yiyecekler', 'nesneler', 'karisik', 'sporlar', 'meslekler', 'doga', 'teknoloji'],
  hintsEnabled: true,
  customWords: [],
};

export interface RoomState {
  code: string;
  hostId: string;
  phase: GamePhase;
  settings: RoomSettings;
  players: Record<string, Player>;
  currentRound: number;
  totalRounds: number;
  currentDrawerId: string | null;
  hint: string;
  timeLeft: number;
  scores: Record<string, number>;
  drawHistory: DrawStroke[];
  guessedPlayerIds: string[];
}

export interface RoundEndData {
  word: string;
  scores: Record<string, number>;
  roundScores: Record<string, number>;
}

export interface GameEndData {
  finalScores: Record<string, number>;
  podium: PodiumEntry[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'correct' | 'close' | 'system';
  playerId?: string;
  playerName?: string;
  playerColor?: string;
  text: string;
  timestamp: number;
}

