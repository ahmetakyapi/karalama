import { describe, it, expect } from 'vitest';
import {
  sanitizePlayerName,
  sanitizeAvatarColor,
  sanitizeChatMessage,
} from './nameFilter';

describe('sanitizePlayerName', () => {
  it('accepts a simple latin name', () => {
    const r = sanitizePlayerName('Ahmet');
    expect(r.ok).toBe(true);
    expect(r.name).toBe('Ahmet');
  });

  it('accepts Turkish letters', () => {
    const r = sanitizePlayerName('Zeynep Çağ');
    expect(r.ok).toBe(true);
    expect(r.name).toBe('Zeynep Çağ');
  });

  it('trims whitespace', () => {
    const r = sanitizePlayerName('  Ali  ');
    expect(r.ok).toBe(true);
    expect(r.name).toBe('Ali');
  });

  it('strips zero-width characters', () => {
    const r = sanitizePlayerName('A\u200Bli');
    expect(r.ok).toBe(true);
    expect(r.name).toBe('Ali');
  });

  it('rejects empty strings', () => {
    expect(sanitizePlayerName('').ok).toBe(false);
    expect(sanitizePlayerName('   ').ok).toBe(false);
  });

  it('rejects non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizePlayerName(null as any).ok).toBe(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizePlayerName(42 as any).ok).toBe(false);
  });

  it('enforces max length of 20', () => {
    const r = sanitizePlayerName('x'.repeat(30));
    expect(r.ok).toBe(true);
    expect(r.name.length).toBe(20);
  });

  it('rejects forbidden characters (emoji only)', () => {
    // Emoji are technically symbols, not letters → rejected
    const r = sanitizePlayerName('🔥🔥');
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('INVALID_CHARS');
  });

  it('blocks exact profanity', () => {
    expect(sanitizePlayerName('amk').ok).toBe(false);
    expect(sanitizePlayerName('SİKTİR').ok).toBe(false);
  });

  it('blocks homoglyph profanity', () => {
    expect(sanitizePlayerName('s1kt1r').ok).toBe(false);
    expect(sanitizePlayerName('4mk').ok).toBe(false);
  });

  it('does NOT block innocent words that share letters', () => {
    expect(sanitizePlayerName('Picasso').ok).toBe(true);
    expect(sanitizePlayerName('Masaj').ok).toBe(true);
    expect(sanitizePlayerName('Bitcoin').ok).toBe(true);
  });
});

describe('sanitizeAvatarColor', () => {
  it('accepts allowed colors', () => {
    expect(sanitizeAvatarColor('#6366f1')).toBe('#6366f1');
    expect(sanitizeAvatarColor('#10b981')).toBe('#10b981');
  });

  it('normalizes case', () => {
    expect(sanitizeAvatarColor('#6366F1')).toBe('#6366f1');
  });

  it('falls back to default for unknown colors', () => {
    expect(sanitizeAvatarColor('#000000')).toBe('#6366f1');
    expect(sanitizeAvatarColor('red')).toBe('#6366f1');
  });

  it('falls back for non-string input', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(sanitizeAvatarColor(null as any)).toBe('#6366f1');
  });
});

describe('sanitizeChatMessage', () => {
  it('passes clean messages through', () => {
    expect(sanitizeChatMessage('merhaba dünya')).toBe('merhaba dünya');
  });

  it('collapses whitespace and trims', () => {
    expect(sanitizeChatMessage('  a    b   c  ')).toBe('a b c');
  });

  it('strips control chars', () => {
    expect(sanitizeChatMessage('hi\u0000there')).toBe('hithere');
  });

  it('caps length at 100 chars', () => {
    const r = sanitizeChatMessage('x'.repeat(200));
    expect(r.length).toBe(100);
  });

  it('masks profanity per word, keeps rest', () => {
    const r = sanitizeChatMessage('amk ne bu');
    expect(r).toMatch(/^\*+ ne bu$/);
  });

  it('returns empty for junk-only input', () => {
    expect(sanitizeChatMessage('')).toBe('');
    expect(sanitizeChatMessage('   ')).toBe('');
    expect(sanitizeChatMessage(42 as unknown as string)).toBe('');
  });
});
