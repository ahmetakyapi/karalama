import { describe, it, expect } from 'vitest';
import { categories } from './constants/words';
import { WORD_COUNT, CATEGORY_COUNT, WORD_COUNT_LABEL } from './constants/stats';

describe('public word stats', () => {
  it('match the word list', () => {
    const distinct = new Set<string>();
    for (const cat of Object.values(categories)) {
      for (const w of cat.words) distinct.add(w.word.toLocaleLowerCase('tr-TR'));
    }
    expect(WORD_COUNT).toBe(distinct.size);
    expect(CATEGORY_COUNT).toBe(Object.keys(categories).length);
  });

  it('never claim more words than there are', () => {
    expect(parseInt(WORD_COUNT_LABEL, 10)).toBeLessThanOrEqual(WORD_COUNT);
  });
});
