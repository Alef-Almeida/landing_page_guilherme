const { test, expect } = require('@playwright/test');

async function scroll(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y);
}

for (const width of [390, 1440]) {
  test(`navbar recolhe ao descer e retorna ao subir em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const compact = page.getByRole('navigation', { name: 'Navegação compacta' });
    await expect(page.locator('.scroll-nav')).toHaveAttribute('inert', '');
    await scroll(page, 750);
    await expect(page.locator('html')).toHaveClass(/nav-condensed/);
    await expect(compact).toBeInViewport();
    await expect(page.locator('header')).toHaveAttribute('inert', '');
    await expect(compact.getByRole('link')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await scroll(page, 650);
    await expect(page.locator('html')).not.toHaveClass(/nav-condensed/);
    await expect(page.locator('header')).not.toHaveAttribute('inert');
  });
}

test('navbar compacta permite navegar e expandir por teclado', async ({ page }) => {
  await page.goto('/');
  await scroll(page, 700);
  await expect(page.locator('html')).toHaveClass(/nav-condensed/);
  const compact = page.getByRole('navigation', { name: 'Navegação compacta' });
  await compact.getByRole('link', { name: 'Sobre', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#sobre$/);
  await expect(page.locator('html')).not.toHaveClass(/nav-condensed/);
  // Start a fresh downward traversal rather than interrupting native anchor scrolling.
  await page.goto('/');
  await scroll(page, 700);
  await expect(page.locator('html')).toHaveClass(/nav-condensed/);
  await compact.getByRole('button', { name: 'Mostrar navegação completa' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).not.toHaveClass(/nav-condensed/);
  await expect(page.getByRole('link', { name: 'Voltar ao início' })).toBeFocused();
});

test('painel aberto mantém cabeçalho acessível', async ({ page }) => {
  await page.goto('/');
  await page.locator('#a11y-toggle').click();
  await scroll(page, 700);
  await expect(page.locator('html')).not.toHaveClass(/nav-condensed/);
  await expect(page.locator('#a11y-panel')).toBeVisible();
});

test('cards têm o mesmo alinhamento superior e inferior no desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const boxes = await page.locator('.services-bento .service-card').evaluateAll((cards) =>
    cards.map((card) => {
      const rect = card.getBoundingClientRect();
      return { top: rect.top, bottom: rect.bottom };
    }),
  );
  expect(Math.abs(boxes[0].top - boxes[1].top)).toBeLessThan(1);
  expect(Math.abs(boxes[0].bottom - boxes[1].bottom)).toBeLessThan(1);
});
