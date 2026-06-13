import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('publicEnv', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  it('exposes the NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI', async () => {
    process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI = 'spotify:playlist:abc123';
    const { publicEnv } = await import('@/lib/publicEnv');
    expect(publicEnv.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI).toBe(
      'spotify:playlist:abc123',
    );
  });

  it('returns undefined when env var is not set', async () => {
    delete process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI;
    const { publicEnv } = await import('@/lib/publicEnv');
    expect(publicEnv.NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI).toBeUndefined();
  });
});
