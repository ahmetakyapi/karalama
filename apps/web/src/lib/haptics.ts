type HapticPattern = 'tap' | 'success' | 'warn' | 'error' | 'select';

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 8,
  select: 5,
  success: [12, 40, 12],
  warn: [18, 80, 18],
  error: [25, 60, 25, 60, 25],
};

function hapticsEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('karalama_settings');
    if (!raw) return true;
    const p = JSON.parse(raw);
    return p?.hapticsEnabled !== false;
  } catch {
    return true;
  }
}

export function haptic(pattern: HapticPattern = 'tap') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  if (!hapticsEnabled()) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {}
}
