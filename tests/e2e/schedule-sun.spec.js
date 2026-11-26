const { test, expect } = require('@playwright/test');

test('sol fora dos botões amanhece e se põe com o ponteiro', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const scene = page.locator('.schedule-sun-scene');
  const orbit = scene.locator('.schedule-sun-orbit');
  const morning = page.locator('#agenda [data-whatsapp-shift="morning"]');
  const afternoon = page.locator('#agenda [data-whatsapp-shift="afternoon"]');
  const links = await page.locator('#agenda [data-whatsapp-shift]').evaluateAll((els) => els.map((el) => el.href));
  await expect(scene).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.schedule-consult-cta .schedule-sun-scene')).toHaveCount(0);
  const translateY = () => orbit.evaluate((el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42);
  await morning.hover();
  await expect(scene).toHaveAttribute('data-sun-phase', 'morning');
  await expect.poll(translateY).toBeLessThan(-15);
  await expect.poll(() => orbit.evaluate((el) => el.getAnimations().length)).toBe(0);
  const sunriseTransform = await orbit.evaluate((el) => getComputedStyle(el).transform);
  const sceneHeight = await scene.evaluate((el) => el.getBoundingClientRect().height);
  await page.mouse.move(0, 0);
  await expect(scene).toHaveAttribute('data-sun-phase', 'idle');
  await expect(orbit).toHaveCSS('transform', sunriseTransform);
  await afternoon.hover();
  await expect(scene).toHaveAttribute('data-sun-phase', 'afternoon');
  await expect.poll(translateY).toBeGreaterThan(69);
  await page.mouse.move(0, 0);
  await expect(scene).toHaveAttribute('data-sun-phase', 'idle');
  await expect.poll(translateY).toBeGreaterThan(69);
  expect(await scene.evaluate((el) => el.getBoundingClientRect().height)).toBe(sceneHeight);
  await expect(scene).toHaveCSS('overflow', 'hidden');
  expect(await page.locator('#agenda [data-whatsapp-shift]').evaluateAll((els) => els.map((el) => el.href))).toEqual(
    links,
  );
  expect(errors).toEqual([]);
});

test('sol responde ao foco e respeita movimento reduzido', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const scene = page.locator('.schedule-sun-scene');
  const morning = page.locator('#agenda [data-whatsapp-shift="morning"]');
  const afternoon = page.locator('#agenda [data-whatsapp-shift="afternoon"]');
  await morning.focus();
  await expect(scene).toHaveAttribute('data-sun-phase', 'morning');
  await afternoon.focus();
  await expect(scene).toHaveAttribute('data-sun-phase', 'afternoon');
  await expect(scene.locator('.schedule-sun-orbit')).toHaveCSS('transition-duration', '0s');
  expect(await scene.locator('.schedule-sun-orbit').evaluate((el) => el.getAnimations().length)).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.locator('#whatsapp-link').focus();
  await expect(scene).toHaveAttribute('data-sun-phase', 'idle');
});

test('pausa local remove a transição do sol', async ({ page }) => {
  await page.goto('/');
  await page.locator('html').evaluate((el) => el.classList.add('a11y-pausar'));
  await page.locator('#agenda [data-whatsapp-shift="morning"]').focus();
  await expect(page.locator('.schedule-sun-orbit')).toHaveCSS('transition-duration', '0s');
  expect(await page.locator('.schedule-sun-orbit').evaluate((el) => el.getAnimations().length)).toBe(0);
});
