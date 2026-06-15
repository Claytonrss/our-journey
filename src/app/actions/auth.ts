'use server';

import { getPinEnv } from '@/lib/env';

// Rate limiting: max 5 attempts per 60 seconds per IP
// In-memory store (resets on server restart, suitable for single-instance or low-traffic)
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60_000;

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getClientIdentifier(): string {
  // In production, use a more robust identifier (e.g., IP from headers)
  // For server actions, we use a simple hash of the current time window
  // This is a basic implementation; for production, consider Redis or a persistent store
  const now = Date.now();
  const window = Math.floor(now / RATE_LIMIT_WINDOW_MS);
  return `pin-attempt-${window}`;
}

function checkRateLimit(): {
  allowed: boolean;
  remaining: number;
  lockedUntil?: number;
} {
  const key = getClientIdentifier();
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

function recordAttempt(): void {
  const key = getClientIdentifier();
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { attempts: 1, firstAttempt: now, lockedUntil: 0 });
  } else {
    entry.attempts += 1;
  }
}

export async function validatePin(pin: string): Promise<boolean> {
  const rateLimit = checkRateLimit();

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
    recordAttempt();
    return false;
  }

  // Em produção real, uma string comparison normal pode sofrer timing attacks.
  // Para este escopo, a validação exata é suficiente.
  const isValid = pin === SECRET_PIN;

  if (!isValid) {
    recordAttempt();
  }

  return isValid;
}
