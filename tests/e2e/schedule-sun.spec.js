const { test, expect } = require('@playwright/test');

test('sol fica imóvel enquanto o cenário muda e se dissipa', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const scene = page.locator('.schedule-sun-scene');
  const sun = scene.locator('.schedule-sun-fixed');
  const morning = page.locator('#agenda [data-whatsapp-shift="morning"]');
  const afternoon = page.locator('#agenda [data-whatsapp-shift="afternoon"]');
  await scene.scrollIntoViewIfNeeded();
  const sunBox = await sun.boundingBox();
  const sceneHeight = await scene.evaluate((el) => el.getBoundingClientRect().height);
  const links = await page.locator('#agenda [data-whatsapp-shift]').evaluateAll((els) => els.map((el) => el.href));
  await expect(scene).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.schedule-consult-cta .schedule-sun-scene')).toHaveCount(0);
  await morning.hover();
  await expect(scene).toHaveAttribute('data-sun-phase', 'morning');
  await expect(scene.locator('.cloud-left')).toHaveCSS('opacity', '1');
  await expect(scene.locator('.bird-one')).toHaveCSS('opacity', '1');
  await expect(scene.locator('.schedule-evening-tree')).toHaveCSS('opacity', '0');
  await expect(scene.locator('.schedule-evening-sea')).toHaveCSS('opacity', '0');
  expect(await sun.boundingBox()).toEqual(sunBox);
  await afternoon.hover();
  await expect(scene).toHaveAttribute('data-sun-phase', 'afternoon');
  await expect(scene.locator('.cloud-evening').first()).toHaveCSS('opacity', '1');
  await expect(scene.locator('.cloud-day').first()).toHaveCSS('opacity', '0');
  await expect(scene.locator('.schedule-evening-tree')).toHaveCSS('opacity', '1');
  await expect(scene.locator('.schedule-evening-sea')).toHaveCSS('opacity', '1');
  await expect(scene.locator('.bird-perched').first()).toHaveCSS('opacity', '1');
  await expect
    .poll(() => scene.locator('.bird-one').evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m41))
    .toBeCloseTo(503, 0);
  expect(await sun.boundingBox()).toEqual(sunBox);
  await page.mouse.move(0, 0);
  await expect(scene).toHaveAttribute('data-sun-phase', 'idle');
  for (const element of [
    '.cloud-left',
    '.cloud-right',
    '.bird-one',
    '.bird-two',
    '.schedule-evening-tree',
    '.schedule-evening-sea',
  ]) {
    await expect(scene.locator(element)).toHaveCSS('opacity', '0');
  }
  expect(await sun.boundingBox()).toEqual(sunBox);
  expect(await scene.evaluate((el) => el.getBoundingClientRect().height)).toBe(sceneHeight);
  expect(await page.locator('#agenda [data-whatsapp-shift]').evaluateAll((els) => els.map((el) => el.href))).toEqual(
    links,
  );
  expect(errors).toEqual([]);
});

test('teclado revela o cenário e movimento reduzido mantém elementos estáticos', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.keyboard.press('Tab');
  const scene = page.locator('.schedule-sun-scene');
  await page.locator('#agenda [data-whatsapp-shift="morning"]').focus();
  await expect(scene).toHaveAttribute('data-sun-phase', 'morning');
  await expect(scene.locator('.bird-wing-left').first()).toHaveCSS('animation-name', 'none');
  await expect(scene.locator('.cloud-left')).toHaveCSS('transition-duration', '0s');
  await page.locator('#agenda [data-whatsapp-shift="afternoon"]').focus();
  await expect(scene).toHaveAttribute('data-sun-phase', 'afternoon');
  await expect(scene.locator('.bird-perched').first()).toHaveCSS('opacity', '1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.locator('#whatsapp-link').focus();
  await expect(scene).toHaveAttribute('data-sun-phase', 'idle');
  await expect(scene.locator('.schedule-evening-tree')).toHaveCSS('opacity', '0');
});

test('pausa local interrompe asas e transições do cenário', async ({ page }) => {
  await page.goto('/');
  await page.locator('html').evaluate((el) => el.classList.add('a11y-pausar'));
  await page.locator('#agenda [data-whatsapp-shift="morning"]').hover();
  await expect(page.locator('.bird-wing-left').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.cloud-left')).toHaveCSS('transition-duration', '0s');
});
