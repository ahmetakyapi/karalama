import {
  categories,
  type WordOption,
  type WordEntry,
} from '@karalama/shared';

export class WordPicker {
  private usedWords: Set<string> = new Set();
  private enabledCategories: string[];

  constructor(enabledCategories: string[]) {
    this.enabledCategories = enabledCategories.length
      ? enabledCategories
      : Object.keys(categories);
  }

  pickOptions(count: number): WordOption[] {
    const allWords: WordOption[] = [];

    for (const catKey of this.enabledCategories) {
      const cat = categories[catKey];
      if (!cat) continue;
      for (const w of cat.words) {
        if (!this.usedWords.has(w.word)) {
          allWords.push({ word: w.word, difficulty: w.difficulty, category: catKey });
        }
      }
    }

    // Pick one from each difficulty if possible
    const easy = allWords.filter((w) => w.difficulty === 1);
    const medium = allWords.filter((w) => w.difficulty === 2);
    const hard = allWords.filter((w) => w.difficulty === 3);

    const result: WordOption[] = [];

    const pickRandom = (arr: WordOption[]): WordOption | undefined => {
      if (arr.length === 0) return undefined;
      return arr[Math.floor(Math.random() * arr.length)];
    };

    const easyPick = pickRandom(easy);
    if (easyPick) result.push(easyPick);

    const medPick = pickRandom(medium);
    if (medPick) result.push(medPick);

    const hardPick = pickRandom(hard);
    if (hardPick) result.push(hardPick);

    // Fill remaining from all if needed
    while (result.length < count && allWords.length > result.length) {
      const pick = pickRandom(allWords.filter((w) => !result.includes(w)));
      if (pick) result.push(pick);
      else break;
    }

    return result.slice(0, count);
  }

  markUsed(word: string): void {
    this.usedWords.add(word);
  }

  reset(): void {
    this.usedWords.clear();
  }
}
