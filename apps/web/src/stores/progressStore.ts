import { create } from 'zustand';

interface ProgressStore {
  xp: number;
  level: number;
  gamesPlayed: number;
  totalCorrectGuesses: number;
  currentStreak: number;
  bestStreak: number;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  recordGame: () => void;
  recordCorrectGuess: () => void;
}

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

function loadProgress() {
  if (typeof window === 'undefined') return { xp: 0, level: 1, gamesPlayed: 0, totalCorrectGuesses: 0, currentStreak: 0, bestStreak: 0 };
  try {
    const saved = localStorage.getItem('karalama_progress');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { xp: 0, level: 1, gamesPlayed: 0, totalCorrectGuesses: 0, currentStreak: 0, bestStreak: 0 };
}

function saveProgress(state: Partial<ProgressStore>) {
  if (typeof window === 'undefined') return;
  try {
    const data = {
      xp: state.xp,
      level: state.level,
      gamesPlayed: state.gamesPlayed,
      totalCorrectGuesses: state.totalCorrectGuesses,
      currentStreak: state.currentStreak,
      bestStreak: state.bestStreak,
    };
    localStorage.setItem('karalama_progress', JSON.stringify(data));
  } catch {}
}

const initial = loadProgress();

export const useProgressStore = create<ProgressStore>((set, get) => ({
  ...initial,

  addXP: (amount) =>
    set((state) => {
      let newXP = state.xp + amount;
      let newLevel = state.level;

      // Level up check
      while (newXP >= xpForLevel(newLevel)) {
        newXP -= xpForLevel(newLevel);
        newLevel++;
      }

      const updated = { xp: newXP, level: newLevel };
      saveProgress({ ...state, ...updated });
      return updated;
    }),

  incrementStreak: () =>
    set((state) => {
      const newStreak = state.currentStreak + 1;
      const newBest = Math.max(state.bestStreak, newStreak);
      const updated = { currentStreak: newStreak, bestStreak: newBest };
      saveProgress({ ...state, ...updated });
      return updated;
    }),

  resetStreak: () =>
    set((state) => {
      const updated = { currentStreak: 0 };
      saveProgress({ ...state, ...updated });
      return updated;
    }),

  recordGame: () =>
    set((state) => {
      const updated = { gamesPlayed: state.gamesPlayed + 1 };
      saveProgress({ ...state, ...updated });
      return updated;
    }),

  recordCorrectGuess: () =>
    set((state) => {
      const updated = { totalCorrectGuesses: state.totalCorrectGuesses + 1 };
      saveProgress({ ...state, ...updated });
      return updated;
    }),
}));

export function getXPForNextLevel(level: number): number {
  return xpForLevel(level);
}
