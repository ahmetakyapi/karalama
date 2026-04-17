import { describe, it, expect } from 'vitest';
import {
  calculateGuesserScore,
  calculateDrawerScore,
  normalizeGuess,
  levenshtein,
} from './scoring';

describe('calculateGuesserScore', () => {
  it('gives more points the faster you guess', () => {
    const fast = calculateGuesserScore({
      timeLeft: 80,
      totalTime: 80,
      guessOrder: 0,
      wordDifficulty: 1,
    });
    const slow = calculateGuesserScore({
      timeLeft: 10,
      totalTime: 80,
      guessOrder: 0,
      wordDifficulty: 1,
    });
    expect(fast).toBeGreaterThan(slow);
  });

  it('first guesser beats second guesser with same time', () => {
    const first = calculateGuesserScore({
      timeLeft: 40,
      totalTime: 80,
      guessOrder: 0,
      wordDifficulty: 1,
    });
    const second = calculateGuesserScore({
      timeLeft: 40,
      totalTime: 80,
      guessOrder: 1,
      wordDifficulty: 1,
    });
    expect(first).toBeGreaterThan(second);
  });

  it('harder words award more points', () => {
    const easy = calculateGuesserScore({
      timeLeft: 40,
      totalTime: 80,
      guessOrder: 0,
      wordDifficulty: 1,
    });
    const hard = calculateGuesserScore({
      timeLeft: 40,
      totalTime: 80,
      guessOrder: 0,
      wordDifficulty: 3,
    });
    expect(hard).toBeGreaterThan(easy);
  });
});

describe('calculateDrawerScore', () => {
  it('zero when nobody guessed', () => {
    expect(calculateDrawerScore({ guessedCount: 0, totalGuessers: 4 })).toBe(0);
  });

  it('proportional to guessed ratio', () => {
    const half = calculateDrawerScore({ guessedCount: 2, totalGuessers: 4 });
    const all = calculateDrawerScore({ guessedCount: 4, totalGuessers: 4 });
    expect(half).toBe(100);
    expect(all).toBe(200);
  });

  it('returns 0 when totalGuessers is 0', () => {
    expect(calculateDrawerScore({ guessedCount: 0, totalGuessers: 0 })).toBe(0);
  });
});

describe('normalizeGuess', () => {
  it('handles Turkish İ correctly (İ → i, not ı)', () => {
    expect(normalizeGuess('İSTANBUL')).toBe('istanbul');
  });

  it('handles Turkish I (I → ı)', () => {
    expect(normalizeGuess('KIŞ')).toBe('kış');
  });

  it('strips punctuation and extra whitespace', () => {
    expect(normalizeGuess('  ,Kedi!')).toBe('kedi');
  });

  it('preserves Turkish extended letters', () => {
    expect(normalizeGuess('çayyy ğiğ öö şş üü')).toBe('çayyy ğiğ öö şş üü');
  });
});

describe('levenshtein', () => {
  it('identical strings return 0', () => {
    expect(levenshtein('kedi', 'kedi')).toBe(0);
  });

  it('single edit returns 1', () => {
    expect(levenshtein('kedi', 'ked')).toBe(1);
    expect(levenshtein('kedi', 'kedim')).toBe(1);
    expect(levenshtein('kedi', 'kedy')).toBe(1);
  });

  it('handles empty strings', () => {
    expect(levenshtein('', '')).toBe(0);
    expect(levenshtein('a', '')).toBe(1);
    expect(levenshtein('', 'abc')).toBe(3);
  });

  it('computes longer distances', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
  });
});
