import type { DrawStroke, DrawPoint, ChatMessage } from '@karalama/shared';
import { categories, BOT_NAMES, BOT_COLORS, calculateGuesserScore } from '@karalama/shared';
import { nanoid } from 'nanoid';
import type { Room } from './Room';
import { Player } from './Player';

/**
 * BotController manages bot behavior within a Room:
 * - Bots guess words during DRAWING phase with varying timing
 * - Bots draw simple recognizable shapes when it's their turn
 */

// Simple shape templates for bot drawing (normalized 0-1 coordinates)
const SHAPE_TEMPLATES: Record<string, DrawPoint[][]> = {
  circle: [
    generateCirclePoints(0.5, 0.45, 0.2, 32),
  ],
  square: [
    [{ x: 0.3, y: 0.25 }, { x: 0.7, y: 0.25 }, { x: 0.7, y: 0.65 }, { x: 0.3, y: 0.65 }, { x: 0.3, y: 0.25 }],
  ],
  house: [
    // walls
    [{ x: 0.25, y: 0.45 }, { x: 0.25, y: 0.75 }, { x: 0.75, y: 0.75 }, { x: 0.75, y: 0.45 }],
    // roof
    [{ x: 0.2, y: 0.45 }, { x: 0.5, y: 0.2 }, { x: 0.8, y: 0.45 }],
    // door
    [{ x: 0.42, y: 0.55 }, { x: 0.42, y: 0.75 }, { x: 0.58, y: 0.75 }, { x: 0.58, y: 0.55 }, { x: 0.42, y: 0.55 }],
  ],
  tree: [
    // trunk
    [{ x: 0.48, y: 0.55 }, { x: 0.48, y: 0.8 }, { x: 0.52, y: 0.8 }, { x: 0.52, y: 0.55 }],
    // foliage
    generateCirclePoints(0.5, 0.38, 0.18, 24),
  ],
  star: [
    generateStarPoints(0.5, 0.45, 0.22, 0.1, 5),
  ],
  heart: [
    generateHeartPoints(0.5, 0.5, 0.2),
  ],
  sun: [
    // center
    generateCirclePoints(0.5, 0.4, 0.1, 20),
    // rays
    ...[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
      const rad = (angle * Math.PI) / 180;
      const cx = 0.5, cy = 0.4;
      return [
        { x: cx + Math.cos(rad) * 0.13, y: cy + Math.sin(rad) * 0.13 },
        { x: cx + Math.cos(rad) * 0.22, y: cy + Math.sin(rad) * 0.22 },
      ];
    }),
  ],
  fish: [
    // body (oval)
    generateCirclePoints(0.45, 0.45, 0.15, 24, 1.6, 1),
    // tail
    [{ x: 0.62, y: 0.45 }, { x: 0.75, y: 0.32 }, { x: 0.75, y: 0.58 }, { x: 0.62, y: 0.45 }],
    // eye
    generateCirclePoints(0.38, 0.42, 0.025, 10),
  ],
};

const SHAPE_KEYS = Object.keys(SHAPE_TEMPLATES);

function generateCirclePoints(cx: number, cy: number, r: number, segments: number, scaleX = 1, scaleY = 1): DrawPoint[] {
  const points: DrawPoint[] = [];
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push({
      x: cx + Math.cos(angle) * r * scaleX,
      y: cy + Math.sin(angle) * r * scaleY,
    });
  }
  return points;
}

function generateStarPoints(cx: number, cy: number, outerR: number, innerR: number, tips: number): DrawPoint[] {
  const points: DrawPoint[] = [];
  for (let i = 0; i <= tips * 2; i++) {
    const angle = (i / (tips * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    points.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  return points;
}

function generateHeartPoints(cx: number, cy: number, size: number): DrawPoint[] {
  const points: DrawPoint[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    const x = cx + size * 16 * Math.pow(Math.sin(t), 3) / 16;
    const y = cy - size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16;
    points.push({ x, y });
  }
  return points;
}

function addJitter(points: DrawPoint[], amount: number): DrawPoint[] {
  return points.map((p) => ({
    x: p.x + (Math.random() - 0.5) * amount,
    y: p.y + (Math.random() - 0.5) * amount,
  }));
}

const DRAW_COLORS = ['#000000', '#ef4444', '#3b82f6', '#22c55e', '#f97316', '#8b5cf6'];

// All words flattened for fake guess pool
let allWordsCache: string[] | null = null;
function getAllWords(): string[] {
  if (allWordsCache) return allWordsCache;
  allWordsCache = [];
  for (const cat of Object.values(categories)) {
    for (const w of cat.words) {
      allWordsCache.push(w.word);
    }
  }
  return allWordsCache;
}

export class BotController {
  private room: Room;
  private guessTimers: Map<string, ReturnType<typeof setTimeout>[]> = new Map();
  private drawTimers: ReturnType<typeof setTimeout>[] = [];
  private botCounter = 0;

  constructor(room: Room) {
    this.room = room;
  }

  /** Create a new bot player and add to room */
  createBot(): Player | null {
    const existingBots = [...this.room.players.values()].filter((p) => p.isBot);
    if (existingBots.length >= 5) return null;

    const idx = this.botCounter++;
    const botId = `bot_${nanoid(8)}`;
    const name = BOT_NAMES[idx % BOT_NAMES.length];
    const color = BOT_COLORS[idx % BOT_COLORS.length];

    const bot = new Player(botId, botId, `${name}`, color, false, true);
    bot.isReady = true;
    bot.isConnected = true;

    this.room.players.set(botId, bot);
    return bot;
  }

  /** Remove a specific bot */
  removeBot(botId: string): boolean {
    const player = this.room.players.get(botId);
    if (!player || !player.isBot) return false;
    this.clearBotTimers(botId);
    this.room.players.delete(botId);
    return true;
  }

  /** Remove all bots */
  removeAllBots(): void {
    for (const [id, p] of this.room.players.entries()) {
      if (p.isBot) {
        this.clearBotTimers(id);
        this.room.players.delete(id);
      }
    }
  }

  /** Start bot guessing behavior for a round */
  startBotGuessing(word: string, wordDifficulty: 1 | 2 | 3, drawTime: number): void {
    const bots = [...this.room.players.values()].filter(
      (p) => p.isBot && p.id !== this.room.currentDrawerId
    );

    const allWords = getAllWords();

    for (const bot of bots) {
      const timers: ReturnType<typeof setTimeout>[] = [];

      // Each bot will make 2-4 wrong guesses then eventually get it right
      const wrongGuessCount = 1 + Math.floor(Math.random() * 3);
      const totalGuessTime = drawTime * 1000;

      // Bot skill: correct guess at 30-80% of time elapsed
      const correctAt = totalGuessTime * (0.3 + Math.random() * 0.5);

      // Wrong guesses spread before the correct one
      for (let i = 0; i < wrongGuessCount; i++) {
        const wrongAt = (correctAt / (wrongGuessCount + 1)) * (i + 1) + Math.random() * 2000;
        const timer = setTimeout(() => {
          if (this.room.phase !== 'DRAWING') return;
          if (bot.guessedThisRound) return;

          // Pick a random wrong word
          const fakeWord = allWords[Math.floor(Math.random() * allWords.length)];
          if (fakeWord.toLowerCase() === word.toLowerCase()) return; // skip if accidentally correct

          this.emitBotChat(bot, fakeWord);
        }, wrongAt);
        timers.push(timer);
      }

      // Correct guess
      const correctTimer = setTimeout(() => {
        if (this.room.phase !== 'DRAWING') return;
        if (bot.guessedThisRound) return;

        // Process through room's handleGuess for proper scoring
        const msg = this.room.handleGuess(bot.id, word);
        if (msg) {
          this.room.emitToRoom('chat:message', msg);
        }
      }, correctAt);
      timers.push(correctTimer);

      this.guessTimers.set(bot.id, timers);
    }
  }

  /** Bot draws when it's their turn */
  startBotDrawing(word: string): void {
    this.clearDrawTimers();

    // Pick a random shape template
    const shapeKey = SHAPE_KEYS[Math.floor(Math.random() * SHAPE_KEYS.length)];
    const strokes = SHAPE_TEMPLATES[shapeKey];
    const color = DRAW_COLORS[Math.floor(Math.random() * DRAW_COLORS.length)];

    let delay = 500; // start after 500ms

    for (const points of strokes) {
      const jitteredPoints = addJitter(points, 0.01);
      const strokeDelay = delay;
      const timer = setTimeout(() => {
        if (this.room.phase !== 'DRAWING') return;

        const stroke: DrawStroke = {
          id: nanoid(8),
          tool: 'pen',
          color,
          size: 4 + Math.floor(Math.random() * 8),
          points: jitteredPoints,
        };

        this.room.addStroke(stroke);
        this.room.emitToRoom('draw:stroke', stroke);
      }, strokeDelay);

      this.drawTimers.push(timer);
      delay += 400 + Math.random() * 600; // stagger strokes
    }
  }

  /** Stop all bot timers */
  clearAllTimers(): void {
    for (const [id] of this.guessTimers) {
      this.clearBotTimers(id);
    }
    this.clearDrawTimers();
  }

  private clearBotTimers(botId: string): void {
    const timers = this.guessTimers.get(botId);
    if (timers) {
      timers.forEach(clearTimeout);
      this.guessTimers.delete(botId);
    }
  }

  private clearDrawTimers(): void {
    this.drawTimers.forEach(clearTimeout);
    this.drawTimers = [];
  }

  private emitBotChat(bot: Player, text: string): void {
    const msg: ChatMessage = {
      id: nanoid(10),
      type: 'user',
      playerId: bot.id,
      playerName: bot.name,
      playerColor: bot.avatarColor,
      text,
      timestamp: Date.now(),
    };
    // Bot guesses go to non-drawer players (same as real players)
    const drawerId = this.room.currentDrawerId;
    if (drawerId) {
      this.room.emitToRoomExcept('chat:message', msg, drawerId);
    } else {
      this.room.emitToRoom('chat:message', msg);
    }
  }
}
