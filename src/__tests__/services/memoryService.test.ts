import { describe, it, expect, vi } from 'vitest';

describe('memoryService', () => {
  it('returns validated memories from memories.json', async () => {
    const { memoryService } = await import('@/services/memoryService');
    const memories = await memoryService.getMemories();
    expect(Array.isArray(memories)).toBe(true);
    expect(memories.length).toBeGreaterThan(0);
  });

  it('each memory has required fields', async () => {
    const { memoryService } = await import('@/services/memoryService');
    const memories = await memoryService.getMemories();
    for (const m of memories) {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('title');
      expect(m).toHaveProperty('date');
      expect(m).toHaveProperty('coordinates');
      expect(m).toHaveProperty('isSpecialPin');
      expect(m).toHaveProperty('description');
      expect(m).toHaveProperty('images');
      expect(Array.isArray(m.images)).toBe(true);
    }
  });

  it('coordinate fields are valid numbers', async () => {
    const { memoryService } = await import('@/services/memoryService');
    const memories = await memoryService.getMemories();
    for (const m of memories) {
      expect(typeof m.coordinates.lat).toBe('number');
      expect(typeof m.coordinates.lng).toBe('number');
    }
  });

  it('date fields are in YYYY-MM-DD format', async () => {
    const { memoryService } = await import('@/services/memoryService');
    const memories = await memoryService.getMemories();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    for (const m of memories) {
      expect(m.date).toMatch(dateRegex);
    }
  });

  it('returns empty array on validation error', async () => {
    vi.doMock('@/data/memories.json', () => ({
      default: [{ id: 'bad', invalid: true }],
    }));

    const { memoryService } = await import('@/services/memoryService');
    const result = await memoryService.getMemories();
    expect(result).toEqual([]);
  });
});
