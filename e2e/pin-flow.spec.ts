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

    await expect(page.getByRole('alert').first()).toBeVisible();

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

  test('rate limit shows friendly message instead of generic error', async ({
    page,
  }) => {
    await page.goto('/');

    await page.locator('text=Continuar Offline').click();

    const inputs = page.locator('input[aria-label^="Dígito"]');
    const submitButton = page.locator('button[type="submit"]');
    const alert = page.getByRole('alert').first();

    // In E2E the limit is set to 5 attempts via RATE_LIMIT_MAX_ATTEMPTS.
    // Submit 4 invalid PINs to trigger the rate-limit message.
    for (let attempt = 0; attempt < 4; attempt++) {
      // IMPORTANT: fill BEFORE checking toBeEnabled.
      // After each failed attempt, LockScreen calls setPin('') which
      // clears the inputs and disables the button (disabled={!isPinValid(pin)}).
      // The button only becomes enabled again once all 4 digits are filled.
      for (let i = 0; i < 4; i++) {
        await inputs.nth(i).fill(String((attempt + i) % 10));
      }

      // Now wait for React to process the fills and enable the button
      await expect(submitButton).toBeEnabled({ timeout: 10000 });
      await submitButton.click();

      // After clicking, wait for the Server Action round-trip to complete
      // before advancing to the next attempt. The button text goes back to
      // "Entrar" (error displayed) — or alert appears on the last attempt.
      if (attempt < 3) {
        await expect(submitButton).not.toContainText('Validando...', {
          timeout: 10000,
        });
      }
    }

    await expect(alert).toBeVisible({ timeout: 10000 });
    await expect(alert).toContainText('Muitas tentativas');

    // Ensure the generic Next.js error boundary is not shown
    await expect(
      page.locator('text=An error occurred in the Server Components render'),
    ).not.toBeVisible();
  });
});
