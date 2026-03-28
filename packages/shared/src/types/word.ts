export interface WordEntry {
  word: string;
  difficulty: 1 | 2 | 3;
}

export interface WordOption {
  word: string;
  difficulty: 1 | 2 | 3;
  category: string;
}

export interface CategoryDef {
  name: string;
  emoji: string;
  words: WordEntry[];
}
