import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Fills the 4-digit PIN on the lock screen and submits.
 * Assumes the page is on the lock screen and PIN inputs are visible.
 *
 * Waits for each input to be visible and for the submit button to be
 * enabled before clicking — guards against the race condition where
 * Playwright's fill() hasn't yet propagated to React state (isPinValid).
 */
export async function authenticateViaPin(
  page: Page,
  pin: string,
): Promise<void> {
  for (let i = 0; i < 4; i++) {
    const input = page.locator(`input[aria-label="Dígito ${i + 1} de 4"]`);
    await expect(input).toBeVisible({ timeout: 10_000 });
    await input.fill(pin[i]);
  }

  const submitBtn = page.locator('button[type="submit"]');
  // Wait until React state has updated isPinValid → button becomes enabled
  await expect(submitBtn).toBeEnabled({ timeout: 10_000 });
  await submitBtn.click();

  // Increased to 20 s — CI servers can be slow on the validatePin Server Action
  await page.waitForURL('**/map', { timeout: 20_000 });
}
