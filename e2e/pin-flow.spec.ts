import { test, expect } from '@playwright/test';

test.describe('PIN Flow', () => {
  const VALID_PIN = process.env.SECRET_PIN || '1234';

  test('lock screen renders with PIN input fields', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('text=Our Journey')).toBeVisible();

    await page.locator('text=Continuar Offline').click();

    await expect(
      page.locator('input[aria-label="Dígito 1 de 4"]'),
    ).toBeVisible();
  });

  test('invalid PIN shows error message and does not navigate', async ({
    page,
  }) => {
    await page.goto('/');

    await page.locator('text=Continuar Offline').click();

    const inputs = page.locator('input[aria-label^="Dígito"]');
    for (let i = 0; i < 4; i++) {
      await inputs.nth(i).fill('0');
    }
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('[role="alert"]')).toBeVisible();

    expect(page.url()).not.toContain('/map');
  });

  test('valid PIN navigates to /map', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Continuar Offline').click();

    const inputs = page.locator('input[aria-label^="Dígito"]');
    for (let i = 0; i < 4; i++) {
      await inputs.nth(i).fill(VALID_PIN[i]);
    }
    await page.locator('button[type="submit"]').click();

    await page.waitForURL('**/map');

    await expect(page).toHaveURL(/\/map/);
  });

  test('non-numeric characters are rejected in PIN input', async ({ page }) => {
    await page.goto('/');

    await page.locator('text=Continuar Offline').click();

    const firstInput = page.locator('input[aria-label="Dígito 1 de 4"]');
    await firstInput.fill('a');

    await expect(firstInput).toHaveValue('');
  });
});
