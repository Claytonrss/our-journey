import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  getPinEnv: () => ({ SECRET_PIN: '1917' }),
}));

vi.mock('next/headers', () => ({
  headers: () =>
    Promise.resolve(
      new Headers({
        'x-forwarded-for': '127.0.0.1',
      }),
    ),
}));

describe('validatePin', () => {
  let validatePin: (pin: string) => Promise<boolean>;

  beforeAll(async () => {
    const mod = await import('@/app/actions/auth');
    validatePin = mod.validatePin;
  });

  it('returns true for correct PIN', async () => {
    const result = await validatePin('1917');
    expect(result).toBe(true);
  });

  it('returns false for wrong PIN', async () => {
    const result = await validatePin('0000');
    expect(result).toBe(false);
  });

  it('returns false for PIN shorter than 4 digits', async () => {
    const result = await validatePin('191');
    expect(result).toBe(false);
  });

  it('returns false for PIN longer than 4 digits', async () => {
    const result = await validatePin('19170');
    expect(result).toBe(false);
  });

  it('returns false for PIN with letters', async () => {
    const result = await validatePin('abcd');
    expect(result).toBe(false);
  });

  it('returns false for empty string', async () => {
    const result = await validatePin('');
    expect(result).toBe(false);
  });
});
