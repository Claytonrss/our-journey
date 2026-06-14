import type { Memory } from '@/types';

export function sortMemoriesByDate(memories: Memory[]): Memory[] {
  return [...memories].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function groupMemoriesByYear(memories: Memory[]): Map<number, Memory[]> {
  const yearGroups = new Map<number, Memory[]>();
  const sorted = sortMemoriesByDate(memories);

  sorted.forEach((memory) => {
    const year = new Date(memory.date).getFullYear();
    if (!yearGroups.has(year)) {
      yearGroups.set(year, []);
    }
    yearGroups.get(year)!.push(memory);
  });

  return yearGroups;
}

export function calculateMemoryStats(memories: Memory[]): {
  minYear: number;
  maxYear: number;
  yearSpan: number;
  totalPhotos: number;
} {
  if (memories.length === 0) {
    return { minYear: 0, maxYear: 0, yearSpan: 0, totalPhotos: 0 };
  }

  const years = memories.map((m) => new Date(m.date).getFullYear());
  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const yearSpan = maxYear - minYear + 1;
  const totalPhotos = memories.reduce((acc, m) => acc + m.images.length, 0);

  return { minYear, maxYear, yearSpan, totalPhotos };
}
