export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  score: number;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  guessedThisRound: boolean;
}

export type PlayerPublic = Omit<Player, 'guessedThisRound'> & {
  guessedThisRound: boolean;
};

export interface PodiumEntry {
  playerId: string;
  playerName: string;
  avatarColor: string;
  score: number;
  rank: number;
}

export const AVATAR_COLORS = [
  '#6366f1', // indigo
  '#22d3ee', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
  '#d946ef', // fuchsia
  '#84cc16', // lime
  '#0ea5e9', // sky
  '#ef4444', // red
] as const;

export interface AvatarCharacter {
  id: string;
  name: string;
  color: string;
  emoji: string;
}

export const AVATAR_CHARACTERS: AvatarCharacter[] = [
  { id: 'robot', name: 'Robot', color: '#6366f1', emoji: '🤖' },
  { id: 'cat', name: 'Kedi', color: '#f59e0b', emoji: '🐱' },
  { id: 'alien', name: 'Uzaylı', color: '#10b981', emoji: '👽' },
  { id: 'wizard', name: 'Büyücü', color: '#8b5cf6', emoji: '🧙' },
  { id: 'ninja', name: 'Ninja', color: '#f43f5e', emoji: '🥷' },
] as const;
