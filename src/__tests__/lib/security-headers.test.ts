import { describe, it, expect } from 'vitest';
import nextConfig from '../../../next.config';

describe('next.config headers()', () => {
  it('headers function is defined and is a function', () => {
    expect(nextConfig.headers).toBeDefined();
    expect(typeof nextConfig.headers).toBe('function');
  });

  it('includes X-Content-Type-Options: nosniff', async () => {
    const result = await nextConfig.headers!();
    const headers = result[0].headers;
    expect(headers).toEqual(
      expect.arrayContaining([
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ]),
    );
  });

  it('includes Referrer-Policy: strict-origin-when-cross-origin', async () => {
    const result = await nextConfig.headers!();
    const headers = result[0].headers;
    expect(headers).toEqual(
      expect.arrayContaining([
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ]),
    );
  });

  it('includes X-Frame-Options: DENY', async () => {
    const result = await nextConfig.headers!();
    const headers = result[0].headers;
    expect(headers).toEqual(
      expect.arrayContaining([{ key: 'X-Frame-Options', value: 'DENY' }]),
    );
  });

  it('includes Permissions-Policy blocking camera, microphone, geolocation', async () => {
    const result = await nextConfig.headers!();
    const headers = result[0].headers;
    expect(headers).toEqual(
      expect.arrayContaining([
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ]),
    );
  });
});
