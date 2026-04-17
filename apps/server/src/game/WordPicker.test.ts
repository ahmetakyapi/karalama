import { describe, it, expect } from 'vitest';
import { WordPicker } from './WordPicker';

describe('WordPicker', () => {
  it('returns the requested number of options', () => {
    const picker = new WordPicker(['hayvanlar', 'yemekler']);
    const opts = picker.pickOptions(3);
    expect(opts).toHaveLength(3);
  });

  it('returns unique words across picks once marked used', () => {
    const picker = new WordPicker(['hayvanlar']);
    const first = picker.pickOptions(3);
    first.forEach((o) => picker.markUsed(o.word));
    const second = picker.pickOptions(3);
    // intersection should be empty
    const firstWords = new Set(first.map((o) => o.word));
    for (const o of second) {
      expect(firstWords.has(o.word)).toBe(false);
    }
  });

  it('includes custom words as medium difficulty when they are the only words', () => {
    // Pass a non-existent category key so only custom words remain in the pool.
    const picker = new WordPicker(['__nonexistent__'], ['karalama-özel-kelime']);
    const opts = picker.pickOptions(3);
    const custom = opts.find((o) => o.word === 'karalama-özel-kelime');
    expect(custom).toBeDefined();
    expect(custom!.difficulty).toBe(2);
    expect(custom!.category).toBe('ozel');
  });

  it('falls back to all categories when none enabled', () => {
    const picker = new WordPicker([]);
    const opts = picker.pickOptions(3);
    expect(opts.length).toBeGreaterThan(0);
  });

  it('reset clears the used set', () => {
    const picker = new WordPicker(['hayvanlar']);
    const first = picker.pickOptions(3);
    first.forEach((o) => picker.markUsed(o.word));
    picker.reset();
    const second = picker.pickOptions(3);
    // After reset, same words may appear again (probabilistic but possible)
    expect(second).toHaveLength(3);
  });
});
