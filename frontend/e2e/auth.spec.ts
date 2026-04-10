import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /登录/i })).toBeVisible();
  });

  test('should show validation errors', async ({ page }) => {
    await page.goto('/login');
    
    // Click login without filling form
    await page.getByRole('button', { name: /登录/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/邮箱格式不正确/i)).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: /注册/i }).click();
    
    await expect(page).toHaveURL(/\/register/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill form
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder(/password/i).fill('test123');
    
    // Submit
    await page.getByRole('button', { name: /登录/i }).click();
    
    // Should redirect to notes page
    await expect(page).toHaveURL(/\/notes/, { timeout: 10000 });
  });
});

test.describe('Register Flow', () => {
  test('should show register page', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.getByPlaceholder(/昵称/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder('请输入密码')).toBeVisible();
    await expect(page.getByPlaceholder('再次输入密码')).toBeVisible();
  });

  test('should show password mismatch error', async ({ page }) => {
    await page.goto('/register');
    
    await page.getByPlaceholder(/昵称/i).fill('Test User');
    await page.getByPlaceholder(/email/i).fill('test@example.com');
    await page.getByPlaceholder('请输入密码').fill('password123');
    await page.getByPlaceholder('再次输入密码').fill('password456');
    
    await page.getByRole('button', { name: /注册/i }).click();
    
    await expect(page.getByText(/两次密码不一致/i)).toBeVisible();
  });
});