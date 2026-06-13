import { describe, it, expect, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

describe('GET /api/spotify-token', () => {
  it('returns 401 when no session', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue(null);

    const { GET } = await import('@/app/api/spotify-token/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthenticated');
  });

  it('returns 401 when session has refresh error', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue({
      error: 'RefreshAccessTokenError',
    });

    const { GET } = await import('@/app/api/spotify-token/route');
    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('returns 401 when no access token in session', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue({});

    const { GET } = await import('@/app/api/spotify-token/route');
    const response = await GET();

    expect(response.status).toBe(401);
  });

  it('returns access token for valid session', async () => {
    const { auth } = await import('@/auth');
    vi.mocked(auth).mockResolvedValue({
      accessToken: 'test-token-123',
    });

    const { GET } = await import('@/app/api/spotify-token/route');
    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.accessToken).toBe('test-token-123');
  });
});
