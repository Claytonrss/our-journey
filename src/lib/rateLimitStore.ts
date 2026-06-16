export interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number;
}

type RateLimitStore = Map<string, RateLimitEntry>;

const GLOBAL_KEY = '__ourJourneyRateLimitStore';

export function getRateLimitStore(): RateLimitStore {
  const g = globalThis as Record<string, unknown>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = new Map<string, RateLimitEntry>();
  }
  return g[GLOBAL_KEY] as RateLimitStore;
}

export function resetRateLimitStore(): void {
  getRateLimitStore().clear();
}
