import { AVATAR_CHARACTERS } from '@karalama/shared';

/** Who you are on this device — name, character and colour, no account. */
export type SavedPlayer = { name: string; avatarId: string; color: string };

const KEY = 'karalama_player';

export function loadSavedPlayer(): SavedPlayer | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<SavedPlayer>) : null;
    if (!parsed?.name) return null;
    const avatar = AVATAR_CHARACTERS.find((a) => a.id === parsed.avatarId) ?? AVATAR_CHARACTERS[0];
    return { name: parsed.name, avatarId: avatar.id, color: parsed.color || avatar.color };
  } catch {
    return null;
  }
}

export function savePlayer(p: SavedPlayer) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* private mode / quota — the game still works for this visit */
  }
}

/**
 * The link people share: just the room. Never the address bar as-is, which
 * may carry the sharer's own `?name=` and make every friend join under it.
 */
export function roomLink(code: string) {
  return `${window.location.origin}/oda/${code}`;
}

// Built from a string: the regex literal form needs an ES2018 target
const NAME_RE = new RegExp('^[\\p{L}\\p{N} _-]+$', 'u');

/** Mirrors the server's name rule so people see the problem before joining. */
export function nameProblem(name: string): string | null {
  const t = name.trim();
  if (!t) return null;
  if (!NAME_RE.test(t)) return 'Adında yalnızca harf, rakam, boşluk, - ve _ olabilir';
  return null;
}
