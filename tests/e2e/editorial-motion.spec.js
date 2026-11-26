const { test, expect } = require('@playwright/test');

test('entradas por scroll revelam títulos e cards em sequência', async ({ page }) => {
  await page.goto('/');
  const title = page.locator('#atendimentos-title');
  await expect(title).toHaveCSS('opacity', '0');
  await title.scrollIntoViewIfNeeded();
  await expect(title).toHaveClass(/is-visible/);
  await expect(title).toHaveCSS('opacity', '1');
  await expect(title).toHaveCSS('clip-path', 'inset(0px)');
  const cards = page.locator('.service-card');
  await cards.first().scrollIntoViewIfNeeded();
  await expect(cards.first()).toHaveCSS('opacity', '1');
  const delays = await cards.evaluateAll((els) =>
    els.map((el) => parseFloat(el.style.getPropertyValue('--reveal-delay'))),
  );
  expect(delays[1]).toBeGreaterThan(delays[0]);
  await page.locator('#conteudos-title').scrollIntoViewIfNeeded();
  await expect(page.locator('#conteudos-title')).toHaveCSS('opacity', '1');
  const content = page.locator('.content-card').first();
  await content.scrollIntoViewIfNeeded();
  await expect(content).toHaveClass(/is-settled/);
  await content.hover();
  await expect
    .poll(() => content.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42))
    .toBeLessThan(-5);
  await expect.poll(() => content.evaluate((el) => getComputedStyle(el, '::after').opacity)).toBe('1');
  await expect(content.getByRole('link')).toHaveAttribute('href', '#atendimentos');
});

test('indicador das abas acompanha seleção e texto continua acessível pelo teclado', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const list = page.getByRole('tablist', { name: 'Conheça o jeito de trabalhar' });
  await list.scrollIntoViewIfNeeded();
  await expect(list).toHaveClass(/is-settled/);
  const tabs = list.getByRole('tab');
  await tabs.first().focus();
  await page.keyboard.press('End');
  await expect(tabs.last()).toBeFocused();
  await expect(page.getByRole('tabpanel')).toContainText('Ninguém precisa cuidar sozinho.');
  const indicator = list.locator('.about-tab-indicator');
  await expect
    .poll(async () => {
      const active = await tabs.last().boundingBox();
      const pill = await indicator.boundingBox();
      return Math.abs(active.x - pill.x) + Math.abs(active.width - pill.width);
    })
    .toBeLessThan(1);
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tabpanel')).toContainText('O processo é construído em conjunto.');
  await expect.poll(() => indicator.evaluate((el) => el.getAnimations().length)).toBe(0);
  expect(errors).toEqual([]);
});

test('movimento reduzido mantém tudo visível e abas sem animações', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#conteudos-title')).toHaveCSS('opacity', '1');
  await expect(page.locator('#conteudos-title')).toHaveCSS('clip-path', 'none');
  const list = page.getByRole('tablist', { name: 'Conheça o jeito de trabalhar' });
  await list.getByRole('tab').last().click();
  await expect(page.getByRole('tabpanel')).toContainText('Ninguém precisa cuidar sozinho.');
  expect(await list.locator('.about-tab-indicator').evaluate((el) => el.getAnimations().length)).toBe(0);
  expect(
    await page
      .getByRole('tabpanel')
      .locator('h3')
      .evaluate((el) => el.getAnimations().length),
  ).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
