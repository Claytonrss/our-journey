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
  let validatePin: (
    pin: string,
  ) => Promise<{ success: boolean; error?: string }>;

  beforeAll(async () => {
    const mod = await import('@/app/actions/auth');
    validatePin = mod.validatePin;
  });

  it('returns success for correct PIN', async () => {
    const result = await validatePin('1917');
    expect(result.success).toBe(true);
  });

  it('returns failure for wrong PIN', async () => {
    const result = await validatePin('0000');
    expect(result.success).toBe(false);
  });

  it('returns failure for PIN shorter than 4 digits', async () => {
    const result = await validatePin('191');
    expect(result.success).toBe(false);
  });

  it('returns failure for PIN longer than 4 digits', async () => {
    const result = await validatePin('19170');
    expect(result.success).toBe(false);
  });

  it('returns failure for PIN with letters', async () => {
    const result = await validatePin('abcd');
    expect(result.success).toBe(false);
  });

  it('returns failure for empty string', async () => {
    const result = await validatePin('');
    expect(result.success).toBe(false);
  });
});
