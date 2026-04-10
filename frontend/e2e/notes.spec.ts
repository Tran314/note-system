import { test, expect } from '@playwright/test';

// Helper to login
async function login(page: any) {
  await page.goto('/login');
  await page.getByPlaceholder(/email/i).fill('test@example.com');
  await page.getByPlaceholder(/password/i).fill('test123');
  await page.getByRole('button', { name: /登录/i }).click();
  await expect(page).toHaveURL(/\/notes/, { timeout: 10000 });
}

test.describe('Notes Management', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display notes list page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /笔记/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /新建笔记/i })).toBeVisible();
  });

  test('should create a new note', async ({ page }) => {
    // Click new note button
    await page.getByRole('button', { name: /新建笔记/i }).click();
    
    // Should navigate to editor
    await expect(page).toHaveURL(/\/notes\/new/);
    
    // Fill note title
    const titleInput = page.getByPlaceholder(/标题/i);
    await titleInput.fill('Test Note Title');
    
    // Type in editor
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('This is the note content.');
    
    // Save
    await page.getByRole('button', { name: /保存/i }).click();
    
    // Should show saved indicator
    await expect(page.getByText(/已保存/i)).toBeVisible({ timeout: 5000 });
  });

  test('should search notes', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/搜索/i);
    
    await searchInput.fill('test');
    
    // Should filter notes (if any exist)
    await page.waitForTimeout(500); // Wait for debounce
  });

  test('should toggle view mode', async ({ page }) => {
    // Find view toggle buttons
    const listButton = page.getByRole('button', { name: /列表/i });
    const gridButton = page.getByRole('button', { name: /网格/i });
    
    // Switch to grid view
    await gridButton.click();
    
    // Switch back to list view
    await listButton.click();
  });
});

test.describe('Note Editor', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: /新建笔记/i }).click();
  });

  test('should show editor toolbar', async ({ page }) => {
    // Check toolbar buttons exist
    await expect(page.getByRole('button', { name: /加粗/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /斜体/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /链接/i })).toBeVisible();
  });

  test('should format text', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('Test content');
    
    // Select all text
    await page.keyboard.press('Control+A');
    
    // Click bold button
    await page.getByRole('button', { name: /加粗/i }).click();
    
    // Text should be bold
    await expect(page.locator('strong')).toContainText('Test content');
  });

  test('should add link', async ({ page }) => {
    const editor = page.locator('.ProseMirror');
    await editor.click();
    await editor.fill('Click here');
    
    await page.keyboard.press('Control+A');
    await page.getByRole('button', { name: /链接/i }).click();
    
    // Should show link dialog
    await expect(page.getByPlaceholder(/https:\/\//i)).toBeVisible();
    
    await page.getByPlaceholder(/https:\/\//i).fill('https://example.com');
    await page.getByRole('button', { name: /添加/i }).click();
    
    // Should create link
    await expect(page.locator('a[href="https://example.com"]')).toBeVisible();
  });

  test('should show unsaved indicator when content changes', async ({ page }) => {
    const titleInput = page.getByPlaceholder(/标题/i);
    await titleInput.fill('New Title');
    
    // Should show unsaved indicator
    await expect(page.getByText(/未保存/i)).toBeVisible();
  });
});