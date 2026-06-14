import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'pnpm run build && pnpm run start --hostname 127.0.0.1',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      SECRET_PIN: process.env.SECRET_PIN || '1234',
      AUTH_SECRET:
        process.env.AUTH_SECRET || 'e2e-test-secret-key-minimum-32-chars',
      AUTH_URL: 'http://127.0.0.1:3000',
      NEXTAUTH_URL: 'http://127.0.0.1:3000',
      SPOTIFY_CLIENT_ID: 'e2e-test-client-id',
      SPOTIFY_CLIENT_SECRET: 'e2e-test-client-secret',
      NEXT_PUBLIC_SPOTIFY_PLAYLIST_URI: 'spotify:playlist:e2e-test',
      MAPBOX_TOKEN: 'pk.e2e-test-token',
      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'demo',
      CLOUDINARY_CLOUD_NAME: 'demo',
      CLOUDINARY_API_KEY: 'e2e-test',
      CLOUDINARY_API_SECRET: 'e2e-test',
    },
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
  ],
});
