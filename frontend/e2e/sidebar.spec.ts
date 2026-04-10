import { test, expect } from '@playwright/test';

async function login(page: any) {
  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill('test@example.com');
  await page.getByPlaceholder(/password/i).fill('test123');
  await page.getByRole('button', { name: /登录/i }).click();
  await expect(page).toHaveURL(/\/notes/, { timeout: 10000 });
}

test.describe('Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should show folders section', async ({ page }) => {
    await expect(page.getByText(/文件夹/i)).toBeVisible();
  });

  test('should show tags section', async ({ page }) => {
    await expect(page.getByText(/标签/i)).toBeVisible();
  });

  test('should show create folder button', async ({ page }) => {
    const folderSection = page.locator('aside').getByRole('button', { name: /\+/i }).first();
    await expect(folderSection).toBeVisible();
  });

  test('should create new folder', async ({ page }) => {
    // Click new folder button
    await page.locator('aside').getByRole('button', { name: /\+/i }).first().click();
    
    // Should show dialog
    await expect(page.getByPlaceholder(/文件夹名称/i)).toBeVisible();
    
    // Fill name and submit
    await page.getByPlaceholder(/文件夹名称/i).fill('Test Folder');
    await page.getByRole('button', { name: /创建/i }).click();
    
    // Should show new folder
    await expect(page.getByText('Test Folder')).toBeVisible();
  });

  test('should create new tag', async ({ page }) => {
    // Click new tag button (second + button)
    const buttons = page.locator('aside').getByRole('button', { name: /\+/i });
    await buttons.nth(1).click();
    
    // Should show dialog
    await expect(page.getByPlaceholder(/标签名称/i)).toBeVisible();
    
    // Fill name
    await page.getByPlaceholder(/标签名称/i).fill('Test Tag');
    
    // Select color
    await page.locator('button[style*="background-color"]').first().click();
    
    // Submit
    await page.getByRole('button', { name: /创建/i }).click();
    
    // Should show new tag
    await expect(page.getByText('Test Tag')).toBeVisible();
  });

  test('should navigate to trash', async ({ page }) => {
    await page.getByText(/回收站/i).click();
    
    await expect(page).toHaveURL(/trash=true/);
  });
});