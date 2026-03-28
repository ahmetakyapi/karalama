export interface GuesserScoreParams {
  timeLeft: number;
  totalTime: number;
  guessOrder: number;
  wordDifficulty: 1 | 2 | 3;
}

export interface DrawerScoreParams {
  guessedCount: number;
  totalGuessers: number;
}

const DIFFICULTY_MULTIPLIER: Record<number, number> = {
  1: 1.0,
  2: 1.2,
  3: 1.5,
};

export function calculateGuesserScore(p: GuesserScoreParams): number {
  const base = 100;
  const timeRatio = p.timeLeft / p.totalTime;
  const timeBonus = Math.round(150 * timeRatio);
  const speedBonus = Math.max(0, 50 - p.guessOrder * 15);
  const multiplier = DIFFICULTY_MULTIPLIER[p.wordDifficulty] ?? 1;
  return Math.round((base + timeBonus + speedBonus) * multiplier);
}

export function calculateDrawerScore(p: DrawerScoreParams): number {
  if (p.totalGuessers === 0) return 0;
  const ratio = p.guessedCount / p.totalGuessers;
  return Math.min(200, Math.round(ratio * 200));
}

export function normalizeGuess(text: string): string {
  return text
    .toLowerCase()
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/[^a-zA-ZçÇğĞıİöÖşŞüÜ\s]/g, '')
    .trim();
}

export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}
