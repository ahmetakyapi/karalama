// Whole-word matches (compared against normalized token or substring-safe).
const BAD_WORDS_EXACT = [
  'amk', 'amq', 'amcık', 'amcik', 'aptal', 'sikim', 'sikik', 'sikko',
  'siktir', 'göt', 'piç', 'orospu', 'orospucocugu', 'orospucocugu',
  'ibne', 'yarak', 'yarrak', 'pezevenk', 'puşt', 'pust',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'asshole',
  'nazi', 'hitler',
];

// Partial matches for strong slurs that are never OK even as a prefix.
const BAD_WORDS_SUBSTR = [
  'orospuc', 'sikim', 'amina', 'aminako',
];

const HOMOGLYPHS: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't',
  '@': 'a', '$': 's', '!': 'i',
};

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width chars
    .split('')
    .map((c) => HOMOGLYPHS[c] ?? c)
    .join('')
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

export function sanitizePlayerName(raw: unknown): {
  ok: boolean;
  name: string;
  reason?: string;
} {
  if (typeof raw !== 'string') {
    return { ok: false, name: '', reason: 'INVALID' };
  }
  const trimmed = raw
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .slice(0, 20);

  if (trimmed.length < 1) {
    return { ok: false, name: '', reason: 'TOO_SHORT' };
  }
  if (trimmed.length > 20) {
    return { ok: false, name: '', reason: 'TOO_LONG' };
  }
  // allow letters, numbers, space, underscore, hyphen
  if (!/^[\p{L}\p{N} _-]+$/u.test(trimmed)) {
    return { ok: false, name: '', reason: 'INVALID_CHARS' };
  }

  const normalized = normalize(trimmed);
  if (isProfane(normalized)) {
    return { ok: false, name: '', reason: 'PROFANITY' };
  }

  return { ok: true, name: trimmed };
}

function isProfane(normalized: string): boolean {
  // exact match or surrounded by word-break equivalent (normalized strips punctuation)
  for (const bad of BAD_WORDS_EXACT) {
    if (normalized === bad) return true;
  }
  for (const bad of BAD_WORDS_SUBSTR) {
    if (normalized.includes(bad)) return true;
  }
  return false;
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const ALLOWED_COLORS = new Set([
  '#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#f43f5e',
  '#8b5cf6', '#14b8a6', '#f97316', '#d946ef', '#84cc16',
  '#0ea5e9', '#ef4444',
]);

export function sanitizeAvatarColor(raw: unknown): string {
  if (typeof raw !== 'string') return '#6366f1';
  if (!HEX_COLOR_RE.test(raw)) return '#6366f1';
  return ALLOWED_COLORS.has(raw.toLowerCase()) ? raw.toLowerCase() : '#6366f1';
}

/**
 * Sanitize a chat / guess message. Strips control chars, collapses
 * repeated whitespace, masks profanity by word (not full block) so
 * guesses that partially overlap still work. Returns empty string if
 * the message is pure junk.
 */
export function sanitizeChatMessage(raw: unknown): string {
  if (typeof raw !== 'string') return '';
  const cleaned = raw
    .normalize('NFC')
    // strip zero-width + control chars
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, '')
    // collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

  if (!cleaned) return '';

  // Mask profanity tokens word-by-word
  const masked = cleaned
    .split(' ')
    .map((word) => {
      const norm = normalize(word);
      if (!norm) return word;
      if (isProfane(norm)) {
        return '*'.repeat(Math.max(word.length, 3));
      }
      return word;
    })
    .join(' ');

  return masked;
}
