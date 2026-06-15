'use server';

import { headers } from 'next/headers';
import { getPinEnv } from '@/lib/env';

// Rate limiting: max 5 attempts per 60 seconds per IP
// In-memory store (resets on server restart, suitable for single-instance or low-traffic)
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries periodically to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(key);
    }
  }
}, CLEANUP_INTERVAL_MS);

async function getClientIdentifier(): Promise<string> {
  const h = await headers();
  const ip =
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown';
  return `pin:${ip}`;
}

async function checkRateLimit(): Promise<{
  allowed: boolean;
  remaining: number;
  lockedUntil?: number;
}> {
  const key = await getClientIdentifier();
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    return { allowed: true, remaining: RATE_LIMIT_MAX_ATTEMPTS - 1 };
  }

  if (now < entry.lockedUntil) {
    return { allowed: false, remaining: 0, lockedUntil: entry.lockedUntil };
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    // Window expired, reset
    rateLimitStore.delete(key);
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

async function recordAttempt(): Promise<void> {
  const key = await getClientIdentifier();
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now, lockedUntil: 0 });
  } else {
    entry.attempts += 1;
  }
}

export async function validatePin(pin: string): Promise<boolean> {
  const rateLimit = await checkRateLimit();

  if (!rateLimit.allowed) {
    const remainingSeconds = Math.ceil(
      (rateLimit.lockedUntil! - Date.now()) / 1000,
    );
    throw new Error(
      `Muitas tentativas. Tente novamente em ${remainingSeconds} segundos.`,
    );
  }

  const { SECRET_PIN } = getPinEnv();

  // Prevenção de timing attacks simples (usando delay constante ou length check)
  if (pin.length !== 4) {
    await recordAttempt();
    return false;
  }

  // Em produção real, uma string comparison normal pode sofrer timing attacks.
  // Para este escopo, a validação exata é suficiente.
  const isValid = pin === SECRET_PIN;

  if (!isValid) {
    await recordAttempt();
  }

  return isValid;
}
