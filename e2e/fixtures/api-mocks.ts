import type { Page } from '@playwright/test';

/**
 * Intercepts /api/mapbox-token and returns a mock token.
 * Must be called before navigating to pages that use Mapbox.
 */
export async function mockMapboxToken(page: Page): Promise<void> {
  await page.route('**/api/mapbox-token', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'pk.mocked-mapbox-token' }),
    });
  });
}

/**
 * Makes /api/mapbox-token return a failure response.
 */
export async function failMapboxToken(page: Page): Promise<void> {
  await page.route('**/api/mapbox-token', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Token unavailable' }),
    });
  });
}

/**
 * Intercepts /api/spotify-token and returns a mock token.
 */
export async function mockSpotifyToken(page: Page): Promise<void> {
  await page.route('**/api/spotify-token', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'mock-spotify-token' }),
    });
  });
}

/**
 * Blocks the Spotify Web Playback SDK from loading.
 * Use this for tests that expect local audio fallback.
 */
export async function blockSpotifySDK(page: Page): Promise<void> {
  await page.route('**/sdk.scdn.co/**', (route) => route.abort());
}
