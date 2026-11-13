// FR-03B — abas, agenda acessível, carrosséis e movimento (IMP-320 a IMP-339, IMP-614 a IMP-616, IMP-624, IMP-629, IMP-630).
const { test, expect } = require('@playwright/test');
const { useSiteConfig } = require('./helpers');

const NUMBER = '5571991234567'; // fictício
const manualSchedule = [
  ["number: '',", `number: '${NUMBER}',`],
  ['productionHosts: [],', "productionHosts: ['127.0.0.1'],"],
  ["mode: 'whatsapp-only',", "mode: 'manual-schedule',"],
  ['modalities: [],', "modalities: ['online'],"],
  [
    'days: [],',
    "days: [{ date: '2026-11-18', times: ['09:00'] }, { date: '2026-11-20', times: ['10:30'] }, { date: '2026-11-24', times: ['09:00', '14:00'] }, { date: '2026-11-25', times: ['16:00'] }],",
  ],
];

test.describe('abas do "Sobre" (IMP-320 a IMP-323, IMP-614)', () => {
  test('setas, Home e End movem foco e seleção; só a aba selecionada entra no Tab', async ({ page }) => {
    await page.goto('/');
    const tablist = page.getByRole('tablist', { name: 'Conheça o jeito de trabalhar' });
    const tabs = tablist.getByRole('tab');
    await expect(tabs).toHaveCount(3);
    await expect(tablist.locator('[tabindex="0"]')).toHaveCount(1);
    await tabs.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(1)).toBeFocused();
    await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('O processo é construído em conjunto.');
    await page.keyboard.press('End');
    await expect(tabs.nth(2)).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(tabs.nth(0)).toBeFocused();
    await page.keyboard.press('ArrowLeft');
    await expect(tabs.nth(2)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    const controls = await tabs.nth(0).getAttribute('aria-controls');
    await expect(page.locator(`#${controls}`)).toHaveAttribute('aria-labelledby', await tabs.nth(0).getAttribute('id'));
    await expect(page.getByRole('tabpanel')).toHaveCount(1);
  });
});

test.describe('agenda manual (IMP-324 a IMP-327, IMP-615, IMP-624)', () => {
  test('dias expostos como abas, painel associado e foco preservado ao trocar de dia', async ({ page }) => {
    await useSiteConfig(page, manualSchedule);
    await page.clock.setFixedTime(new Date('2026-11-20T12:00:00Z')); // 09:00 na Bahia
    await page.goto('/');
    const days = page.getByRole('tablist', { name: 'Dias com horários publicados' }).getByRole('tab');
    await expect(days).toHaveCount(3); // 18/11 já passou
    await expect(days.first()).toHaveAccessibleName('sexta 20 nov de 2026');
    await expect(days.first()).toHaveAttribute('aria-selected', 'true');
    const panel = page.getByRole('tabpanel', { name: 'sexta 20 nov de 2026' });
    await expect(panel).toContainText('sexta-feira, 20 de novembro de 2026');
    await expect(panel).toBeVisible();

    await days.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(days.nth(1)).toBeFocused();
    await expect(days.nth(1)).toHaveAttribute('aria-selected', 'true');
    const nextPanel = page.getByRole('tabpanel', { name: 'terça 24 nov de 2026' });
    await expect(nextPanel.getByRole('link')).toHaveCount(2);
    const href = await nextPanel.getByRole('link').first().getAttribute('href');
    const text = new URL(href).searchParams.get('text');
    expect(text).toContain('terça-feira, 24 de novembro de 2026, às 09:00');
    expect(text).toContain('Modalidade: online.');
    expect(text).toContain('depende da sua confirmação');

    await page.keyboard.press('End');
    await expect(days.nth(2)).toBeFocused();
    await expect(page.locator('#schedule-panel')).toContainText('16:00');
  });
});

test.describe('carrosséis (IMP-330 a IMP-335, IMP-616, IMP-801)', () => {
  test('só o slide ativo fica exposto; Anterior/Próximo não travam a rotação; Pausar para', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const carousel = page.getByRole('group', { name: 'Posts do Instagram' });
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carrossel');
    await expect(carousel.locator('[data-instagram-slide]:not([aria-hidden="true"])')).toHaveCount(1);
    await expect(carousel.getByRole('group', { name: '1 de 9' })).toBeVisible();

    await page.clock.runFor(5000);
    await expect(carousel.getByRole('group', { name: '2 de 9' })).toBeVisible();
    await expect(carousel.locator('[data-instagram-slide]:not([aria-hidden="true"])')).toHaveCount(1);

    // Clique em Próximo: avança na hora e a rotação continua depois de um intervalo inteiro.
    await carousel.getByRole('button', { name: 'Próximo post' }).click();
    await expect(carousel.getByRole('group', { name: '3 de 9' })).toBeVisible();
    await expect(carousel.getByRole('button', { name: 'Pausar rotação dos posts' })).toBeVisible();
    await page.mouse.move(0, 0);
    await page.clock.runFor(4000);
    await expect(carousel.getByRole('group', { name: '3 de 9' })).toBeVisible();
    await page.clock.runFor(1000);
    await expect(carousel.getByRole('group', { name: '4 de 9' })).toBeVisible();

    await carousel.getByRole('button', { name: 'Post anterior' }).click();
    await expect(carousel.getByRole('group', { name: '3 de 9' })).toBeVisible();

    // Só o botão Pausar interrompe a rotação de vez.
    await carousel.getByRole('button', { name: 'Pausar rotação dos posts' }).click();
    await expect(carousel.getByRole('button', { name: 'Retomar rotação dos posts' })).toBeVisible();
    await expect(carousel.locator('[data-carousel-track]')).toHaveAttribute('aria-live', 'polite');
    await page.mouse.move(0, 0);
    await page.clock.runFor(15000);
    await expect(carousel.getByRole('group', { name: '3 de 9' })).toBeVisible();
    await carousel.getByRole('button', { name: 'Retomar rotação dos posts' }).click();
    await page.mouse.move(0, 0);
    await page.clock.runFor(5000);
    await expect(carousel.getByRole('group', { name: '4 de 9' })).toBeVisible();
    await expect(carousel.locator('[data-carousel-track]')).toHaveAttribute('aria-live', 'off');
  });

  test('pausa com o mouse sobre o carrossel e com o foco de teclado dentro dele', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const carousel = page.getByRole('group', { name: 'Posts do Instagram' });
    const track = carousel.locator('[data-carousel-track]');
    await carousel.hover();
    await page.clock.runFor(10000);
    await expect(carousel.getByRole('group', { name: '1 de 9' })).toBeVisible();
    await expect(track).toHaveAttribute('aria-live', 'polite');
    await page.mouse.move(0, 0);
    await page.clock.runFor(5000);
    await expect(carousel.getByRole('group', { name: '2 de 9' })).toBeVisible();
    await expect(track).toHaveAttribute('aria-live', 'off');

    // Foco pelo teclado pausa; ao sair do carrossel, a rotação volta.
    await carousel.getByRole('button', { name: 'Post anterior' }).focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(carousel.getByRole('button', { name: 'Post anterior' })).toBeFocused();
    await page.clock.runFor(10000);
    await expect(carousel.getByRole('group', { name: '2 de 9' })).toBeVisible();
    await expect(track).toHaveAttribute('aria-live', 'polite');
    await page.locator('body').focus();
    await page.evaluate(() => document.activeElement.blur());
    await page.clock.runFor(5000);
    await expect(carousel.getByRole('group', { name: '3 de 9' })).toBeVisible();
  });

  test('o foco deixado por um clique do mouse não trava a rotação', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const carousel = page.getByRole('group', { name: 'Posts do Instagram' });
    await carousel.getByRole('button', { name: 'Próximo post' }).click();
    await page.mouse.move(0, 0);
    await page.clock.runFor(5000);
    await expect(carousel.getByRole('group', { name: '3 de 9' })).toBeVisible();
  });

  test('carrossel de fotos tem nome, oculta a foto inativa e pode ser pausado', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const photos = page.getByRole('group', { name: 'Fotos de Guilherme Teixeira' });
    await expect(photos.locator('[data-portrait-slide]:not([aria-hidden="true"])')).toHaveCount(1);
    await photos.getByRole('button', { name: 'Pausar rotação das fotos' }).click();
    const visible = await photos.locator('.portrait-slide.is-active').getAttribute('data-portrait-slide');
    await page.mouse.move(0, 0);
    await page.clock.runFor(20000);
    await expect(photos.locator('.portrait-slide.is-active')).toHaveAttribute('data-portrait-slide', visible);
  });

  test('carrossel de fotos gira quando aparece na tela', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const photos = page.getByRole('group', { name: 'Fotos de Guilherme Teixeira' });
    await photos.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await page.clock.runFor(6000);
    await expect(photos.locator('.portrait-slide.is-active')).toHaveAttribute('data-portrait-slide', '1');
  });
});

test.describe('carrossel em tela de toque (IMP-801)', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test('tocar em Próximo não deixa o carrossel travado', async ({ page, browserName }) => {
    test.skip(browserName === 'firefox', 'O Firefox do Playwright não emula toque com isMobile.');
    await page.clock.install();
    await page.goto('/');
    const carousel = page.getByRole('group', { name: 'Posts do Instagram' });
    await carousel.getByRole('button', { name: 'Próximo post' }).tap();
    await expect(carousel.getByRole('group', { name: '2 de 9' })).toBeVisible();
    await page.clock.runFor(5000);
    await expect(carousel.getByRole('group', { name: '3 de 9' })).toBeVisible();
  });
});

test.describe('movimento reduzido (IMP-334, IMP-339, IMP-629)', () => {
  test.use({ reducedMotion: 'reduce' });

  test('carrosséis começam pausados e não há animação nem rolagem suave', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    const carousel = page.getByRole('group', { name: 'Posts do Instagram' });
    await expect(carousel.getByRole('button', { name: 'Retomar rotação dos posts' })).toBeVisible();
    await page.clock.runFor(20000);
    await expect(carousel.getByRole('group', { name: '1 de 9' })).toBeVisible();
    const styles = await page.evaluate(() => ({
      scroll: getComputedStyle(document.documentElement).scrollBehavior,
      reveal: getComputedStyle(document.querySelector('.reveal')).animationName,
      slide: getComputedStyle(document.querySelector('.instagram-slide')).transitionDuration,
      card: getComputedStyle(document.querySelector('.service-card')).transitionDuration,
    }));
    expect(styles).toEqual({ scroll: 'auto', reveal: 'none', slide: '0s', card: '0s, 0s' });
  });

  test('navegação interna continua funcionando', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Contato' }).click();
    await expect(page).toHaveURL(/#contato$/);
    await expect(page.locator('#contato-title')).toBeInViewport();
  });
});

test.describe('transição de navegação (IMP-336 a IMP-338, IMP-630)', () => {
  test('não há sobreposição de tela cheia e a rolagem começa imediatamente', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await expect(page.locator('.page-transition')).toHaveCount(0);
    const nav = page.getByRole('navigation', { name: 'Navegação principal' });
    await nav.getByRole('link', { name: 'Agenda' }).click();
    // A rolagem começa logo, sem a espera de ~620 ms da antiga transição; 1 s de folga para máquinas carregadas.
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 1000 }).toBeGreaterThan(0);
    await nav.getByRole('link', { name: 'Sobre' }).click();
    await expect(page).toHaveURL(/#sobre$/);
    await expect(page.locator('#sobre-title')).toBeInViewport();
  });

  test('ícones flutuantes do hero não têm animação contínua', async ({ page }) => {
    await page.goto('/');
    const names = await page.$$eval('.ig-float', (els) => els.map((el) => getComputedStyle(el).animationName));
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((name) => name === 'none')).toBe(true);
  });
});
