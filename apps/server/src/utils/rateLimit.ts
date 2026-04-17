/**
 * Simple sliding-window rate limiter with periodic GC.
 *
 * In-memory only — not suitable for multi-instance deployments. For a
 * horizontally-scaled setup, swap the backing Map for a shared store
 * (Redis INCR+TTL keys or upstash/rate-limit).
 */

interface RateLimiterOptions {
  /** Minimum milliseconds allowed between successive events per key. */
  intervalMs: number;
  /** Optional: GC sweep interval. Defaults to 5 min. */
  sweepMs?: number;
  /** Optional: entries older than this are purged on sweep. Defaults to 30 min. */
  maxIdleMs?: number;
}

export class RateLimiter {
  private lastSeen = new Map<string, number>();
  private readonly intervalMs: number;
  private readonly maxIdleMs: number;
  private sweepHandle: NodeJS.Timeout | null = null;

  constructor(opts: RateLimiterOptions) {
    this.intervalMs = opts.intervalMs;
    this.maxIdleMs = opts.maxIdleMs ?? 30 * 60 * 1000;
    const sweepMs = opts.sweepMs ?? 5 * 60 * 1000;
    // `unref` so the sweep timer does not hold the process open.
    this.sweepHandle = setInterval(() => this.sweep(), sweepMs);
    this.sweepHandle?.unref?.();
  }

  /**
   * Returns true if the event is allowed (respected the interval),
   * false if it should be dropped.
   */
  tryConsume(key: string, now: number = Date.now()): boolean {
    const last = this.lastSeen.get(key) ?? 0;
    if (now - last < this.intervalMs) return false;
    this.lastSeen.set(key, now);
    return true;
  }

  /** Call on disconnect to free the slot immediately. */
  forget(key: string): void {
    this.lastSeen.delete(key);
  }

  /** Purges entries that have been idle longer than maxIdleMs. */
  sweep(now: number = Date.now()): number {
    let purged = 0;
    for (const [key, ts] of this.lastSeen) {
      if (now - ts > this.maxIdleMs) {
        this.lastSeen.delete(key);
        purged++;
      }
    }
    return purged;
  }

  /** Exposed for tests / metrics. */
  size(): number {
    return this.lastSeen.size;
  }

  /** Stop the sweeper. Call when shutting the process down in tests. */
  dispose(): void {
    if (this.sweepHandle) {
      clearInterval(this.sweepHandle);
      this.sweepHandle = null;
    }
    this.lastSeen.clear();
  }
}
