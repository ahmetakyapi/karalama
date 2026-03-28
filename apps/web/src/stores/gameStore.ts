import { create } from 'zustand';
import type {
  GamePhase,
  RoomSettings,
  RoomState,
  Player,
  PodiumEntry,
  RoundEndData,
  DrawStroke,
} from '@karalama/shared';
import { DEFAULT_ROOM_SETTINGS } from '@karalama/shared';

interface GameStore {
  // Connection
  isConnected: boolean;
  playerId: string | null;
  roomCode: string | null;

  // Room state
  phase: GamePhase;
  hostId: string;
  settings: RoomSettings;
  players: Record<string, Player>;
  currentRound: number;
  totalRounds: number;
  currentDrawerId: string | null;
  hint: string;
  timeLeft: number;
  scores: Record<string, number>;
  guessedPlayerIds: string[];
  drawHistory: DrawStroke[];

  // Round end
  lastRoundData: RoundEndData | null;

  // Game end
  podium: PodiumEntry[];

  // Word selection
  wordOptions: { word: string; difficulty: 1 | 2 | 3; category: string }[];

  // Flags
  hasGuessedCorrectly: boolean;

  // Actions
  setConnected: (connected: boolean) => void;
  setPlayerId: (id: string) => void;
  setRoomCode: (code: string) => void;
  syncRoomState: (state: RoomState) => void;
  setPhase: (phase: GamePhase) => void;
  setPlayers: (players: Record<string, Player>) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string, newHostId?: string) => void;
  setSettings: (settings: RoomSettings) => void;
  setPlayerReady: (playerId: string, ready: boolean) => void;
  setRoundStart: (round: number, drawerId: string, duration: number) => void;
  setWordOptions: (
    words: { word: string; difficulty: 1 | 2 | 3; category: string }[]
  ) => void;
  setWordSelected: (hint: string) => void;
  setHint: (hint: string) => void;
  setTimeLeft: (time: number) => void;
  setCorrectGuess: (playerId: string, score: number) => void;
  setRoundEnd: (data: RoundEndData) => void;
  setGameEnd: (podium: PodiumEntry[], scores: Record<string, number>) => void;
  setDrawHistory: (history: DrawStroke[]) => void;
  addStroke: (stroke: DrawStroke) => void;
  undoStroke: () => void;
  clearDrawing: () => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  isConnected: false,
  playerId: null,
  roomCode: null,
  phase: 'WAITING',
  hostId: '',
  settings: DEFAULT_ROOM_SETTINGS,
  players: {},
  currentRound: 0,
  totalRounds: 3,
  currentDrawerId: null,
  hint: '',
  timeLeft: 0,
  scores: {},
  guessedPlayerIds: [],
  drawHistory: [],
  lastRoundData: null,
  podium: [],
  wordOptions: [],
  hasGuessedCorrectly: false,

  setConnected: (connected) => set({ isConnected: connected }),
  setPlayerId: (id) => set({ playerId: id }),
  setRoomCode: (code) => set({ roomCode: code }),

  syncRoomState: (state) =>
    set({
      phase: state.phase,
      hostId: state.hostId,
      settings: state.settings,
      players: state.players,
      currentRound: state.currentRound,
      totalRounds: state.totalRounds,
      currentDrawerId: state.currentDrawerId,
      hint: state.hint,
      timeLeft: state.timeLeft,
      scores: state.scores,
      guessedPlayerIds: state.guessedPlayerIds,
      drawHistory: state.drawHistory,
    }),

  setPhase: (phase) => set({ phase }),
  setPlayers: (players) => set({ players }),

  addPlayer: (player) =>
    set((state) => ({
      players: { ...state.players, [player.id]: player },
    })),

  removePlayer: (playerId, newHostId) =>
    set((state) => {
      const { [playerId]: _, ...rest } = state.players;
      const updated = { ...rest };
      if (newHostId && updated[newHostId]) {
        updated[newHostId] = { ...updated[newHostId], isHost: true };
      }
      return {
        players: updated,
        hostId: newHostId || state.hostId,
      };
    }),

  setSettings: (settings) => set({ settings }),

  setPlayerReady: (playerId, ready) =>
    set((state) => {
      const player = state.players[playerId];
      if (!player) return state;
      return {
        players: {
          ...state.players,
          [playerId]: { ...player, isReady: ready },
        },
      };
    }),

  setRoundStart: (round, drawerId, duration) =>
    set({
      phase: 'PICKING',
      currentRound: round,
      currentDrawerId: drawerId,
      timeLeft: duration,
      hint: '',
      guessedPlayerIds: [],
      hasGuessedCorrectly: false,
      lastRoundData: null,
      wordOptions: [],
      drawHistory: [],
    }),

  setWordOptions: (words) => set({ wordOptions: words }),

  setWordSelected: (hint) =>
    set({ phase: 'DRAWING', hint, wordOptions: [] }),

  setHint: (hint) => set({ hint }),
  setTimeLeft: (time) => set({ timeLeft: time }),

  setCorrectGuess: (playerId, score) =>
    set((state) => ({
      guessedPlayerIds: [...state.guessedPlayerIds, playerId],
      scores: {
        ...state.scores,
        [playerId]: (state.scores[playerId] || 0) + score,
      },
      hasGuessedCorrectly:
        state.hasGuessedCorrectly || playerId === state.playerId,
    })),

  setRoundEnd: (data) =>
    set({
      phase: 'ROUND_RESULT',
      lastRoundData: data,
      scores: data.scores,
    }),

  setGameEnd: (podium, scores) =>
    set({
      phase: 'GAME_OVER',
      podium,
      scores,
    }),

  setDrawHistory: (history) => set({ drawHistory: history }),
  addStroke: (stroke) =>
    set((state) => ({ drawHistory: [...state.drawHistory, stroke] })),
  undoStroke: () =>
    set((state) => ({ drawHistory: state.drawHistory.slice(0, -1) })),
  clearDrawing: () => set({ drawHistory: [] }),

  reset: () =>
    set({
      phase: 'WAITING',
      currentRound: 0,
      currentDrawerId: null,
      hint: '',
      timeLeft: 0,
      guessedPlayerIds: [],
      drawHistory: [],
      lastRoundData: null,
      podium: [],
      wordOptions: [],
      hasGuessedCorrectly: false,
    }),
}));
