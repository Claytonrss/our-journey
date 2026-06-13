import { describe, it, expect } from 'vitest';

describe('env module', () => {
  describe('getPinEnv()', () => {
    it('validates a 4-digit PIN', async () => {
      process.env.SECRET_PIN = '1234';
      const { getPinEnv } = await import('@/lib/env');
      const env = getPinEnv();
      expect(env.SECRET_PIN).toBe('1234');
    });

    it('rejects non-4-digit PINs', async () => {
      process.env.SECRET_PIN = '123';
      const { getPinEnv } = await import('@/lib/env');
      expect(() => getPinEnv()).toThrow();
    });

    it('rejects PIN with letters', async () => {
      process.env.SECRET_PIN = 'abcd';
      const { getPinEnv } = await import('@/lib/env');
      expect(() => getPinEnv()).toThrow();
    });

    it('rejects empty PIN', async () => {
      delete process.env.SECRET_PIN;
      const { getPinEnv } = await import('@/lib/env');
      expect(() => getPinEnv()).toThrow();
    });
  });

  describe('getAuthEnv()', () => {
    it('validates required auth env vars', async () => {
      process.env.NODE_ENV = 'development';
      process.env.AUTH_SECRET = 'test-secret';
      process.env.AUTH_URL = 'http://127.0.0.1:3000';
      process.env.SPOTIFY_CLIENT_ID = 'test-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-secret';
      delete process.env.NEXTAUTH_URL;

      const { getAuthEnv } = await import('@/lib/env');
      const env = getAuthEnv();
      expect(env.AUTH_SECRET).toBe('test-secret');
      expect(env.SPOTIFY_CLIENT_ID).toBe('test-id');
    });

    it('requires AUTH_URL or NEXTAUTH_URL in production', async () => {
      process.env.NODE_ENV = 'production';
      process.env.AUTH_SECRET = 'test-secret';
      process.env.SPOTIFY_CLIENT_ID = 'test-id';
      process.env.SPOTIFY_CLIENT_SECRET = 'test-secret';
      delete process.env.AUTH_URL;
      delete process.env.NEXTAUTH_URL;

      const { getAuthEnv } = await import('@/lib/env');
      expect(() => getAuthEnv()).toThrow();
    });
  });

  describe('getMapboxEnv()', () => {
    it('validates MAPBOX_TOKEN', async () => {
      process.env.MAPBOX_TOKEN = 'pk.test-token';
      const { getMapboxEnv } = await import('@/lib/env');
      const env = getMapboxEnv();
      expect(env.MAPBOX_TOKEN).toBe('pk.test-token');
    });
  });

  describe('getCanonicalAuthUrl()', () => {
    it('normalizes localhost to 127.0.0.1 in development', async () => {
      process.env.NODE_ENV = 'development';
      process.env.AUTH_SECRET = 'test';
      process.env.AUTH_URL = 'http://localhost:3000';
      process.env.SPOTIFY_CLIENT_ID = 'id';
      process.env.SPOTIFY_CLIENT_SECRET = 'secret';
      delete process.env.NEXTAUTH_URL;

      const { getCanonicalAuthUrl, getAuthEnv } = await import('@/lib/env');
      const env = getAuthEnv();
      const url = getCanonicalAuthUrl(env);
      expect(url).toContain('127.0.0.1');
      expect(url).not.toContain('localhost');
    });

    it('keeps URL as-is in production with non-localhost', async () => {
      process.env.NODE_ENV = 'production';
      process.env.AUTH_SECRET = 'test';
      process.env.AUTH_URL = 'https://example.com';
      process.env.SPOTIFY_CLIENT_ID = 'id';
      process.env.SPOTIFY_CLIENT_SECRET = 'secret';
      delete process.env.NEXTAUTH_URL;

      const { getCanonicalAuthUrl, getAuthEnv } = await import('@/lib/env');
      const env = getAuthEnv();
      const url = getCanonicalAuthUrl(env);
      expect(url).toBe('https://example.com');
    });

    it('strips trailing slash', async () => {
      process.env.NODE_ENV = 'development';
      process.env.AUTH_SECRET = 'test';
      process.env.AUTH_URL = 'http://127.0.0.1:3000/';
      process.env.SPOTIFY_CLIENT_ID = 'id';
      process.env.SPOTIFY_CLIENT_SECRET = 'secret';
      delete process.env.NEXTAUTH_URL;

      const { getCanonicalAuthUrl, getAuthEnv } = await import('@/lib/env');
      const env = getAuthEnv();
      const url = getCanonicalAuthUrl(env);
      expect(url.endsWith('/')).toBe(false);
    });
  });
});
