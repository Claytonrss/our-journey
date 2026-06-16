import { describe, it, expect } from 'vitest';

describe('GET /api/health', () => {
  it('returns health status with timestamp and version', async () => {
    const { GET } = await import('@/app/api/health/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.version).toBe('1.0.0');
    expect(data.timestamp).toBeDefined();
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });
});
