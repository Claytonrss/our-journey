import { describe, it, expect } from 'vitest';
import {
  sortMemoriesByDate,
  groupMemoriesByYear,
  calculateMemoryStats,
} from '@/lib/memory-grouping';
import type { Memory } from '@/types';

function makeMemory(id: string, date: string, imageCount = 1): Memory {
  return {
    id,
    title: `Memory ${id}`,
    date,
    coordinates: { lat: 0, lng: 0 },
    isSpecialPin: false,
    description: 'Description',
    images: Array.from({ length: imageCount }, (_, i) => ({
      publicId: `img-${id}-${i}`,
      alt: 'alt',
      width: 100,
      height: 100,
    })),
  };
}

describe('sortMemoriesByDate()', () => {
  it('sorts memories ascending by date (oldest first)', () => {
    const memories: Memory[] = [
      makeMemory('3', '2023-06-15'),
      makeMemory('1', '2021-01-01'),
      makeMemory('2', '2022-12-31'),
    ];

    const sorted = sortMemoriesByDate(memories);

    expect(sorted.map((m) => m.id)).toEqual(['1', '2', '3']);
  });

  it('returns a new array without mutating the input', () => {
    const memories: Memory[] = [
      makeMemory('2', '2022-05-10'),
      makeMemory('1', '2021-03-20'),
    ];

    const sorted = sortMemoriesByDate(memories);

    expect(sorted).not.toBe(memories);
    expect(memories[0].id).toBe('2');
    expect(memories[1].id).toBe('1');
  });

  it('returns empty array for empty input', () => {
    expect(sortMemoriesByDate([])).toEqual([]);
  });

  it('keeps already sorted array unchanged', () => {
    const memories: Memory[] = [
      makeMemory('1', '2020-01-01'),
      makeMemory('2', '2021-01-01'),
      makeMemory('3', '2022-01-01'),
    ];

    const sorted = sortMemoriesByDate(memories);

    expect(sorted.map((m) => m.id)).toEqual(['1', '2', '3']);
  });

  it('sorts same-date memories in stable order', () => {
    const memories: Memory[] = [
      makeMemory('b', '2022-01-01'),
      makeMemory('a', '2022-01-01'),
    ];

    const sorted = sortMemoriesByDate(memories);

    expect(sorted[0].date).toBe('2022-01-01');
    expect(sorted[1].date).toBe('2022-01-01');
  });
});

describe('groupMemoriesByYear()', () => {
  it('groups memories by year', () => {
    const memories: Memory[] = [
      makeMemory('1', '2021-03-15'),
      makeMemory('2', '2022-06-20'),
      makeMemory('3', '2021-08-10'),
    ];

    const groups = groupMemoriesByYear(memories);

    expect(groups.get(2021)?.map((m) => m.id)).toEqual(['1', '3']);
    expect(groups.get(2022)?.map((m) => m.id)).toEqual(['2']);
  });

  it('sorts each group by date ascending', () => {
    const memories: Memory[] = [
      makeMemory('c', '2021-12-30'),
      makeMemory('a', '2021-01-05'),
      makeMemory('b', '2021-06-15'),
    ];

    const groups = groupMemoriesByYear(memories);

    expect(groups.get(2021)?.map((m) => m.id)).toEqual(['a', 'b', 'c']);
  });

  it('handles unsorted input correctly', () => {
    const memories: Memory[] = [
      makeMemory('3', '2023-06-15'),
      makeMemory('1', '2021-06-15'),
      makeMemory('2', '2022-06-15'),
    ];

    const groups = groupMemoriesByYear(memories);

    expect(groups.get(2021)?.map((m) => m.id)).toEqual(['1']);
    expect(groups.get(2022)?.map((m) => m.id)).toEqual(['2']);
    expect(groups.get(2023)?.map((m) => m.id)).toEqual(['3']);
  });

  it('returns empty Map for empty input', () => {
    const groups = groupMemoriesByYear([]);
    expect(groups.size).toBe(0);
  });

  it('handles single memory', () => {
    const memories: Memory[] = [makeMemory('1', '2021-05-10')];

    const groups = groupMemoriesByYear(memories);

    expect(groups.size).toBe(1);
    expect(groups.get(2021)?.map((m) => m.id)).toEqual(['1']);
  });

  it('year keys are numbers not strings', () => {
    const memories: Memory[] = [makeMemory('1', '2021-05-10')];

    const groups = groupMemoriesByYear(memories);

    for (const year of groups.keys()) {
      expect(typeof year).toBe('number');
    }
  });
});

describe('calculateMemoryStats()', () => {
  it('calculates minYear, maxYear, yearSpan, and totalPhotos', () => {
    const memories: Memory[] = [
      makeMemory('1', '2020-03-01', 2),
      makeMemory('2', '2022-07-15', 3),
      makeMemory('3', '2021-11-20', 1),
    ];

    const stats = calculateMemoryStats(memories);

    expect(stats.minYear).toBe(2020);
    expect(stats.maxYear).toBe(2022);
    expect(stats.yearSpan).toBe(3);
    expect(stats.totalPhotos).toBe(6);
  });

  it('returns zeros for empty input', () => {
    const stats = calculateMemoryStats([]);

    expect(stats.minYear).toBe(0);
    expect(stats.maxYear).toBe(0);
    expect(stats.yearSpan).toBe(0);
    expect(stats.totalPhotos).toBe(0);
  });

  it('returns same min and max for single memory', () => {
    const memories: Memory[] = [makeMemory('1', '2021-06-01', 3)];

    const stats = calculateMemoryStats(memories);

    expect(stats.minYear).toBe(2021);
    expect(stats.maxYear).toBe(2021);
    expect(stats.yearSpan).toBe(1);
    expect(stats.totalPhotos).toBe(3);
  });

  it('totalPhotos sums all images across memories', () => {
    const memories: Memory[] = [
      makeMemory('1', '2021-01-01', 0),
      makeMemory('2', '2021-02-01', 5),
      makeMemory('3', '2021-03-01', 0),
    ];

    const stats = calculateMemoryStats(memories);

    expect(stats.totalPhotos).toBe(5);
  });

  it('yearSpan = maxYear - minYear + 1', () => {
    const memories: Memory[] = [
      makeMemory('1', '2018-06-01'),
      makeMemory('2', '2018-08-15'),
    ];

    const stats = calculateMemoryStats(memories);

    expect(stats.yearSpan).toBe(1);
  });
});
