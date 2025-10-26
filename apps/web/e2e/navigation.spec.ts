import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /log in/i }).click();
    await expect(page).toHaveURL('/welcome');
  });

  test('should navigate to Analytics page', async ({ page }) => {
    await page.getByRole('link', { name: /analytics/i }).click();
    await expect(page).toHaveURL('/analytics');
    await expect(page.getByRole('heading', { name: /analytics/i })).toBeVisible();
  });

  test('should navigate to Audiences page', async ({ page }) => {
    await page
      .getByRole('link', { name: /audiences/i })
      .first()
      .click();
    await expect(page).toHaveURL('/audiences');
    await expect(page.getByRole('heading', { name: /audiences/i })).toBeVisible();
  });

  test('should navigate to Activation page', async ({ page }) => {
    await page.getByRole('link', { name: /activation/i }).click();
    await expect(page).toHaveURL('/activation');
    await expect(page.getByRole('heading', { name: /activation/i })).toBeVisible();
  });

  test('should navigate to Setup page', async ({ page }) => {
    await page.getByRole('link', { name: /setup/i }).click();
    await expect(page).toHaveURL('/setup');
    await expect(page.getByRole('heading', { name: /setup/i })).toBeVisible();
  });

  test('should navigate to Admin page', async ({ page }) => {
    await page.getByRole('link', { name: /admin/i }).click();
    await expect(page).toHaveURL('/admin');
    await expect(page.getByRole('heading', { name: /admin/i })).toBeVisible();
  });

  test('should navigate to Profile page', async ({ page }) => {
    await page.getByRole('link', { name: /profile/i }).click();
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: /profile/i })).toBeVisible();
  });

  test('should have active state on current page', async ({ page }) => {
    await page.getByRole('link', { name: /analytics/i }).click();

    // Analytics link should have active styling
    const analyticsLink = page.getByRole('link', { name: /analytics/i });
    await expect(analyticsLink).toHaveClass(/bg-blue-100|text-blue-700/);
  });

  test('should display sidebar on all authenticated pages', async ({ page }) => {
    const pages = ['/welcome', '/analytics', '/audiences', '/activation', '/profile'];

    for (const url of pages) {
      await page.goto(url);
      await expect(page.getByRole('link', { name: /welcome/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /analytics/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
    }
  });
});
