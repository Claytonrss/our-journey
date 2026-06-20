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
  yearSpan: number;
  totalPhotos: number;
} {
  if (memories.length === 0) {
    return { yearSpan: 0, totalPhotos: 0 };
  }

  const years = memories.map((m) => new Date(m.date).getFullYear());
  const yearSpan = Math.max(...years) - Math.min(...years) + 1;
  const totalPhotos = memories.reduce((acc, m) => acc + m.images.length, 0);

  return { yearSpan, totalPhotos };
}
