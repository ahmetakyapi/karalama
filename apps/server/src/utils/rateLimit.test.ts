import { describe, it, expect, afterEach } from 'vitest';
import { RateLimiter } from './rateLimit';

const limiters: RateLimiter[] = [];
function make(opts: { intervalMs: number; maxIdleMs?: number }) {
  const l = new RateLimiter(opts);
  limiters.push(l);
  return l;
}

afterEach(() => {
  while (limiters.length) limiters.pop()!.dispose();
});

describe('RateLimiter', () => {
  it('allows first event and blocks immediate follow-up', () => {
    const l = make({ intervalMs: 100 });
    expect(l.tryConsume('a', 1000)).toBe(true);
    expect(l.tryConsume('a', 1050)).toBe(false);
    expect(l.tryConsume('a', 1100)).toBe(true);
  });

  it('tracks keys independently', () => {
    const l = make({ intervalMs: 100 });
    expect(l.tryConsume('a', 1000)).toBe(true);
    expect(l.tryConsume('b', 1000)).toBe(true);
    expect(l.tryConsume('a', 1050)).toBe(false);
    expect(l.tryConsume('b', 1050)).toBe(false);
  });

  it('forget() frees the slot', () => {
    const l = make({ intervalMs: 100 });
    l.tryConsume('a', 1000);
    l.forget('a');
    expect(l.tryConsume('a', 1001)).toBe(true);
  });

  it('sweep() purges idle entries', () => {
    const l = make({ intervalMs: 100, maxIdleMs: 500 });
    l.tryConsume('a', 1000);
    l.tryConsume('b', 2000);
    expect(l.size()).toBe(2);
    // At t=2400: a is 1400ms idle (> 500 → purged), b is 400ms idle (kept)
    const purged = l.sweep(2400);
    expect(purged).toBe(1);
    expect(l.size()).toBe(1);
  });
});
