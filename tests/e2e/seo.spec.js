// IMP-503, IMP-505, IMP-507 e IMP-517 — metadados, compartilhamento, dados estruturados e rodapé.
const { test, expect } = require('@playwright/test');

test('título, descrição e compartilhamento estão definidos', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title.length).toBeGreaterThan(20);
  expect(title.length).toBeLessThanOrEqual(65);
  const meta = (selector) => page.locator(selector).getAttribute('content');
  const description = await meta('meta[name="description"]');
  expect(description.length).toBeGreaterThan(70);
  expect(description.length).toBeLessThanOrEqual(160);
  expect(await meta('meta[property="og:title"]')).toBe(title);
  expect(await meta('meta[property="og:description"]')).toBe(description);
  expect(await meta('meta[property="og:locale"]')).toBe('pt_BR');
  expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
  expect((await page.request.get('/assets/og-image.jpg')).status()).toBe(200);
});

test('dados estruturados são JSON válido e não fazem promessas', async ({ page }) => {
  await page.goto('/');
  const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(data['@type']).toBe('Person');
  expect(data.name).toBe('Guilherme dos Santos Teixeira');
  expect(data.hasCredential.name).toBe('CRP 03/36532');
  expect(JSON.stringify(data)).not.toMatch(/aggregateRating|review|offers|priceRange/i);
});

test('canonical e URLs absolutas só existem com domínio definido (DEC-04)', async ({ page }) => {
  await page.goto('/');
  const hasUrl = await page.evaluate(() => Boolean(window.SITE_CONFIG.site.url));
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(hasUrl ? 1 : 0);
  await expect(page.locator('meta[property="og:url"]')).toHaveCount(hasUrl ? 1 : 0);
});

test('ano do rodapé é o ano atual (IMP-517)', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2027-02-01T12:00:00Z'));
  await page.goto('/');
  await expect(page.locator('footer')).toContainText('© 2027 Guilherme dos Santos Teixeira');
});

test('nenhum elemento com aparência de link leva a um destino incoerente (IMP-500, IMP-516)', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Em breve/ })).toHaveCount(0);
  await expect(page.locator('.instagram-card [aria-label="Curtir"], .instagram-card .instagram-action')).toHaveCount(0);
});
