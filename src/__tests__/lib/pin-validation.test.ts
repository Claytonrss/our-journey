import { describe, it, expect, vi } from 'vitest';
import {
  getPinErrorMessage,
  isPinValid,
  buildPinFromDigits,
  PIN_PATTERNS,
  RANDOM_ERRORS,
} from '@/lib/pin-validation';

describe('isPinValid()', () => {
  it('returns true for exactly 4 numeric digits', () => {
    expect(isPinValid('1234')).toBe(true);
  });

  it('returns true for 0000', () => {
    expect(isPinValid('0000')).toBe(true);
  });

  it('returns true for 9999', () => {
    expect(isPinValid('9999')).toBe(true);
  });

  it('returns false for less than 4 digits', () => {
    expect(isPinValid('123')).toBe(false);
  });

  it('returns false for more than 4 digits', () => {
    expect(isPinValid('12345')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isPinValid('')).toBe(false);
  });

  it('returns false for non-numeric characters', () => {
    expect(isPinValid('12a4')).toBe(false);
  });

  it('returns false for letters only', () => {
    expect(isPinValid('abcd')).toBe(false);
  });

  it('returns false for alphanumeric mix', () => {
    expect(isPinValid('1b3d')).toBe(false);
  });
});

describe('buildPinFromDigits()', () => {
  it('sets the first digit', () => {
    expect(buildPinFromDigits('', 0, '5')).toBe('5');
  });

  it('replaces a digit at given index', () => {
    expect(buildPinFromDigits('123', 0, '9')).toBe('923');
    expect(buildPinFromDigits('123', 1, '9')).toBe('193');
    expect(buildPinFromDigits('123', 2, '9')).toBe('129');
  });

  it('appends a new digit at the end', () => {
    expect(buildPinFromDigits('12', 2, '3')).toBe('123');
    expect(buildPinFromDigits('', 0, '1')).toBe('1');
  });

  it('caps the result at 4 characters', () => {
    expect(buildPinFromDigits('1234', 3, '5')).toBe('1235');
    expect(buildPinFromDigits('1234', 0, '5')).toBe('5234');
  });

  it('handles index beyond current length by filling with empty strings', () => {
    const result = buildPinFromDigits('1', 2, '3');
    expect(result).toBe('13');
    expect(result.length).toBeLessThanOrEqual(4);
  });

  it('returns empty string when building from empty pin at index 0 with empty value', () => {
    const result = buildPinFromDigits('', 0, '');
    expect(result).toBe('');
  });
});

describe('PIN_PATTERNS', () => {
  it('contains expected pattern entries', () => {
    expect(PIN_PATTERNS.length).toBeGreaterThanOrEqual(5);
  });

  it('each pattern has a regex and message', () => {
    for (const pattern of PIN_PATTERNS) {
      expect(pattern.regex).toBeInstanceOf(RegExp);
      expect(typeof pattern.message).toBe('string');
      expect(pattern.message.length).toBeGreaterThan(0);
    }
  });
});

describe('RANDOM_ERRORS', () => {
  it('contains multiple fallback error messages', () => {
    expect(RANDOM_ERRORS.length).toBeGreaterThanOrEqual(1);
  });

  it('all entries are non-empty strings', () => {
    for (const msg of RANDOM_ERRORS) {
      expect(typeof msg).toBe('string');
      expect(msg.length).toBeGreaterThan(0);
    }
  });
});

describe('getPinErrorMessage()', () => {
  it('returns the matching pattern message when pin matches a pattern', () => {
    const pin = '1115';
    const msg = getPinErrorMessage(pin, PIN_PATTERNS);
    expect(msg).toBe('Erro :( É uma data mais específica.');
  });

  it('matches the 1919 pattern', () => {
    const msg = getPinErrorMessage('1919', PIN_PATTERNS);
    expect(msg).toBe('Errado! Sabia que você ia tentar a padrão.');
  });

  it('matches the 0XX9 pattern', () => {
    const msg = getPinErrorMessage('0129', PIN_PATTERNS);
    expect(msg).toBe('Errou! Não é o aniversário de uma pessoa.');
  });

  it('matches the 0XX0 pattern', () => {
    const msg = getPinErrorMessage('0120', PIN_PATTERNS);
    expect(msg).toBe('Nops... Tente de novo.');
  });

  it('matches the common pins pattern', () => {
    expect(getPinErrorMessage('1111', PIN_PATTERNS)).toBe(
      'Sério? Essa é a primeira que todo mundo tenta.',
    );
    expect(getPinErrorMessage('1234', PIN_PATTERNS)).toBe(
      'Sério? Essa é a primeira que todo mundo tenta.',
    );
    expect(getPinErrorMessage('1212', PIN_PATTERNS)).toBe(
      'Sério? Essa é a primeira que todo mundo tenta.',
    );
    expect(getPinErrorMessage('2020', PIN_PATTERNS)).toBe(
      'Sério? Essa é a primeira que todo mundo tenta.',
    );
    expect(getPinErrorMessage('2026', PIN_PATTERNS)).toBe(
      'Sério? Essa é a primeira que todo mundo tenta.',
    );
  });

  it('0000 matches the 0XX0 pattern first (pattern ordering matters)', () => {
    expect(getPinErrorMessage('0000', PIN_PATTERNS)).toBe(
      'Nops... Tente de novo.',
    );
  });

  it('returns a random message from RANDOM_ERRORS when no pattern matches', () => {
    const msg = getPinErrorMessage('5555', PIN_PATTERNS);
    expect(RANDOM_ERRORS).toContain(msg);
  });

  it('uses Math.random to pick fallback messages', () => {
    const mockRandom = vi.spyOn(Math, 'random');
    mockRandom.mockReturnValue(0);
    const msg = getPinErrorMessage('5555', PIN_PATTERNS);
    expect(RANDOM_ERRORS).toContain(msg);
    mockRandom.mockRestore();
  });

  it('returns a fallback from a custom patterns array', () => {
    const customPatterns = [{ regex: /^1111$/, message: 'Nope' }];
    const msg = getPinErrorMessage('2222', customPatterns);
    expect(RANDOM_ERRORS).toContain(msg);
  });

  it('returns the custom message when pin matches custom pattern', () => {
    const customPatterns = [{ regex: /^4242$/, message: 'The answer' }];
    expect(getPinErrorMessage('4242', customPatterns)).toBe('The answer');
  });
});
