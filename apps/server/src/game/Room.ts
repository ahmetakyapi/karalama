import type { Server, Socket } from 'socket.io';
import type {
  GamePhase,
  RoomSettings,
  RoomState,
  DrawStroke,
  ChatMessage,
  RoundEndData,
  GameEndData,
  PodiumEntry,
  ClientToServerEvents,
  ServerToClientEvents,
} from '@karalama/shared';
import {
  DEFAULT_ROOM_SETTINGS,
  WORD_PICK_TIME,
  ROUND_RESULT_TIME,
  GAME_OVER_TIME,
  HINT_REVEAL_1,
  HINT_REVEAL_2,
  calculateGuesserScore,
  calculateDrawerScore,
  normalizeGuess,
  levenshtein,
} from '@karalama/shared';
import { Player } from './Player';
import { WordPicker } from './WordPicker';
import { nanoid } from 'nanoid';

type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;

export class Room {
  code: string;
  hostId: string;
  phase: GamePhase;
  settings: RoomSettings;
  players: Map<string, Player>;
  private io: GameServer;

  // Game state
  currentRound: number;
  currentTurnIndex: number;
  drawOrder: string[];
  currentWord: string | null;
  currentWordDifficulty: 1 | 2 | 3;
  hint: string;
  guessedPlayerIds: Set<string>;
  guessOrder: number;
  roundScores: Map<string, number>;
  drawHistory: DrawStroke[];
  timeLeft: number;

  private timerRef: ReturnType<typeof setInterval> | null;
  private wordPicker: WordPicker;
  private hintRevealed1: boolean;
  private hintRevealed2: boolean;
  private lastActivity: number;

  constructor(code: string, io: GameServer, settings: RoomSettings) {
    this.code = code;
    this.io = io;
    this.hostId = '';
    this.phase = 'WAITING';
    this.settings = { ...DEFAULT_ROOM_SETTINGS, ...settings };
    this.players = new Map();

    this.currentRound = 0;
    this.currentTurnIndex = 0;
    this.drawOrder = [];
    this.currentWord = null;
    this.currentWordDifficulty = 1;
    this.hint = '';
    this.guessedPlayerIds = new Set();
    this.guessOrder = 0;
    this.roundScores = new Map();
    this.drawHistory = [];
    this.timeLeft = 0;

    this.timerRef = null;
    this.wordPicker = new WordPicker(this.settings.categories);
    this.hintRevealed1 = false;
    this.hintRevealed2 = false;
    this.lastActivity = Date.now();
  }

  get playerCount(): number {
    return this.players.size;
  }

  get connectedPlayers(): Player[] {
    return [...this.players.values()].filter((p) => p.isConnected);
  }

  get currentDrawerId(): string | null {
    if (this.drawOrder.length === 0) return null;
    return this.drawOrder[this.currentTurnIndex] ?? null;
  }

  touch(): void {
    this.lastActivity = Date.now();
  }

  isExpired(minutes: number): boolean {
    return Date.now() - this.lastActivity > minutes * 60 * 1000;
  }

  // --- Player Management ---

  addPlayer(socket: GameSocket, name: string, avatarColor: string): Player {
    const isHost = this.players.size === 0;
    const player = new Player(socket.id, socket.id, name, avatarColor, isHost);

    if (isHost) this.hostId = player.id;

    this.players.set(player.id, player);
    socket.join(this.code);
    this.touch();

    return player;
  }

  removePlayer(playerId: string): { newHostId?: string } {
    const player = this.players.get(playerId);
    if (!player) return {};

    this.players.delete(playerId);
    this.touch();

    let newHostId: string | undefined;

    // Reassign host
    if (player.isHost && this.players.size > 0) {
      const next = this.connectedPlayers[0];
      if (next) {
        next.isHost = true;
        this.hostId = next.id;
        newHostId = next.id;
      }
    }

    // Handle mid-game departure
    if (this.phase !== 'WAITING' && this.phase !== 'GAME_OVER') {
      if (this.connectedPlayers.length < 2) {
        this.endGameEarly();
        return { newHostId };
      }

      // If drawer left, skip turn
      if (this.currentDrawerId === playerId) {
        this.clearTimer();
        this.advanceGame();
      }

      // Remove from draw order
      this.drawOrder = this.drawOrder.filter((id) => id !== playerId);
      if (this.currentTurnIndex >= this.drawOrder.length) {
        this.currentTurnIndex = 0;
      }
    }

    return { newHostId };
  }

  // --- Game Flow ---

  startGame(): void {
    if (this.connectedPlayers.length < 2) return;
    if (this.phase !== 'WAITING') return;

    // Reset all scores
    for (const p of this.players.values()) {
      p.score = 0;
      p.isReady = false;
    }

    this.currentRound = 1;
    this.currentTurnIndex = 0;
    this.wordPicker.reset();
    this.shuffleDrawOrder();

    this.io.to(this.code).emit('game:started', {
      round: this.currentRound,
      totalRounds: this.settings.totalRounds,
    });

    this.startTurn();
  }

  private shuffleDrawOrder(): void {
    this.drawOrder = this.connectedPlayers.map((p) => p.id);
    // Fisher-Yates shuffle
    for (let i = this.drawOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.drawOrder[i], this.drawOrder[j]] = [
        this.drawOrder[j],
        this.drawOrder[i],
      ];
    }
  }

  private startTurn(): void {
    const drawerId = this.currentDrawerId;
    if (!drawerId) return;

    this.phase = 'PICKING';
    this.currentWord = null;
    this.hint = '';
    this.guessedPlayerIds.clear();
    this.guessOrder = 0;
    this.roundScores.clear();
    this.drawHistory = [];
    this.hintRevealed1 = false;
    this.hintRevealed2 = false;

    for (const p of this.players.values()) {
      p.guessedThisRound = false;
    }

    this.io.to(this.code).emit('game:roundStart', {
      round: this.currentRound,
      drawerId,
      turnDuration: this.settings.drawTime,
    });

    // Send word options to drawer
    const options = this.wordPicker.pickOptions(this.settings.wordCount);
    const drawerSocket = this.io.sockets.sockets.get(drawerId);
    if (drawerSocket) {
      drawerSocket.emit('game:wordOptions', { words: options });
    }

    // Auto-pick after timeout
    this.timeLeft = WORD_PICK_TIME;
    this.startTimer(() => {
      if (this.phase === 'PICKING' && options.length > 0) {
        const random = options[Math.floor(Math.random() * options.length)];
        this.selectWord(random.word, random.difficulty);
      }
    });
  }

  selectWord(word: string, difficulty: 1 | 2 | 3): void {
    if (this.phase !== 'PICKING') return;

    this.currentWord = word;
    this.currentWordDifficulty = difficulty;
    this.wordPicker.markUsed(word);
    this.hint = this.generateHint(word, []);
    this.phase = 'DRAWING';

    this.io.to(this.code).emit('game:wordSelected', {
      hint: this.hint,
      length: word.length,
    });

    this.timeLeft = this.settings.drawTime;
    this.startTimer(() => {
      this.endTurn();
    });
  }

  handleGuess(playerId: string, text: string): ChatMessage | null {
    if (this.phase !== 'DRAWING') return null;
    if (!this.currentWord) return null;
    if (playerId === this.currentDrawerId) return null;

    const player = this.players.get(playerId);
    if (!player || player.guessedThisRound) return null;

    const normalized = normalizeGuess(text);
    const answer = normalizeGuess(this.currentWord);

    // Exact match
    if (normalized === answer) {
      player.guessedThisRound = true;
      this.guessedPlayerIds.add(playerId);

      const score = calculateGuesserScore({
        timeLeft: this.timeLeft,
        totalTime: this.settings.drawTime,
        guessOrder: this.guessOrder,
        wordDifficulty: this.currentWordDifficulty,
      });

      player.score += score;
      this.roundScores.set(playerId, score);
      this.guessOrder++;

      this.io.to(this.code).emit('game:correctGuess', {
        playerId,
        playerName: player.name,
        score,
      });

      // Check if everyone guessed
      const guessers = this.connectedPlayers.filter(
        (p) => p.id !== this.currentDrawerId
      );
      if (
        guessers.length > 0 &&
        guessers.every((p) => p.guessedThisRound)
      ) {
        this.endTurn();
      }

      return {
        id: nanoid(10),
        type: 'correct',
        playerId,
        playerName: player.name,
        playerColor: player.avatarColor,
        text: `${player.name} doğru bildi!`,
        timestamp: Date.now(),
      };
    }

    // Close guess
    if (answer.length > 3 && levenshtein(normalized, answer) <= 2) {
      const socket = this.io.sockets.sockets.get(playerId);
      if (socket) {
        socket.emit('game:closeGuess');
      }
      // Don't reveal the guess to others
      return {
        id: nanoid(10),
        type: 'user',
        playerId,
        playerName: player.name,
        playerColor: player.avatarColor,
        text,
        timestamp: Date.now(),
      };
    }

    // Normal message
    return {
      id: nanoid(10),
      type: 'user',
      playerId,
      playerName: player.name,
      playerColor: player.avatarColor,
      text,
      timestamp: Date.now(),
    };
  }

  private endTurn(): void {
    this.clearTimer();
    this.phase = 'ROUND_RESULT';

    // Calculate drawer score
    const drawerId = this.currentDrawerId;
    if (drawerId) {
      const drawer = this.players.get(drawerId);
      const guessers = this.connectedPlayers.filter(
        (p) => p.id !== drawerId
      );
      const drawerScore = calculateDrawerScore({
        guessedCount: this.guessedPlayerIds.size,
        totalGuessers: guessers.length,
      });
      if (drawer) {
        drawer.score += drawerScore;
        this.roundScores.set(drawerId, drawerScore);
      }
    }

    const scores: Record<string, number> = {};
    const roundScoresObj: Record<string, number> = {};
    for (const p of this.players.values()) {
      scores[p.id] = p.score;
    }
    for (const [id, s] of this.roundScores.entries()) {
      roundScoresObj[id] = s;
    }

    const data: RoundEndData = {
      word: this.currentWord ?? '',
      scores,
      roundScores: roundScoresObj,
    };

    this.io.to(this.code).emit('game:roundEnd', data);

    setTimeout(() => {
      this.advanceGame();
    }, ROUND_RESULT_TIME * 1000);
  }

  private advanceGame(): void {
    this.currentTurnIndex++;

    if (this.currentTurnIndex >= this.drawOrder.length) {
      // All players drew this round
      this.currentTurnIndex = 0;
      this.currentRound++;

      if (this.currentRound > this.settings.totalRounds) {
        this.endGame();
        return;
      }

      this.shuffleDrawOrder();
    }

    this.startTurn();
  }

  private endGame(): void {
    this.clearTimer();
    this.phase = 'GAME_OVER';

    const finalScores: Record<string, number> = {};
    for (const p of this.players.values()) {
      finalScores[p.id] = p.score;
    }

    const sorted = [...this.players.values()].sort(
      (a, b) => b.score - a.score
    );
    const podium: PodiumEntry[] = sorted.slice(0, 3).map((p, i) => ({
      playerId: p.id,
      playerName: p.name,
      avatarColor: p.avatarColor,
      score: p.score,
      rank: i + 1,
    }));

    const data: GameEndData = { finalScores, podium };
    this.io.to(this.code).emit('game:ended', data);

    setTimeout(() => {
      this.resetToLobby();
    }, GAME_OVER_TIME * 1000);
  }

  private endGameEarly(): void {
    this.clearTimer();
    this.resetToLobby();
  }

  private resetToLobby(): void {
    this.phase = 'WAITING';
    this.currentRound = 0;
    this.currentTurnIndex = 0;
    this.drawOrder = [];
    this.currentWord = null;
    this.drawHistory = [];
    for (const p of this.players.values()) {
      p.isReady = false;
      p.guessedThisRound = false;
    }
  }

  // --- Hint System ---

  private generateHint(word: string, revealedPositions: number[]): string {
    return word
      .split('')
      .map((ch, i) => {
        if (ch === ' ') return '  ';
        if (revealedPositions.includes(i)) return ch;
        return '_';
      })
      .join(' ');
  }

  private revealHintLetter(): void {
    if (!this.currentWord) return;

    const unrevealed: number[] = [];
    const chars = this.currentWord.split('');
    const currentRevealed: number[] = [];

    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') continue;
      if (this.hint.replace(/ /g, '')[i] !== '_') {
        // Already revealed — find its actual position
      }
    }

    // Parse current hint to find unrevealed
    const hintChars = this.hint.split(' ').filter((c) => c !== '');
    let charIdx = 0;
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] === ' ') continue;
      if (hintChars[charIdx] === '_') {
        unrevealed.push(i);
      } else {
        currentRevealed.push(i);
      }
      charIdx++;
    }

    if (unrevealed.length === 0) return;

    const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)];
    currentRevealed.push(pos);
    this.hint = this.generateHint(this.currentWord, currentRevealed);

    this.io.to(this.code).emit('game:hintReveal', {
      hint: this.hint,
      position: pos,
    });
  }

  // --- Drawing Relay ---

  addStroke(stroke: DrawStroke): void {
    this.drawHistory.push(stroke);
    this.touch();
  }

  undoStroke(): void {
    this.drawHistory.pop();
  }

  clearDrawing(): void {
    this.drawHistory = [];
  }

  // --- Timer ---

  private startTimer(onEnd: () => void): void {
    this.clearTimer();
    this.timerRef = setInterval(() => {
      this.timeLeft--;

      this.io.to(this.code).emit('game:tick', { timeLeft: this.timeLeft });

      // Hint reveals
      if (
        this.phase === 'DRAWING' &&
        this.settings.hintsEnabled &&
        this.currentWord
      ) {
        const ratio = this.timeLeft / this.settings.drawTime;
        if (ratio <= HINT_REVEAL_1 && !this.hintRevealed1) {
          this.hintRevealed1 = true;
          this.revealHintLetter();
        }
        if (ratio <= HINT_REVEAL_2 && !this.hintRevealed2) {
          this.hintRevealed2 = true;
          this.revealHintLetter();
        }
      }

      if (this.timeLeft <= 0) {
        this.clearTimer();
        onEnd();
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }

  // --- Settings ---

  updateSettings(partial: Partial<RoomSettings>): void {
    Object.assign(this.settings, partial);
    this.wordPicker = new WordPicker(this.settings.categories);
  }

  // --- Serialization ---

  toState(): RoomState {
    const players: Record<string, ReturnType<Player['toPublic']>> = {};
    const scores: Record<string, number> = {};
    for (const [id, p] of this.players.entries()) {
      players[id] = p.toPublic();
      scores[id] = p.score;
    }

    return {
      code: this.code,
      hostId: this.hostId,
      phase: this.phase,
      settings: this.settings,
      players,
      currentRound: this.currentRound,
      totalRounds: this.settings.totalRounds,
      currentDrawerId: this.currentDrawerId,
      hint: this.hint,
      timeLeft: this.timeLeft,
      scores,
      drawHistory: this.drawHistory,
      guessedPlayerIds: [...this.guessedPlayerIds],
    };
  }
}
