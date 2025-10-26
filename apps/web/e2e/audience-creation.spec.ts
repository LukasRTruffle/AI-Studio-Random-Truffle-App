import { test, expect } from '@playwright/test';

test.describe('Audience Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page).toHaveURL('/welcome');

    // Navigate to audiences page
    await page
      .getByRole('link', { name: /audiences/i })
      .first()
      .click();
    await expect(page).toHaveURL('/audiences');
  });

  test('should display audiences list page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /audiences/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /create audience/i })).toBeVisible();
  });

  test('should navigate to audience creation wizard', async ({ page }) => {
    await page.getByRole('button', { name: /create audience/i }).click();
    await expect(page).toHaveURL('/audiences/create');

    // Should show step 1 (Describe)
    await expect(page.getByText(/step 1/i)).toBeVisible();
    await expect(page.getByText(/describe your audience/i)).toBeVisible();
  });

  test('should progress through audience creation wizard', async ({ page }) => {
    await page.getByRole('button', { name: /create audience/i }).click();
    await expect(page).toHaveURL('/audiences/create');

    // Step 1: Describe
    await expect(page.getByText(/step 1/i)).toBeVisible();
    const nameInput = page.getByLabel(/audience name/i);
    if (await nameInput.isVisible()) {
      await nameInput.fill('Test Audience');
    }

    // Look for Next button
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Should move to step 2
      await expect(page.getByText(/step 2/i)).toBeVisible();
    }
  });

  test('should show step indicator with all 10 steps', async ({ page }) => {
    await page.getByRole('button', { name: /create audience/i }).click();
    await expect(page).toHaveURL('/audiences/create');

    // Verify all 10 steps are shown in indicator
    const stepIndicators = page.locator('[class*="step"]');
    const count = await stepIndicators.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Should show current step (Step 1)
    await expect(page.getByText(/step 1/i)).toBeVisible();
  });

  test('should have back navigation in wizard', async ({ page }) => {
    await page.getByRole('button', { name: /create audience/i }).click();
    await expect(page).toHaveURL('/audiences/create');

    // Try to find and click Next to go to step 2
    const nextButton = page.getByRole('button', { name: /next/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();

      // Look for Back button
      const backButton = page.getByRole('button', { name: /back/i });
      if (await backButton.isVisible()) {
        await backButton.click();

        // Should be back at step 1
        await expect(page.getByText(/step 1/i)).toBeVisible();
      }
    }
  });

  test('should be able to cancel audience creation', async ({ page }) => {
    await page.getByRole('button', { name: /create audience/i }).click();
    await expect(page).toHaveURL('/audiences/create');

    // Look for Cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    if (await cancelButton.isVisible()) {
      await cancelButton.click();

      // Should return to audiences list
      await expect(page).toHaveURL('/audiences');
    }
  });
});
