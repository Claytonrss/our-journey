import { test, expect } from '@playwright/test';
import { mockMapboxToken } from './fixtures/api-mocks';

const VALID_PIN = process.env.SECRET_PIN || '1234';

test.describe('Lightbox Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockMapboxToken(page);

    await page.goto('/');

    await page.evaluate(() => {
      sessionStorage.setItem('intro-seen', 'true');
      sessionStorage.setItem('headphones-seen', 'true');
    });

    const continueBtn = page.locator('text=Continuar Offline');
    await expect(continueBtn).toBeVisible({ timeout: 15000 });
    await continueBtn.click();

    const inputs = page.locator('input[aria-label^="Dígito"]');
    for (let i = 0; i < 4; i++) {
      await inputs.nth(i).fill(VALID_PIN[i]);
    }
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/map', { timeout: 15000 });
    await expect(page.getByRole('button', { name: 'Mapa' })).toBeVisible({
      timeout: 15000,
    });
  });

  test('can navigate photos with keyboard arrows and close with Escape', async ({
    page,
  }) => {
    const timelineBtn = page
      .locator('button')
      .filter({ hasText: 'Linha do tempo' });
    await expect(timelineBtn).toBeVisible({ timeout: 10000 });
    await timelineBtn.click();
    await page.waitForURL('**/timeline', { timeout: 10000 });

    const firstPhoto = page.locator('img[alt]').first();
    await expect(firstPhoto).toBeVisible({ timeout: 10000 });
    await firstPhoto.click();

    const closeBtn = page.locator('button[aria-label="Fechar foto"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('ArrowRight');

    await page.keyboard.press('Escape');
    await expect(closeBtn).not.toBeVisible({ timeout: 5000 });
  });
});
