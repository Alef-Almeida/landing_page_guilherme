// IMP-613 — FAQ com <details>/<summary>: abre e fecha por clique e por teclado.
const { test, expect } = require('@playwright/test');

test('perguntas abrem e fecham por clique e por teclado', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('#faq');
  const items = faq.locator('details');
  await expect(items).toHaveCount(3);
  for (const item of await items.all()) await expect(item).not.toHaveAttribute('open', '');

  const first = items.nth(0);
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
  await expect(first.locator('p')).toBeVisible();
  await first.locator('summary').click();
  await expect(first).not.toHaveAttribute('open', '');

  const second = items.nth(1);
  await second.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(second).toHaveAttribute('open', '');
  await page.keyboard.press('Space');
  await expect(second).not.toHaveAttribute('open', '');
});
