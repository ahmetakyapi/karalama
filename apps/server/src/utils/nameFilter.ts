const BAD_WORDS = [
  'amk', 'amq', 'amcık', 'amcik', 'aptal',
  'göt', 'got', 'sikim', 'siktir', 'sikik', 'sikko',
  'piç', 'pic', 'orospu', 'oç', 'orospuçocuğu',
  'mal', 'salak', 'ibne', 'yarak', 'yarrak',
  'fuck', 'shit', 'bitch', 'ass', 'cunt', 'dick',
  'nazi', 'hitler',
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
  for (const bad of BAD_WORDS) {
    if (normalized.includes(bad)) {
      return { ok: false, name: '', reason: 'PROFANITY' };
    }
  }

  return { ok: true, name: trimmed };
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
