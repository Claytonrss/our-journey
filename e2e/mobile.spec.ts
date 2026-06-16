import { test, expect } from '@playwright/test';
import { mockMapboxToken } from './fixtures/api-mocks';
import { resetRateLimit } from './fixtures/auth';

const VALID_PIN = process.env.SECRET_PIN || '1234';

test.describe('Mobile Viewport — Lock Screen', () => {
  test.describe.configure({ mode: 'serial' });

  test('lock screen renders on mobile viewport', async ({ page }) => {
    await page.goto('/');

    // App title should be visible
    await expect(page.locator('text=Our Journey')).toBeVisible({
      timeout: 10000,
    });

    // PIN input area should be accessible on mobile
    await page.locator('text=Continuar Offline').click();
    await expect(
      page.locator('input[aria-label="Dígito 1 de 4"]'),
    ).toBeVisible();

    // PIN inputs should fit within viewport
    const inputs = page.locator('input[aria-label^="Dígito"]');
    await expect(inputs).toHaveCount(4);

    // All inputs should be visible (not offscreen)
    for (let i = 0; i < 4; i++) {
      await expect(inputs.nth(i)).toBeInViewport();
    }
  });
});

test.describe('Mobile Viewport — Authenticated', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await resetRateLimit(page);
    await page.waitForTimeout(100);
    await mockMapboxToken(page);

    await page.goto('/');

    // Set sessionStorage so the map page skips intro screens.
    // The intro screens require a fully loaded Mapbox map to proceed,
    // which cannot render with a mocked token.
    await page.evaluate(() => {
      sessionStorage.setItem('intro-seen', 'true');
      sessionStorage.setItem('headphones-seen', 'true');
    });

    // Click through lock screen
    const continueBtn = page.locator('text=Continuar Offline');
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await continueBtn.click();

    // Fill valid PIN
    const inputs = page.locator('input[aria-label^="Dígito"]');
    for (let i = 0; i < 4; i++) {
      await inputs.nth(i).fill(VALID_PIN[i]);
    }
    await page.locator('button[type="submit"]').click();

    // Wait for navigation to /map
    await page.waitForURL('**/map', { timeout: 30000 });

    // Wait for the map page to fully render
    await expect(page.getByRole('button', { name: 'Mapa' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('audio player is accessible on mobile', async ({ page }) => {
    // AudioPlayer renders a play/pause button whose aria-label varies
    // depending on playback state ("Reproduzir" when paused, "Pausar" when playing)
    const playPauseBtn = page.locator(
      'button[aria-label="Reproduzir"], button[aria-label="Pausar"]',
    );
    await expect(playPauseBtn).toBeInViewport();
  });

  test('view toggle is accessible on mobile', async ({ page }) => {
    const mapaBtn = page.locator('button').filter({ hasText: /^Mapa$/ });
    const timelineBtn = page
      .locator('button')
      .filter({ hasText: /^Linha do tempo$/ });

    await expect(mapaBtn).toBeInViewport();
    await expect(timelineBtn).toBeInViewport();
  });
});
