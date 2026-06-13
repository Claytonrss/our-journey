import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/env', () => ({
  getMapboxEnv: () => ({ MAPBOX_TOKEN: 'pk.test-mapbox-token' }),
}));

describe('GET /api/mapbox-token', () => {
  it('returns the Mapbox token', async () => {
    const { GET } = await import('@/app/api/mapbox-token/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.token).toBe('pk.test-mapbox-token');
  });
});
