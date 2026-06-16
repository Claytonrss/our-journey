import { test, expect } from '@playwright/test';
import { resetRateLimit } from './fixtures/auth';

test.describe('PIN Rate Limit', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await resetRateLimit(page);
    await page.waitForTimeout(100);
  });

  test('rate limit shows friendly message instead of generic error', async ({
    page,
  }) => {
    await page.goto('/');

    await page.locator('text=Continuar Offline').click();

    const inputs = page.locator('input[aria-label^="Dígito"]');
    const submitButton = page.locator('button[type="submit"]');
    const alert = page.getByRole('alert').first();

    // Generate PINs that never match SECRET_PIN ('1234') or any PIN_PATTERNS entry.
    // Uses digits that avoid common patterns (0000, 1111, 1234, etc.)
    const generateBadPin = (n: number): string => {
      const base = 50 + (n % 50);
      return `${base}${base}${base}${base}`;
    };

    const MAX_ATTEMPTS = 100;

    // Submit invalid PINs until the rate-limit message appears.
    // The rate limit is configurable via RATE_LIMIT_MAX_ATTEMPTS (default 20).
    let rateLimitTriggered = false;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const pin = generateBadPin(attempt);

      for (let i = 0; i < 4; i++) {
        await inputs.nth(i).fill(pin[i]);
      }

      await expect(submitButton).toBeEnabled({ timeout: 10000 });
      await submitButton.click();

      await expect(inputs.first()).toHaveValue('', { timeout: 15000 });

      if (attempt >= 3) {
        const alertText = await alert.textContent().catch(() => '');
        if (alertText?.includes('Muitas tentativas')) {
          rateLimitTriggered = true;
          break;
        }
      }
    }

    expect(rateLimitTriggered).toBe(true);
    await expect(alert).toBeVisible({ timeout: 5000 });
    await expect(alert).toContainText('Muitas tentativas');

    await expect(
      page.locator('text=An error occurred in the Server Components render'),
    ).not.toBeVisible();
  });
});
