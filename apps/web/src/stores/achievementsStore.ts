import { create } from 'zustand';
import { useProgressStore } from './progressStore';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_game', title: 'İlk Adım', description: 'İlk oyununu bitir', icon: '🎨', tier: 'bronze', xpReward: 20 },
  { id: 'first_correct', title: 'İlk Bilgi', description: 'İlk kelimeyi doğru bil', icon: '💡', tier: 'bronze', xpReward: 20 },
  { id: 'streak_3', title: 'Üst Üste Üç', description: '3 kelimeyi üst üste bil', icon: '🔥', tier: 'bronze', xpReward: 40 },
  { id: 'streak_5', title: 'Seri Avcı', description: '5 kelimeyi üst üste bil', icon: '⚡', tier: 'silver', xpReward: 80 },
  { id: 'streak_10', title: 'Kehanet Ustası', description: '10 kelimeyi üst üste bil', icon: '🧠', tier: 'gold', xpReward: 200 },
  { id: 'games_10', title: 'Düzenli Oyuncu', description: '10 oyun oyna', icon: '🕹️', tier: 'bronze', xpReward: 50 },
  { id: 'games_50', title: 'Bağımlı', description: '50 oyun oyna', icon: '🏆', tier: 'silver', xpReward: 150 },
  { id: 'games_100', title: 'Karalama Efsanesi', description: '100 oyun oyna', icon: '👑', tier: 'gold', xpReward: 400 },
  { id: 'guesses_25', title: 'Keskin Göz', description: '25 doğru tahmin yap', icon: '🎯', tier: 'bronze', xpReward: 50 },
  { id: 'guesses_100', title: 'Tahminci', description: '100 doğru tahmin yap', icon: '🔎', tier: 'silver', xpReward: 150 },
  { id: 'guesses_500', title: 'Bilge', description: '500 doğru tahmin yap', icon: '📚', tier: 'gold', xpReward: 500 },
  { id: 'level_5', title: 'Yeni Yıldız', description: 'Seviye 5\'e ulaş', icon: '⭐', tier: 'bronze', xpReward: 40 },
  { id: 'level_10', title: 'Tanınan Sanatçı', description: 'Seviye 10\'a ulaş', icon: '🌟', tier: 'silver', xpReward: 120 },
  { id: 'level_25', title: 'Usta Ressam', description: 'Seviye 25\'e ulaş', icon: '🎖️', tier: 'gold', xpReward: 400 },
  { id: 'level_50', title: 'Karalama Kralı', description: 'Seviye 50\'ye ulaş', icon: '💎', tier: 'platinum', xpReward: 1000 },
  { id: 'speed_guess', title: 'Yıldırım', description: 'Süre dolmadan ilk 5 saniyede tahmin et', icon: '⚡', tier: 'silver', xpReward: 100 },
  { id: 'perfect_round', title: 'Mükemmel Tur', description: 'Tüm oyuncular senin çizimini bildi', icon: '🎨', tier: 'gold', xpReward: 200 },
  { id: 'night_owl', title: 'Gece Kuşu', description: 'Gece yarısından sonra oyun oyna', icon: '🦉', tier: 'bronze', xpReward: 30 },
];

interface AchievementsStore {
  unlocked: Record<string, number>; // id -> timestamp
  queue: Achievement[];
  tryUnlock: (id: string) => boolean;
  dismissFirst: () => void;
  reset: () => void;
  isUnlocked: (id: string) => boolean;
}

function loadUnlocked(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem('karalama_achievements');
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveUnlocked(unlocked: Record<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('karalama_achievements', JSON.stringify(unlocked));
  } catch {}
}

export const useAchievementsStore = create<AchievementsStore>((set, get) => ({
  unlocked: loadUnlocked(),
  queue: [],

  isUnlocked: (id) => Boolean(get().unlocked[id]),

  tryUnlock: (id) => {
    const state = get();
    if (state.unlocked[id]) return false;
    const def = ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return false;
    const next = { ...state.unlocked, [id]: Date.now() };
    saveUnlocked(next);
    set({ unlocked: next, queue: [...state.queue, def] });
    // Award bonus XP
    try {
      useProgressStore.getState().addXP(def.xpReward);
    } catch {}
    return true;
  },

  dismissFirst: () => set((s) => ({ queue: s.queue.slice(1) })),

  reset: () => {
    saveUnlocked({});
    set({ unlocked: {}, queue: [] });
  },
}));

/** Re-evaluate stat-based achievements and unlock any newly qualifying ones. */
export function evaluateStatAchievements() {
  const p = useProgressStore.getState();
  const a = useAchievementsStore.getState();

  if (p.gamesPlayed >= 1) a.tryUnlock('first_game');
  if (p.totalCorrectGuesses >= 1) a.tryUnlock('first_correct');
  if (p.currentStreak >= 3) a.tryUnlock('streak_3');
  if (p.currentStreak >= 5) a.tryUnlock('streak_5');
  if (p.currentStreak >= 10) a.tryUnlock('streak_10');
  if (p.gamesPlayed >= 10) a.tryUnlock('games_10');
  if (p.gamesPlayed >= 50) a.tryUnlock('games_50');
  if (p.gamesPlayed >= 100) a.tryUnlock('games_100');
  if (p.totalCorrectGuesses >= 25) a.tryUnlock('guesses_25');
  if (p.totalCorrectGuesses >= 100) a.tryUnlock('guesses_100');
  if (p.totalCorrectGuesses >= 500) a.tryUnlock('guesses_500');
  if (p.level >= 5) a.tryUnlock('level_5');
  if (p.level >= 10) a.tryUnlock('level_10');
  if (p.level >= 25) a.tryUnlock('level_25');
  if (p.level >= 50) a.tryUnlock('level_50');

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5 && p.gamesPlayed >= 1) a.tryUnlock('night_owl');
}
