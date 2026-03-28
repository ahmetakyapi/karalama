import type {
  RoomSettings,
  RoomState,
  ChatMessage,
  RoundEndData,
  GameEndData,
} from './game';
import type { PlayerPublic } from './player';
import type { DrawStroke, DrawPoint } from './drawing';
import type { WordOption } from './word';

export interface ClientToServerEvents {
  // Room
  'room:create': (data: {
    playerName: string;
    avatarColor: string;
    settings: RoomSettings;
  }) => void;
  'room:join': (data: {
    roomCode: string;
    playerName: string;
    avatarColor: string;
  }) => void;
  'room:leave': () => void;
  'room:kick': (data: { playerId: string }) => void;
  'room:updateSettings': (data: Partial<RoomSettings>) => void;

  // Game
  'game:start': () => void;
  'game:wordSelected': (data: { word: string }) => void;

  // Drawing
  'draw:stroke': (data: DrawStroke) => void;
  'draw:fill': (data: { color: string }) => void;
  'draw:undo': () => void;
  'draw:clear': () => void;

  // Chat
  'chat:message': (data: { text: string }) => void;
  'chat:reaction': (data: { emoji: string }) => void;

  // Player
  'player:ready': () => void;
}

export interface ServerToClientEvents {
  // Room
  'room:created': (data: { roomCode: string; room: RoomState }) => void;
  'room:joined': (data: { room: RoomState; playerId: string }) => void;
  'room:playerJoined': (data: { player: PlayerPublic }) => void;
  'room:playerLeft': (data: { playerId: string; newHostId?: string }) => void;
  'room:settingsUpdated': (data: RoomSettings) => void;
  'room:error': (data: { code: string; message: string }) => void;

  // Game
  'game:started': (data: { round: number; totalRounds: number }) => void;
  'game:roundStart': (data: {
    round: number;
    drawerId: string;
    turnDuration: number;
  }) => void;
  'game:wordOptions': (data: { words: WordOption[] }) => void;
  'game:wordSelected': (data: { hint: string; length: number }) => void;
  'game:hintReveal': (data: { hint: string; position: number }) => void;
  'game:tick': (data: { timeLeft: number }) => void;
  'game:correctGuess': (data: {
    playerId: string;
    playerName: string;
    score: number;
  }) => void;
  'game:closeGuess': () => void;
  'game:roundEnd': (data: RoundEndData) => void;
  'game:ended': (data: GameEndData) => void;

  // Drawing
  'draw:stroke': (data: DrawStroke) => void;
  'draw:fill': (data: { color: string }) => void;
  'draw:undo': () => void;
  'draw:clear': () => void;

  // Chat
  'chat:message': (data: ChatMessage) => void;

  // Player
  'player:readyChanged': (data: { playerId: string; ready: boolean }) => void;
}
