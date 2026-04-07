export const ROOM_CODE_LENGTH = 6;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 12;
export const MIN_ROUNDS = 1;
export const MAX_ROUNDS = 10;
export const MIN_DRAW_TIME = 30;
export const MAX_DRAW_TIME = 120;
export const WORD_PICK_TIME = 15;
export const ROUND_RESULT_TIME = 5;
export const GAME_OVER_TIME = 15;
export const HINT_REVEAL_1 = 0.66; // reveal first letter at 66% time
export const HINT_REVEAL_2 = 0.33; // reveal second letter at 33% time
export const ROOM_EXPIRE_MINUTES = 30;
export const MAX_CHAT_LENGTH = 100;
export const CHAT_RATE_LIMIT_MS = 500;
export const DRAW_RATE_LIMIT_MS = 33; // ~30fps

// Bot config
export const MAX_BOTS = 5;
export const BOT_NAMES = [
  'Robocop', 'Piksel', 'Fırça', 'Kalem', 'Boya',
  'Palet', 'Tuval', 'Çizgi', 'Desen', 'Sanatçı',
] as const;
export const BOT_COLORS = [
  '#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e',
  '#8b5cf6', '#14b8a6', '#f97316', '#d946ef', '#84cc16',
] as const;
