// Testes de quebra no navegador: configurações malformadas, tempo passando, estresse de interação,
// telas extremas e o VLibras real sob a CSP. Cada teste afirma o comportamento CORRETO; uma falha
// indica um defeito encontrado. Uso: npx playwright test -c tests/quebra
const { test, expect } = require('@playwright/test');
const { useSiteConfig, collectErrors } = require('../e2e/helpers');

const NUMBER = '5571991234567'; // fictício
const enabled = [
  ["number: '',", `number: '${NUMBER}',`],
  ['productionHosts: [],', "productionHosts: ['127.0.0.1'],"],
];
const manual = (days, extra = []) => [
  ...enabled,
  ["mode: 'whatsapp-only',", "mode: 'manual-schedule',"],
  ['days: [],', `days: ${JSON.stringify(days)},`],
  ...extra,
];
const overflow = (page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('configuração malformada', () => {
  test('productionHosts como string não habilita o WhatsApp fora de produção', async ({ page }) => {
    await useSiteConfig(page, [
      ["number: '',", `number: '${NUMBER}',`],
      ['productionHosts: [],', "productionHosts: 'homolog-127.0.0.1.exemplo.com.br',"],
    ]);
    await page.goto('/');
    await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  });

  test('data repetida na agenda não gera duas abas iguais', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2030-03-01T12:00:00Z'));
    await useSiteConfig(
      page,
      manual([
        { date: '2030-03-04', times: ['09:00'] },
        { date: '2030-03-04', times: ['14:00'] },
      ]),
    );
    await page.goto('/');
    const names = await page.locator('#schedule').getByRole('tab').allTextContents();
    expect(new Set(names).size).toBe(names.length);
  });

  test('fuso inválido no modo manual não gera erro no console', async ({ page }) => {
    const errors = collectErrors(page);
    await useSiteConfig(
      page,
      manual([{ date: '2030-03-04', times: ['09:00'] }], [["timeZone: 'America/Bahia',", "timeZone: 'Marte/Base',"]]),
    );
    await page.goto('/');
    expect(errors).toEqual([]);
  });

  test('modalidade com HTML é exibida como texto, sem criar elementos', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2030-03-01T12:00:00Z'));
    const errors = collectErrors(page);
    await useSiteConfig(
      page,
      manual(
        [{ date: '2030-03-04', times: ['09:00'] }],
        [['modalities: [],', `modalities: ['<img src=x onerror="document.title=1">', 'online'],`]],
      ),
    );
    await page.goto('/');
    await expect(page.locator('#schedule img')).toHaveCount(0);
    await expect(page.locator('.schedule-status')).toContainText('<img src=x');
    expect(errors).toEqual([]);
  });
});

test.describe('o tempo passa com a página aberta', () => {
  test('horário que já passou deixa de ser oferecido', async ({ page }) => {
    // 08:50 em Salvador (UTC−3); horários às 09:00 e 10:00.
    await page.clock.install({ time: new Date('2030-03-04T11:50:00Z') });
    await useSiteConfig(page, manual([{ date: '2030-03-04', times: ['09:00', '10:00'] }]));
    await page.goto('/');
    const slot = page.locator('[data-slot-time="09:00"]');
    await expect(slot).toHaveAttribute('href', /wa\.me/);

    await page.clock.runFor(30 * 60 * 1000); // 09:20: o horário das 09:00 já passou
    await expect(page.locator('[data-slot-time="09:00"][href]')).toHaveCount(0);
  });
});

test.describe('telas extremas', () => {
  test('agenda com 60 dias, texto em 200% e fonte para dislexia não cria rolagem horizontal em 320px', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.clock.setFixedTime(new Date('2030-03-01T12:00:00Z'));
    await page.addInitScript(() =>
      localStorage.setItem('acessibilidade', JSON.stringify({ texto: 200, fonte: 'dislexia', espacamento: true })),
    );
    const days = Array.from({ length: 60 }, (_, i) => ({
      date: new Date(Date.UTC(2030, 2, 2 + i)).toISOString().slice(0, 10),
      times: ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'],
    }));
    await useSiteConfig(
      page,
      manual(days, [['modalities: [],', "modalities: ['presencial no consultório da Pituba, Salvador', 'online'],"]]),
    );
    await page.goto('/');
    await page.locator('#schedule').scrollIntoViewIfNeeded();
    expect(await overflow(page)).toBeLessThanOrEqual(0);
  });
});

test.describe('estresse de interação', () => {
  test('300 cliques em Próximo: um só slide ativo e um só temporizador', async ({ page }) => {
    await page.clock.install();
    const errors = collectErrors(page);
    await page.goto('/');
    const carousel = page.getByRole('group', { name: 'Posts do Instagram' });
    const next = carousel.getByRole('button', { name: 'Próximo post' });
    await next.evaluate((button) => {
      for (let i = 0; i < 300; i++) button.click();
    });
    await expect(carousel.locator('.instagram-slide.is-active')).toHaveCount(1);
    await expect(carousel.locator('.instagram-slide.is-active')).toHaveAttribute('data-instagram-slide', '3'); // 300 % 9
    await page.mouse.move(0, 0);
    await page.clock.runFor(4800);
    await expect(carousel.locator('.instagram-slide.is-active')).toHaveAttribute('data-instagram-slide', '4');
    expect(errors).toEqual([]);
  });

  test('alternar 50 vezes cada opção do painel mantém tela e armazenamento coerentes', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Acessibilidade', exact: true }).click();
    for (const option of ['contraste', 'espacamento', 'links', 'guia', 'pausar']) {
      const input = page.locator(`input[data-a11y-opcao="${option}"]`);
      await input.evaluate((el) => {
        for (let i = 0; i < 51; i++) el.click();
      });
      await expect(page.locator('html')).toHaveClass(new RegExp(`a11y-${option}`));
    }
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('acessibilidade')));
    expect(saved).toMatchObject({ contraste: true, espacamento: true, links: true, guia: true, pausar: true });
    expect(await page.locator('.a11y-guia-faixa').count()).toBe(1);
    expect(errors).toEqual([]);
  });

  test('armazenamento corrompido de outra versão não quebra a página', async ({ page }) => {
    const errors = collectErrors(page);
    await page.addInitScript(() => {
      localStorage.setItem('acessibilidade', '{"texto":999,"fonte":"<script>","__proto__":{"contraste":true}');
      localStorage.setItem('@vlibras-widget', '{"isOpen":"talvez"}');
    });
    await page.route('https://vlibras.gov.br/**', (route) => route.abort());
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-a11y-texto', /.*/);
    expect(errors).toEqual([]);
  });
});

test.describe('navegação', () => {
  test('ao chegar ao fim da página, "Contato" fica marcado como seção atual', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('.nav-link[href="#contato"]')).toHaveAttribute('aria-current', 'true');
  });

  test('menu mobile aberto não reaparece aberto depois de girar para paisagem larga e voltar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('#menu-toggle')).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('VLibras real sob a CSP', () => {
  test.skip(!process.env.VLIBRAS_REDE, 'defina VLIBRAS_REDE=1 para baixar o VLibras de verdade');
  test.setTimeout(90_000);

  test('o tradutor abre sem violações de CSP', async ({ page }) => {
    const violations = [];
    page.on('console', (m) => {
      if (/Content Security Policy|Refused to|wasm|WebAssembly/i.test(m.text())) violations.push(m.text());
    });
    await page.goto('/');
    await page.evaluate(() =>
      document.addEventListener('securitypolicyviolation', (e) =>
        console.error(`CSP: ${e.violatedDirective} bloqueou ${e.blockedURI}`),
      ),
    );
    await page.getByRole('button', { name: 'Traduzir a página para Libras com o VLibras' }).click();
    await expect(page.locator('#vlibras-status')).toBeHidden({ timeout: 15_000 });
    await expect(page.locator('#vlibras-app-root')).toBeAttached({ timeout: 45_000 });
    await page.waitForTimeout(15_000); // tempo para o avatar (Unity/WebGL) inicializar
    expect(violations).toEqual([]);
  });
});
