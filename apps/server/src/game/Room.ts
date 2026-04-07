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
  MIN_PLAYERS,
  MAX_PLAYERS,
  MIN_ROUNDS,
  MAX_ROUNDS,
  MIN_DRAW_TIME,
  MAX_DRAW_TIME,
  calculateGuesserScore,
  calculateDrawerScore,
  normalizeGuess,
  levenshtein,
} from '@karalama/shared';
import { Player } from './Player';
import { WordPicker } from './WordPicker';
import { BotController } from './BotController';
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
  botController: BotController;

  // Vote kick state
  voteKicks: Map<string, Set<string>>; // targetId -> set of voterIds
  voteKickTimers: Map<string, ReturnType<typeof setTimeout>>;

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
    this.wordPicker = new WordPicker(this.settings.categories, this.settings.customWords);
    this.hintRevealed1 = false;
    this.hintRevealed2 = false;
    this.lastActivity = Date.now();
    this.botController = new BotController(this);
    this.voteKicks = new Map();
    this.voteKickTimers = new Map();
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

      const wasDrawer = this.currentDrawerId === playerId;

      // Remove from draw order FIRST to avoid stale index
      const oldIndex = this.drawOrder.indexOf(playerId);
      this.drawOrder = this.drawOrder.filter((id) => id !== playerId);

      // Adjust currentTurnIndex if the removed player was before current
      if (oldIndex !== -1 && oldIndex < this.currentTurnIndex) {
        this.currentTurnIndex--;
      }
      if (this.currentTurnIndex >= this.drawOrder.length) {
        this.currentTurnIndex = 0;
      }

      // If drawer left, skip turn
      if (wasDrawer) {
        this.clearTimer();
        this.advanceGame();
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
    const drawer = this.players.get(drawerId);

    if (drawer?.isBot) {
      // Bot auto-picks a word after a short delay
      setTimeout(() => {
        if (this.phase !== 'PICKING') return;
        const pick = options[Math.floor(Math.random() * options.length)];
        if (pick) this.selectWord(pick.word, pick.difficulty);
      }, 1500 + Math.random() * 1500);
    } else {
      const drawerSocket = this.io.sockets.sockets.get(drawerId);
      if (drawerSocket) {
        drawerSocket.emit('game:wordOptions', { words: options });
      }
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

    // Bot behavior after word is selected
    this.botController.clearAllTimers();
    const drawer = this.players.get(this.currentDrawerId!);
    if (drawer?.isBot) {
      this.botController.startBotDrawing(word);
    }
    this.botController.startBotGuessing(word, difficulty, this.settings.drawTime);
  }

  handleGuess(playerId: string, text: string): (ChatMessage & { _guessedChat?: boolean }) | null {
    if (this.phase !== 'DRAWING') return null;
    if (!this.currentWord) return null;
    if (playerId === this.currentDrawerId) return null;

    const player = this.players.get(playerId);
    if (!player) return null;

    // Already guessed — allow chatting among guessed players only
    if (player.guessedThisRound) {
      return {
        id: nanoid(10),
        type: 'user' as const,
        playerId,
        playerName: player.name,
        playerColor: player.avatarColor,
        text,
        timestamp: Date.now(),
        _guessedChat: true, // internal flag: only send to guessed players + drawer
      };
    }

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

    // Close guess — only notify the guesser, don't broadcast text to others
    if (answer.length > 3 && levenshtein(normalized, answer) <= 2) {
      const socket = this.io.sockets.sockets.get(playerId);
      if (socket) {
        socket.emit('game:closeGuess');
      }
      return null;
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
    this.botController.clearAllTimers();
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
    this.botController.clearAllTimers();
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
    this.botController.clearAllTimers();
    this.resetToLobby();
  }

  backToLobby(): void {
    if (this.phase !== 'GAME_OVER') return;
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
      p.score = 0;
      p.isReady = false;
      p.guessedThisRound = false;
    }
    // Broadcast state so clients return to lobby
    for (const p of this.players.values()) {
      const sock = this.io.sockets.sockets.get(p.socketId);
      if (sock) {
        sock.emit('room:joined', {
          room: this.toState(),
          playerId: p.id,
        });
      }
    }
  }

  // --- Vote Kick ---

  handleVoteKick(voterId: string, targetId: string): void {
    if (voterId === targetId) return;
    const voter = this.players.get(voterId);
    const target = this.players.get(targetId);
    if (!voter || !target) return;
    if (target.isBot) return; // Can't vote kick bots, host can remove directly

    // Need at least 3 non-bot players for vote kick
    const humanPlayers = this.connectedPlayers.filter(p => !p.isBot);
    if (humanPlayers.length < 3) return;

    const votesNeeded = Math.ceil(humanPlayers.length / 2);

    if (!this.voteKicks.has(targetId)) {
      this.voteKicks.set(targetId, new Set());
    }
    const votes = this.voteKicks.get(targetId)!;

    if (votes.has(voterId)) return; // Already voted
    votes.add(voterId);

    if (votes.size === 1) {
      // First vote — announce
      this.emitToRoom('room:voteKickStarted', {
        targetId,
        targetName: target.name,
        voterId: voter.id,
        voterName: voter.name,
        votesNeeded,
        currentVotes: votes.size,
      });

      // Auto-expire after 30 seconds
      const timer = setTimeout(() => {
        this.voteKicks.delete(targetId);
        this.voteKickTimers.delete(targetId);
      }, 30000);
      this.voteKickTimers.set(targetId, timer);
    } else {
      this.emitToRoom('room:voteKickUpdate', {
        targetId,
        currentVotes: votes.size,
        votesNeeded,
      });
    }

    // Check if enough votes
    if (votes.size >= votesNeeded) {
      // Kick the player
      this.voteKicks.delete(targetId);
      const timer = this.voteKickTimers.get(targetId);
      if (timer) clearTimeout(timer);
      this.voteKickTimers.delete(targetId);

      this.emitToRoom('room:playerKicked', {
        playerId: targetId,
        playerName: target.name,
      });

      // Actually remove the player
      const targetSocket = this.io.sockets.sockets.get(target.socketId);
      if (targetSocket) {
        targetSocket.emit('room:error', {
          code: 'KICKED',
          message: 'Oylama ile odadan atıldınız',
        });
        targetSocket.leave(this.code);
      }

      const result = this.removePlayer(targetId);
      this.emitToRoom('room:playerLeft' as any, {
        playerId: targetId,
        newHostId: result.newHostId,
      });
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
    // Validate numeric bounds
    if (partial.maxPlayers !== undefined) {
      partial.maxPlayers = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, Math.floor(partial.maxPlayers)));
    }
    if (partial.totalRounds !== undefined) {
      partial.totalRounds = Math.max(MIN_ROUNDS, Math.min(MAX_ROUNDS, Math.floor(partial.totalRounds)));
    }
    if (partial.drawTime !== undefined) {
      partial.drawTime = Math.max(MIN_DRAW_TIME, Math.min(MAX_DRAW_TIME, Math.floor(partial.drawTime)));
    }
    if (partial.wordCount !== undefined) {
      partial.wordCount = Math.max(2, Math.min(5, Math.floor(partial.wordCount)));
    }
    // Sanitize custom words
    if (partial.customWords) {
      partial.customWords = partial.customWords
        .map((w) => w.trim())
        .filter((w) => w.length > 0 && w.length <= 40)
        .slice(0, 50);
    }

    Object.assign(this.settings, partial);
    this.wordPicker = new WordPicker(this.settings.categories, this.settings.customWords);
  }

  // --- Emit helpers (used by BotController) ---

  emitToRoom<E extends keyof import('@karalama/shared').ServerToClientEvents>(
    event: E,
    ...args: Parameters<import('@karalama/shared').ServerToClientEvents[E]>
  ): void {
    (this.io.to(this.code).emit as any)(event, ...args);
  }

  emitToRoomExcept<E extends keyof import('@karalama/shared').ServerToClientEvents>(
    event: E,
    data: Parameters<import('@karalama/shared').ServerToClientEvents[E]>[0],
    exceptSocketId: string
  ): void {
    (this.io.to(this.code).except(exceptSocketId).emit as any)(event, data);
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
