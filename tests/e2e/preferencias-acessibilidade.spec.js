// IMP-802 a IMP-812 — painel de acessibilidade, preferências do sistema e tradutor VLibras.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { collectErrors, waitForAnimations } = require('./helpers');

const VLIBRAS = 'https://vlibras.gov.br/app/vlibras-plugin.js';

const withPrefs = (page, prefs) =>
  page.addInitScript((value) => localStorage.setItem('acessibilidade', JSON.stringify(value)), prefs);

const savedPrefs = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('acessibilidade') || 'null'));

const horizontalOverflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

// Simula o carregador oficial do VLibras: define window.VLibrasWidget.open, como o script real.
const FAKE_VLIBRAS = `
  window.VLibrasWidget = { open() { document.documentElement.dataset.vlibrasAberto = 'sim'; } };
`;

test.describe('painel de acessibilidade', () => {
  test('abre e fecha como disclosure: Esc devolve o foco, clique fora fecha', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Acessibilidade', exact: true });
    const panel = page.getByRole('region', { name: 'Acessibilidade' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toBeHidden();

    // Pelo teclado: o painel vem logo depois do botão na ordem de foco.
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
    // O próximo Tab entra no painel (no Firefox, o próprio painel rolável recebe o foco primeiro).
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => Boolean(document.activeElement.closest('#a11y-panel')))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(toggle).toBeFocused();

    await toggle.click();
    await page.locator('h1').click();
    await expect(panel).toBeHidden();
    await toggle.click();
    await panel.getByRole('button', { name: 'Fechar acessibilidade' }).click();
    await expect(panel).toBeHidden();
    expect(errors).toEqual([]);
  });

  test('tamanho do texto: degraus de 100% a 200%, limites e escolha salva', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    const panel = page.getByRole('region', { name: 'Acessibilidade' });
    const decrease = panel.getByRole('button', { name: 'Diminuir' });
    const increase = panel.getByRole('button', { name: 'Aumentar' });
    await expect(decrease).toBeDisabled();
    const rootSize = () => page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
    const base = await rootSize();
    for (const value of ['125%', '150%', '175%', '200%']) {
      await increase.click();
      await expect(panel.locator('output')).toHaveText(value);
    }
    await expect(increase).toBeDisabled();
    expect(await rootSize()).toBeCloseTo(base * 2, 1);
    expect(await savedPrefs(page)).toMatchObject({ texto: 200 });

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-a11y-texto', '200');
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    await expect(panel.locator('output')).toHaveText('200%');
  });

  test('cada opção marca a página, fica salva e "Restaurar o padrão" desfaz tudo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    const panel = page.getByRole('region', { name: 'Acessibilidade' });
    const html = page.locator('html');
    const options = [
      ['Alto contraste', 'a11y-contraste'],
      ['Mais espaçamento', 'a11y-espacamento'],
      ['Destacar links e botões', 'a11y-links'],
      ['Guia de leitura', 'a11y-guia'],
      ['Pausar animações', 'a11y-pausar'],
    ];
    for (const [name, cls] of options) {
      const option = panel.getByRole('switch', { name: new RegExp(`^${name}`) });
      await option.check();
      await expect(option).toBeChecked();
      await expect(html).toHaveClass(new RegExp(cls));
    }
    await panel.getByRole('radio', { name: /^Para dislexia/ }).check();
    await expect(html).toHaveAttribute('data-a11y-fonte', 'dislexia');
    await expect
      .poll(() => page.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily))
      .toMatch(/^"?OpenDyslexic/);

    await page.reload();
    for (const [, cls] of options) await expect(html).toHaveClass(new RegExp(cls));
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    await expect(panel.getByRole('switch', { name: /^Alto contraste/ })).toBeChecked();
    await expect(panel.getByRole('radio', { name: /^Para dislexia/ })).toBeChecked();

    await panel.getByRole('button', { name: 'Restaurar o padrão' }).click();
    await expect(html).not.toHaveClass(/a11y-/);
    await expect(html).not.toHaveAttribute('data-a11y-fonte', /.+/);
    expect(await savedPrefs(page)).toBeNull();
  });

  test('preferências salvas valem desde o primeiro carregamento', async ({ page }) => {
    await withPrefs(page, { contraste: true, texto: 150 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const state = await page.evaluate(() => ({
      cls: document.documentElement.className,
      texto: document.documentElement.dataset.a11yTexto,
      bg: getComputedStyle(document.body).backgroundColor,
    }));
    expect(state).toEqual({ cls: expect.stringContaining('a11y-contraste'), texto: '150', bg: 'rgb(0, 0, 0)' });
  });

  test('sem armazenamento disponível, o painel funciona e avisa que não vai salvar', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('bloqueado');
        },
      });
    });
    const errors = collectErrors(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    const panel = page.getByRole('region', { name: 'Acessibilidade' });
    await panel.getByRole('switch', { name: /^Alto contraste/ }).check();
    await expect(page.locator('html')).toHaveClass(/a11y-contraste/);
    await expect(panel.getByText('Este navegador não permite salvar as escolhas')).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('"Pausar animações" para os carrosséis e desligar a opção os retoma', async ({ page }) => {
    await page.clock.install();
    await withPrefs(page, { pausar: true });
    await page.goto('/');
    const carousel = page.getByRole('group', { name: 'Posts do Instagram' });
    await expect(carousel.getByRole('button', { name: 'Retomar rotação dos posts' })).toBeVisible();
    await page.clock.runFor(15000);
    await expect(carousel.getByRole('group', { name: '1 de 9' })).toBeVisible();
    expect(
      await page.evaluate(() => getComputedStyle(document.querySelector('.instagram-slide')).transitionDuration),
    ).toBe('0s');

    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    await page.getByRole('switch', { name: /^Pausar animações/ }).uncheck();
    await page.keyboard.press('Escape');
    await page.mouse.move(0, 0);
    await page.locator('body').evaluate(() => document.activeElement.blur());
    await page.clock.runFor(5000);
    await expect(carousel.getByRole('group', { name: '2 de 9' })).toBeVisible();
  });

  test('guia de leitura acompanha o mouse', async ({ page }) => {
    await withPrefs(page, { guia: true });
    await page.goto('/');
    const guide = page.locator('.a11y-guia-faixa');
    await expect(guide).toBeVisible();
    await page.mouse.move(400, 300);
    await expect.poll(() => guide.evaluate((el) => el.style.transform)).toBe('translateY(300px)');
  });
});

test.describe('layout com as preferências ativas (WCAG 1.4.4, 1.4.10, 1.4.12)', () => {
  const combos = [
    { texto: 200 },
    { texto: 175, fonte: 'legivel' },
    { texto: 125, fonte: 'dislexia', espacamento: true },
    { contraste: true, links: true },
  ];
  for (const width of [320, 768, 1024, 1280]) {
    test(`sem rolagem horizontal em ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const prefs of combos) {
        await withPrefs(page, prefs);
        await page.goto('/');
        expect(await horizontalOverflow(page), JSON.stringify(prefs)).toBeLessThanOrEqual(0);
        // Os botões do cabeçalho continuam dentro da tela.
        for (const id of ['#a11y-toggle', '#menu-toggle']) {
          const box = await page.locator(id).boundingBox();
          if (box) expect(box.x + box.width, `${id} ${JSON.stringify(prefs)}`).toBeLessThanOrEqual(width);
        }
      }
    });
  }

  test('com texto ampliado, a navegação vai para o menu e continua utilizável', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await withPrefs(page, { texto: 200 });
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Navegação principal' })).toBeHidden();
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.getByRole('navigation', { name: 'Menu' }).getByRole('link', { name: 'Contato' }).click();
    await expect(page).toHaveURL(/#contato$/);
  });
});

test.describe('acessibilidade automática nos modos (axe)', () => {
  const modes = {
    'alto contraste': { contraste: true, links: true },
    'texto 200% com fonte para dislexia e espaçamento': { texto: 200, fonte: 'dislexia', espacamento: true },
  };
  for (const [name, prefs] of Object.entries(modes)) {
    test(`sem violações graves: ${name}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await withPrefs(page, prefs);
      await page.goto('/');
      await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
      await waitForAnimations(page);
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact));
      expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' | ')}`)).toEqual([]);
    });
  }
});

test.describe('preferências do sistema', () => {
  test('"mais contraste" deixa o texto secundário em tinta sólida', async ({ page }) => {
    await page.emulateMedia({ contrast: 'more' });
    await page.goto('/');
    const color = await page.locator('#hero-title + p').evaluate((el) => getComputedStyle(el).color);
    expect(color).toBe('rgb(23, 50, 77)');
  });

  test('cores forçadas mantêm visíveis as linhas do ícone de menu e o logotipo', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'Emulação de cores forçadas só no Chromium.');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
    const styles = await page.evaluate(() => ({
      line: getComputedStyle(document.querySelector('#menu-toggle span span')).forcedColorAdjust,
      logo: getComputedStyle(document.querySelector('.brand-logo')).mixBlendMode,
    }));
    expect(styles).toEqual({ line: 'none', logo: 'normal' });
  });
});

test.describe('VLibras (IMP-810)', () => {
  test('nada é pedido ao VLibras até a pessoa clicar; o clique carrega e abre o tradutor', async ({ page }) => {
    const requests = [];
    await page.route('https://vlibras.gov.br/**', (route) => {
      requests.push(route.request().url());
      return route.fulfill({ contentType: 'text/javascript', body: FAKE_VLIBRAS });
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(requests).toEqual([]);

    const launcher = page.getByRole('button', { name: 'Traduzir a página para Libras com o VLibras' });
    await expect(launcher).toBeVisible();
    await launcher.click();
    await expect(page.locator('html')).toHaveAttribute('data-vlibras-aberto', 'sim');
    expect(requests).toEqual([VLIBRAS]);
    await expect(launcher).toBeHidden();

    // O botão do painel reabre o tradutor sem baixar o script de novo.
    await page.evaluate(() => delete document.documentElement.dataset.vlibrasAberto);
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    await page.getByRole('button', { name: 'Traduzir a página para Libras' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-vlibras-aberto', 'sim');
    expect(requests).toEqual([VLIBRAS]);
  });

  test('sem conexão com o VLibras, avisa e permite tentar de novo', async ({ page }) => {
    let fail = true;
    await page.route('https://vlibras.gov.br/**', (route) =>
      fail ? route.abort() : route.fulfill({ contentType: 'text/javascript', body: FAKE_VLIBRAS }),
    );
    await page.goto('/');
    const launcher = page.getByRole('button', { name: 'Traduzir a página para Libras com o VLibras' });
    await launcher.click();
    await expect(page.getByRole('status').filter({ hasText: 'Não foi possível carregar o VLibras' })).toBeVisible();
    await expect(launcher).toBeVisible();
    fail = false;
    await launcher.click();
    await expect(page.locator('html')).toHaveAttribute('data-vlibras-aberto', 'sim');
  });

  test('quem deixou o VLibras aberto o encontra aberto na próxima visita', async ({ page }) => {
    await page.route('https://vlibras.gov.br/**', (route) =>
      route.fulfill({ contentType: 'text/javascript', body: FAKE_VLIBRAS }),
    );
    await page.addInitScript(() => localStorage.setItem('@vlibras-widget', '{"isOpen":true}'));
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-vlibras-aberto', 'sim');
  });
});
