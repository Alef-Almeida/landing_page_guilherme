// FR-03A — estrutura, conteúdo estático, navegação e menu (IMP-300 a IMP-313, IMP-610, IMP-611, IMP-612, IMP-618).
const { test, expect } = require('@playwright/test');
const { collectErrors, useSiteConfig } = require('./helpers');

const SECTION_ORDER = ['atendimentos', 'sobre', 'conteudos', 'faq', 'agenda', 'contato'];

test.describe('estrutura', () => {
  test('carrega sem erros de JavaScript', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors.filter((e) => !e.includes('favicon'))).toEqual([]);
  });

  test('ordem do HTML igual à ordem visual das seções (IMP-300/IMP-301)', async ({ page }) => {
    await page.goto('/');
    const sections = await page.$$eval('main > section[id]', (els) =>
      els.map((el) => ({ id: el.id, top: el.getBoundingClientRect().top + window.scrollY })),
    );
    expect(sections.map((s) => s.id)).toEqual(SECTION_ORDER);
    const tops = sections.map((s) => s.top);
    expect([...tops].sort((a, b) => a - b)).toEqual(tops);
  });

  test('seções e landmarks têm nome e há um único h1 (IMP-303)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    for (const id of SECTION_ORDER) {
      const labelledBy = await page.locator(`#${id}`).getAttribute('aria-labelledby');
      await expect(page.locator(`#${labelledBy}`)).toHaveCount(1);
      await expect(page.getByRole('region', { name: await page.locator(`#${labelledBy}`).innerText() })).toHaveCount(1);
    }
    await expect(page.getByRole('banner')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('contentinfo')).toHaveCount(1);
  });

  test('a ordem de foco percorre as seções na ordem visual (IMP-618)', async ({ page }) => {
    // Com contato ativo, Agenda e Contato também têm elementos focáveis.
    await useSiteConfig(page, [
      ["number: '',", "number: '5571991234567',"],
      ['productionHosts: [],', "productionHosts: ['127.0.0.1'],"],
    ]);
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const visited = [];
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('Tab');
      const section = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return 'fim';
        if (el.closest('header') || el.classList.contains('skip-link')) return 'cabeçalho';
        if (el.closest('footer')) return 'rodapé';
        if (el.id === 'vlibras-launcher') return 'libras';
        return el.closest('main > section')?.id || 'hero';
      });
      if (section === 'fim') break;
      if (visited.at(-1) !== section) visited.push(section);
    }
    // O botão do VLibras fica no fim do documento, depois do conteúdo (IMP-810).
    expect(visited).toEqual(['cabeçalho', 'hero', ...SECTION_ORDER, 'libras']);
  });
});

test.describe('navegação interna', () => {
  test('link para pular ao conteúdo é o primeiro foco e leva ao <main> (IMP-302)', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('main')).toBeFocused();
  });

  test('âncoras param abaixo do cabeçalho fixo (IMP-304)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    await page.getByRole('navigation', { name: 'Navegação principal' }).getByRole('link', { name: 'Agenda' }).click();
    await expect(page).toHaveURL(/#agenda$/);
    await expect
      .poll(async () => page.locator('#agenda').evaluate((el) => Math.round(el.getBoundingClientRect().top)))
      .toBeGreaterThanOrEqual(await page.locator('header').evaluate((el) => Math.floor(el.offsetHeight)));
    const headerBottom = await page.locator('header').evaluate((el) => el.getBoundingClientRect().bottom);
    const titleTop = await page.locator('#agenda-title').evaluate((el) => el.getBoundingClientRect().top);
    expect(titleTop).toBeGreaterThan(headerBottom);
  });

  test('cliques repetidos não duplicam o histórico e Voltar retorna à seção anterior (IMP-306/IMP-611)', async ({
    page,
  }) => {
    // Sem rolagem suave, o teste não depende da duração da animação quando a máquina está carregada.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Navegação principal' });
    await nav.getByRole('link', { name: 'Sobre' }).click();
    await expect(page).toHaveURL(/#sobre$/);
    const length = await page.evaluate(() => history.length);
    await nav.getByRole('link', { name: 'Sobre' }).click();
    await nav.getByRole('link', { name: 'Sobre' }).click();
    expect(await page.evaluate(() => history.length)).toBe(length);
    await nav.getByRole('link', { name: 'Dúvidas' }).click();
    await expect(page).toHaveURL(/#faq$/);
    await page.goBack();
    await expect(page).toHaveURL(/#sobre$/);
    await expect
      .poll(async () => page.locator('#sobre').evaluate((el) => Math.abs(el.getBoundingClientRect().top) < 200))
      .toBe(true);
  });

  test('a seção atual é exposta com aria-current (IMP-305)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#faq');
    const nav = page.getByRole('navigation', { name: 'Navegação principal' });
    await expect(nav.getByRole('link', { name: 'Dúvidas' })).toHaveAttribute('aria-current', 'true');
    await expect(nav.locator('[aria-current]')).toHaveCount(1);
  });
});

test.describe('menu mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('anuncia o estado, fecha com Escape e devolve o foco (IMP-310 a IMP-313/IMP-612)', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Abrir menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toHaveAttribute('aria-controls', 'mobile-menu');
    await toggle.focus();
    await page.keyboard.press('Enter');
    const menu = page.getByRole('navigation', { name: 'Menu' });
    await expect(menu).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(menu.getByRole('link', { name: 'Atendimentos' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toBeFocused();
  });

  test('fecha ao escolher uma seção e navega até ela', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('navigation', { name: 'Menu' }).getByRole('link', { name: 'Contato' }).click();
    await expect(page.getByRole('navigation', { name: 'Menu' })).toBeHidden();
    await expect(page).toHaveURL(/#contato$/);
    await expect(page.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute('aria-expanded', 'false');
  });

  test('fecha ao clicar fora', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.mouse.click(195, 780);
    await expect(page.getByRole('navigation', { name: 'Menu' })).toBeHidden();
  });
});

test.describe('conteúdo estático (IMP-307/IMP-308)', () => {
  test('com JavaScript: abas e carrosséis funcionam sobre o HTML estático', async ({ page }) => {
    await page.goto('/');
    const tabs = page.getByRole('tablist', { name: 'Conheça o jeito de trabalhar' });
    await expect(tabs).toBeVisible();
    await expect(page.locator('[data-about-panel]:visible')).toHaveCount(1);
    await tabs.getByRole('tab', { name: 'Cuidado em rede' }).click();
    await expect(page.locator('#about-panel-rede')).toBeVisible();
    await expect(page.locator('#about-panel-rede')).toContainText('Ninguém precisa cuidar sozinho.');
    await expect(page.locator('[data-carousel-controls]')).toBeVisible();
    await expect(page.locator('.contact-steps')).toContainText('Conte o que você busca');
  });

  test.describe('sem JavaScript', () => {
    test.use({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });

    test('mostra todo o conteúdo e esconde controles que dependem de JavaScript', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('[data-about-panel]:visible')).toHaveCount(3);
      await expect(page.locator('[data-about-tablist]')).toBeHidden();
      await expect(page.locator('[data-carousel-controls]')).toBeHidden();
      await expect(page.locator('[data-carousel-toggle]')).toHaveCount(2);
      for (const toggle of await page.locator('[data-carousel-toggle]').all()) await expect(toggle).toBeHidden();
      await expect(page.locator('#menu-toggle')).toBeHidden();
      await expect(page.locator('[data-instagram-slide].is-active')).toBeVisible();
      await expect(page.locator('[data-instagram-slide]:not([aria-hidden="true"])')).toHaveCount(1);
      await expect(page.locator('[data-portrait-slide].is-active')).toBeVisible();
      await expect(page.locator('.contact-steps')).toBeVisible();
      await expect(page.locator('a[href="#"]')).toHaveCount(0);
    });
  });
});
