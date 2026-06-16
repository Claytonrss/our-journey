import { test, expect } from '@playwright/test';
import { mockMapboxToken } from './fixtures/api-mocks';

const VALID_PIN = process.env.SECRET_PIN || '1234';

test.describe('Timeline Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Mapbox token so the brief /map landing doesn't error
    await mockMapboxToken(page);

    // Navigate to lock screen first, then set sessionStorage so intro
    // screens are skipped (they require a fully loaded Mapbox map to
    // proceed, which can't render with a mocked token)
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.setItem('intro-seen', 'true');
      sessionStorage.setItem('headphones-seen', 'true');
    });
    const continueBtn = page.locator('text=Continuar Offline');
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await continueBtn.click();

    // Fill valid PIN — wait for each input to be visible first
    const inputs = page.locator('input[aria-label^="Dígito"]');
    await expect(inputs.first()).toBeVisible({ timeout: 10000 });
    for (let i = 0; i < 4; i++) {
      await inputs.nth(i).fill(VALID_PIN[i]);
    }

    // Wait until React has processed all fills (isPinValid) before clicking
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeEnabled({ timeout: 10000 });
    await submitBtn.click();

    // Wait for navigation to /map and view toggle to appear
    // 20 s timeout — CI servers can be slow on the validatePin Server Action
    await page.waitForURL('**/map', { timeout: 20000 });
    await expect(page.getByRole('button', { name: 'Mapa' })).toBeVisible({
      timeout: 15000,
    });

    // Navigate to timeline via ViewToggle (preserves Zustand isPinValidated)
    const timelineBtn = page
      .locator('button')
      .filter({ hasText: 'Linha do tempo' });
    await expect(timelineBtn).toBeVisible({ timeout: 10000 });
    await timelineBtn.click();
    await page.waitForURL('**/timeline', { timeout: 10000 });
  });

  test('renders memories grouped by year', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();

    // Timeline header should be visible
    await expect(page.getByText('Nossa história')).toBeVisible({
      timeout: 10000,
    });

    // Year dividers show years — check for the first year in the data
    await expect(page.getByText('2018').first()).toBeVisible({
      timeout: 10000,
    });

    // Memory cards should be rendered — they have ids like "memory-card-{id}"
    const firstCard = page.locator('[id^="memory-card-"]').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
  });

  test('year dividers mark each year section', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible();

    // YearDivider renders the year as a span with the 4-digit year number.
    // We match standalone 4-digit text nodes that correspond to years in
    // src/data/memories.json: 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026.
    const yearElements = page.getByText(/^\d{4}$/);
    const count = await yearElements.count();
    expect(count).toBeGreaterThan(0);

    // Should include at least the earliest year
    await expect(page.getByText('2018').first()).toBeVisible({
      timeout: 10000,
    });
  });

  test('can navigate back to map from timeline', async ({ page }) => {
    // Click the "Mapa" button in the ViewToggle.
    // Use exact matching to avoid hitting the 38+ "Ver no mapa" memory card buttons.
    const mapaBtn = page.locator('button').filter({ hasText: /^Mapa$/ });
    await expect(mapaBtn).toBeVisible({ timeout: 10000 });
    await mapaBtn.click();

    // Should navigate back to /map
    await page.waitForURL('**/map', { timeout: 10000 });
    await expect(page).toHaveURL(/\/map/);
  });
});
