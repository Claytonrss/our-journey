import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn()', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('deduplicates Tailwind conflicting classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });

  it('handles responsive classes', () => {
    expect(cn('text-sm', 'md:text-lg')).toBe('text-sm md:text-lg');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('merges arrays of classes', () => {
    expect(cn(['foo', 'bar'], 'baz')).toBe('foo bar baz');
  });
});
