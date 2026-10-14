/**
 * Numbers the site shows about the word list. Written out on purpose so the
 * landing page doesn't ship the whole list just to count it; stats.test.ts
 * fails as soon as the list changes and these drift.
 */
export const WORD_COUNT = 987; // distinct words (a few sit in two categories)
export const CATEGORY_COUNT = 18;

/** "980+": rounded down to a ten, so the claim stays true. */
export const WORD_COUNT_LABEL = `${Math.floor(WORD_COUNT / 10) * 10}+`;
