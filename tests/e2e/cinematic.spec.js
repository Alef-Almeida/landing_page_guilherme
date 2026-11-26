// Redesign: contratos funcionais, acessibilidade e custo em repouso; sem snapshots.
const { test, expect } = require('@playwright/test');
const { collectErrors, useSiteConfig } = require('./helpers');

const NUMBER = '5571991234567';
const motionEnabled = (page) => expect(page.locator('html')).toHaveClass(/cinema-motion/);
const scrollTo = (page, top) => page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
const boatState = (page) => page.locator('#journey-boat').getAttribute('transform');

async function observeMotionFrames(page) {
  await page.addInitScript(() => {
    const native = window.requestAnimationFrame.bind(window);
    window.__cinematicFrames = 0;
    window.requestAnimationFrame = (callback) => {
      const cinematic = new Error().stack?.includes('/cinematic.js:');
      return native((time) => {
        if (cinematic) window.__cinematicFrames++;
        callback(time);
      });
    };
  });
}

async function expectMotionIdle(page) {
  // Uma janela de amostragem verifica trabalho ocioso após a convergência.
  await page.waitForTimeout(1500);
  const before = await page.evaluate(() => window.__cinematicFrames);
  expect(before).toBeGreaterThan(0); // Garante que o instrumento observou o script real.
  await page.waitForTimeout(350);
  const after = await page.evaluate(() => window.__cinematicFrames);
  expect(after - before, 'frames cinematic executados sem interação').toBeLessThanOrEqual(1);
}

async function navigateTo(page, id) {
  const link = page.locator(`a[href="#${id}"]:visible`).first();
  if (!(await link.count())) await page.locator('#menu-toggle').click();
  await page.locator(`a[href="#${id}"]:visible`).first().click();
  await expect(page).toHaveURL(new RegExp(`#${id}$`));
  await expect(page.locator(`#${id}-title`)).toBeInViewport();
}

test.describe('cinematic: integração', () => {
  let errors;
  test.beforeEach(async ({ page }) => {
    errors = collectErrors(page);
  });
  test.afterEach(() => {
    expect(errors, 'erros de JavaScript, recursos ou CSP').toEqual([]);
  });

  for (const width of [320, 390, 768, 1440]) {
    test(`hero legível e sem overflow horizontal em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await motionEnabled(page);
      await expect(page.locator('#hero-title')).toBeVisible();
      await expect(page.locator('#hero-title')).toBeInViewport();
      await expect
        .poll(() => page.locator('#hero-title').evaluate((el) => Number(getComputedStyle(el).opacity)))
        .toBe(1);
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 700) {
        await scrollTo(page, y);
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
          .toBeLessThanOrEqual(1);
      }
      await scrollTo(page, 0);
      await expect(page.locator('#hero-title')).toBeInViewport();
      await expect(page.locator('.hero-line-inner').first()).toBeVisible();
    });
  }

  for (const width of [390, 1440]) {
    test(`barco percorre a jornada em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await motionEnabled(page);
      await expect(page.locator('#journey-path')).toHaveCount(1);
      await expect(page.locator('#journey-boat')).toHaveCount(1);
      await expect.poll(() => boatState(page)).toMatch(/translate/);
      const initial = await boatState(page);
      const offset = await page.locator('#journey-progress').evaluate((el) => Number(el.style.strokeDashoffset));
      expect(offset).toBeGreaterThan(0);
      const bottom = await page.locator('.journey-section').evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.bottom + scrollY - innerHeight * 0.2;
      });
      await scrollTo(page, bottom);
      await expect.poll(() => boatState(page)).not.toBe(initial);
      await expect
        .poll(() => page.locator('#journey-progress').evaluate((el) => Number(el.style.strokeDashoffset)))
        .toBeLessThan(1);
      await page.locator('.journey-step').first().scrollIntoViewIfNeeded();
      await expect(page.locator('.journey-step').first()).toBeVisible();
    });
  }

  test('scheduler encerra frames após wheel e após um delta de um pixel', async ({ page }) => {
    await observeMotionFrames(page);
    await page.goto('/');
    await motionEnabled(page);
    await page.mouse.move(10, 850);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expectMotionIdle(page);
    await page.keyboard.press('Escape');
    await scrollTo(page, 0);
    const intercepted = await page.evaluate(() => {
      const event = new WheelEvent('wheel', { deltaY: 1, bubbles: true, cancelable: true });
      document.body.dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(intercepted).toBe(true);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(1);
    await expectMotionIdle(page);
  });

  test('wheel preserva rolagem nativa dentro do painel de acessibilidade', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 480 });
    await page.goto('/');
    await motionEnabled(page);
    await page.locator('#a11y-toggle').click();
    const panel = page.locator('#a11y-panel');
    await expect(panel).toBeVisible();
    expect(await panel.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeGreaterThan(0);
    const pageY = await page.evaluate(() => scrollY);
    const intercepted = await panel.evaluate((el) => {
      const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true });
      el.querySelector('label').dispatchEvent(event);
      return event.defaultPrevented;
    });
    expect(intercepted).toBe(false);
    await panel.hover();
    await page.mouse.wheel(0, 180);
    await expect.poll(() => panel.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
    expect(await page.evaluate(() => scrollY)).toBe(pageY);
  });

  for (const mode of ['sistema', 'painel', 'persistida']) {
    test(`pausa por ${mode} mantém conteúdo e barco estáticos`, async ({ page }) => {
      if (mode === 'sistema') await page.emulateMedia({ reducedMotion: 'reduce' });
      if (mode === 'persistida') {
        await page.addInitScript(() => localStorage.setItem('acessibilidade', JSON.stringify({ pausar: true })));
      }
      await page.goto('/');
      await expect(page.locator('script[src*="cinematic.js"]')).toHaveCount(1);
      if (mode === 'painel') {
        await motionEnabled(page);
        await page.locator('#a11y-toggle').click();
        await page.getByRole('switch', { name: /^Pausar animações/ }).check();
        await page.keyboard.press('Escape');
      }
      await expect(page.locator('html')).not.toHaveClass(/cinema-motion/);
      await expect.poll(() => boatState(page)).toMatch(/translate/);
      const initial = await boatState(page);
      const intercepted = await page.evaluate(() => {
        const event = new WheelEvent('wheel', { deltaY: 100, bubbles: true, cancelable: true });
        document.body.dispatchEvent(event);
        return event.defaultPrevented;
      });
      expect(intercepted).toBe(false);
      await page.locator('[data-manifesto]').scrollIntoViewIfNeeded();
      await expect(page.locator('[data-manifesto]')).toBeVisible();
      await expect
        .poll(() =>
          page.locator('[data-word]').evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1')),
        )
        .toBe(true);
      await page.locator('.journey-section').scrollIntoViewIfNeeded();
      await expect.poll(() => boatState(page)).toBe(initial);
      await expect(page.locator('#hero-title')).toBeVisible();
    });
  }

  for (const width of [390, 1440]) {
    test(`navegação, contato e mensagens dos turnos preservados em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await useSiteConfig(page, [["number: '557499542056',", `number: '${NUMBER}',`]]);
      await page.goto('/');
      await motionEnabled(page);
      await navigateTo(page, 'agenda');
      await expect(page.locator('#agenda [data-whatsapp-cta="schedule"]')).toHaveCount(2);
      for (const [shift, text] of [
        ['morning', 'manhã'],
        ['afternoon', 'tarde'],
      ]) {
        const cta = page.locator('#agenda').getByRole('link', { name: `Consultar turno da ${text}` });
        await expect(cta).toHaveAttribute('data-whatsapp-shift', shift);
        const url = new URL(await cta.getAttribute('href'));
        expect(url.origin + url.pathname).toBe(`https://wa.me/${NUMBER}`);
        expect(url.searchParams.get('text')).toContain(text);
        await expect(cta).toHaveAttribute('target', '_blank');
        await expect(cta).toHaveAttribute('rel', /noopener/);
      }
      await navigateTo(page, 'contato');
      const general = page.locator('[data-whatsapp-cta="general"]').first();
      await expect(general).toBeVisible();
      const url = new URL(await general.getAttribute('href'));
      expect(url.origin + url.pathname).toBe(`https://wa.me/${NUMBER}`);
      expect(url.searchParams.get('text')).toContain('acompanhamento psicológico');
    });
  }
});

test.describe('cinematic: melhoria progressiva', () => {
  test.use({ javaScriptEnabled: false });
  test('hero, manifesto e navegação continuam disponíveis sem JavaScript', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero-title')).toBeVisible();
    await expect(page.locator('#hero-title')).toBeInViewport();
    await page.locator('[data-manifesto]').scrollIntoViewIfNeeded();
    await expect(page.locator('[data-manifesto]')).toBeVisible();
    await expect(page.locator('[data-manifesto]').locator('..')).toHaveCSS('opacity', '1');
    await expect(page.locator('a[href="#agenda"]').first()).toHaveAttribute('href', '#agenda');
    await expect(page.locator('a[href="#contato"]').first()).toHaveAttribute('href', '#contato');
    await expect(page.locator('[data-whatsapp-cta][href*="wa.me"]')).toHaveCount(0);
  });
});
