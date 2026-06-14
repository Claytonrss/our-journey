import { describe, it, expect } from 'vitest';
import { getPrevIndex, getNextIndex } from '@/lib/navigation-utils';

describe('getPrevIndex()', () => {
  it('wraps to the last index when at the first', () => {
    expect(getPrevIndex(0, 5)).toBe(4);
  });

  it('returns the previous index for middle positions', () => {
    expect(getPrevIndex(3, 5)).toBe(2);
  });

  it('stays at 0 for a single-item collection', () => {
    expect(getPrevIndex(0, 1)).toBe(0);
  });
});

describe('getNextIndex()', () => {
  it('wraps to the first index when at the last', () => {
    expect(getNextIndex(4, 5)).toBe(0);
  });

  it('returns the next index for middle positions', () => {
    expect(getNextIndex(2, 5)).toBe(3);
  });

  it('stays at 0 for a single-item collection', () => {
    expect(getNextIndex(0, 1)).toBe(0);
  });
});
