import { test, expect } from '@playwright/test';

test('homepage has title and welcome message', async ({ page }) => {
  await page.goto('http://localhost:12000');
  await expect(page).toHaveTitle(/BioWallet/);
  await expect(page.getByText('Welcome to')).toBeVisible();
  await expect(page.getByText('BioWallet').nth(1)).toBeVisible();
});

test('navigation to register page', async ({ page }) => {
  await page.goto('http://localhost:12000');
  await page.getByRole('button', { name: 'Register' }).first().click();
  await expect(page).toHaveURL(/.*register/);
  await expect(page.getByText('Register BioWallet')).toBeVisible();
});

test('navigation to login page', async ({ page }) => {
  await page.goto('http://localhost:12000');
  await page.getByRole('button', { name: 'Login' }).first().click();
  await expect(page).toHaveURL(/.*login/);
  await expect(page.getByText('Login with Biometrics')).toBeVisible();
});
