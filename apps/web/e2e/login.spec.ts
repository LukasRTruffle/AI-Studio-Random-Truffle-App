import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');

    // Check for login form elements
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form
    await page.getByRole('button', { name: /log in/i }).click();

    // Should still be on login page (not redirected)
    await expect(page).toHaveURL('/login');
  });

  test('should login with valid credentials (placeholder auth)', async ({ page }) => {
    await page.goto('/login');

    // Fill in login form
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');

    // Submit form
    await page.getByRole('button', { name: /log in/i }).click();

    // Should redirect to welcome page
    await expect(page).toHaveURL('/welcome');

    // Should see user name
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should redirect to login when accessing protected route unauthenticated', async ({
    page,
  }) => {
    await page.goto('/audiences');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page).toHaveURL('/welcome');

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();

    // Should redirect to login
    await expect(page).toHaveURL('/login');

    // Should not be able to access protected route
    await page.goto('/welcome');
    await expect(page).toHaveURL('/login');
  });
});
