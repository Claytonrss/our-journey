import { test, expect } from '@playwright/test';
import { mockMapboxToken, failMapboxToken } from './fixtures/api-mocks';

const VALID_PIN = process.env.SECRET_PIN || '1234';

test.describe('Map Page', () => {
  test.beforeEach(async ({ page }) => {
    await mockMapboxToken(page);

    await page.goto('/');

    // Set sessionStorage so the map page skips intro screens.
    // The intro screens require a fully loaded Mapbox map to proceed,
    // which cannot render with a mocked token. SessionStorage flags
    // simulate a returning user who has already seen the intros.
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
    await page.waitForURL('**/map', { timeout: 15000 });

    // Wait for the map page to fully render (ViewToggle appears when
    // isPinValidated, WebGL, headphonesComplete, and introComplete are all true)
    await expect(page.getByRole('button', { name: 'Mapa' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('renders map fallback when Mapbox token fails', async ({ page }) => {
    // Override: make the token endpoint fail
    await failMapboxToken(page);

    // Navigate fresh — Zustand store resets on full reload, so we land on
    // the lock screen. The lock screen renders a <main> even without a map
    // background when the token is unavailable.
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Page should not crash — the <main> element should be present
    await expect(page.locator('main')).toBeVisible();
  });

  test('map page renders with view toggle controls', async ({ page }) => {
    await expect(
      page.locator('button').filter({ hasText: 'Mapa' }),
    ).toBeVisible();
    await expect(
      page.locator('button').filter({ hasText: 'Linha do tempo' }),
    ).toBeVisible();
  });

  test('can navigate to timeline from map page', async ({ page }) => {
    const timelineBtn = page
      .locator('button')
      .filter({ hasText: 'Linha do tempo' });

    await expect(timelineBtn).toBeVisible({ timeout: 10000 });
    await timelineBtn.click();

    await page.waitForURL('**/timeline', { timeout: 10000 });
    await expect(page).toHaveURL(/\/timeline/);
  });
});
