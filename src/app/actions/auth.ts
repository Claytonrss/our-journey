'use server';

import { headers } from 'next/headers';
import { getPinEnv } from '@/lib/env';
import { getRateLimitStore, type RateLimitEntry } from '@/lib/rateLimitStore';

const RATE_LIMIT_MAX_ATTEMPTS =
  Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || 10;
const RATE_LIMIT_WINDOW_MS = 60_000;
const CLEANUP_INTERVAL_MS = 60_000;

let lastCleanup = 0;

function cleanupExpiredEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const store = getRateLimitStore();
  for (const [key, entry] of store) {
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}

async function getClientIdentifier(): Promise<string> {
  try {
    const h = await headers();
    const ip =
      h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      h.get('x-real-ip') ||
      'unknown';
    return `pin:${ip}`;
  } catch {
    return 'pin:unknown';
  }
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  lockedUntil?: number;
}

async function checkRateLimit(key: string): Promise<RateLimitResult> {
  cleanupExpiredEntries();

  const store = getRateLimitStore();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - 1 };
  }

  if (now < entry.lockedUntil) {
    return { allowed: false, remaining: 0, lockedUntil: entry.lockedUntil };
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    store.delete(key);
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - 1 };
  }

  if (entry.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    const lockedUntil = now + RATE_LIMIT_WINDOW_MS;
    entry.lockedUntil = lockedUntil;
    return { allowed: false, remaining: 0, lockedUntil };
  }

  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_ATTEMPTS - entry.attempts - 1,
  };
}

function recordAttempt(key: string): void {
  const store = getRateLimitStore();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    store.set(key, { attempts: 1, firstAttempt: now, lockedUntil: 0 });
  } else {
    entry.attempts += 1;
  }
}

export async function validatePin(pin: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const clientKey = await getClientIdentifier();
  const rateLimit = await checkRateLimit(clientKey);

  if (!rateLimit.allowed) {
    const remainingSeconds = Math.ceil(
      (rateLimit.lockedUntil! - Date.now()) / 1000,
    );
    return {
      success: false,
      error: `Muitas tentativas. Tente novamente em ${remainingSeconds} segundos.`,
    };
  }

  const { SECRET_PIN } = getPinEnv();

  if (pin.length !== 4) {
    recordAttempt(clientKey);
    return { success: false };
  }

  const isValid = pin === SECRET_PIN;

  if (!isValid) {
    recordAttempt(clientKey);
  }

  return { success: isValid };
}
