import type { Page } from '@playwright/test';

/**
 * Fills the 4-digit PIN on the lock screen and submits.
 * Assumes the page is on the lock screen and PIN inputs are visible.
 */
export async function authenticateViaPin(
  page: Page,
  pin: string,
): Promise<void> {
  for (let i = 0; i < 4; i++) {
    const input = page.locator(`input[aria-label="Dígito ${i + 1} de 4"]`);
    await input.fill(pin[i]);
  }

  await page.locator('button[type="submit"]').click();

  await page.waitForURL('**/map');
}
