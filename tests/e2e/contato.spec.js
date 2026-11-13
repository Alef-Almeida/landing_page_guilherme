// FR-02 — estados seguros do contato e da agenda (IMP-201 a IMP-212, IMP-615, IMP-626).
const { test, expect } = require('@playwright/test');
const { useSiteConfig } = require('./helpers');

const NUMBER = '5571991234567'; // fictício
const CTAS = '[data-whatsapp-cta="general"], [data-whatsapp-cta="schedule"]';

const expectDisabled = async (page, status) => {
  for (const cta of await page.locator(CTAS).all()) {
    await expect(cta).not.toHaveAttribute('href', /.*/);
    await expect(cta).toHaveAttribute('aria-disabled', 'true');
  }
  await expect(page.locator('[data-whatsapp-status]:visible').first()).toHaveText(status);
  await expect(page.locator('a[href*="wa.me"], a[href="#"]')).toHaveCount(0);
};

test('sem número configurado, os botões ficam desativados com aviso', async ({ page }) => {
  await page.goto('/');
  await expectDisabled(page, 'O contato pelo WhatsApp está temporariamente indisponível.');
});

test('com número fora do domínio de produção, nada é enviado e a URL fica disponível para QA', async ({ page }) => {
  await useSiteConfig(page, [["number: '',", `number: '${NUMBER}',`]]);
  await page.goto('/');
  await expectDisabled(
    page,
    'Ambiente de teste: o link do WhatsApp fica desativado aqui para não enviar mensagens reais.',
  );
  const preview = await page.locator('[data-whatsapp-cta="general"]').getAttribute('data-whatsapp-preview');
  expect(preview).toBe(
    `https://wa.me/${NUMBER}?text=${encodeURIComponent('Olá, Guilherme. Gostaria de saber mais sobre o acompanhamento psicológico.')}`,
  );
});

test('no domínio de produção, os botões abrem o WhatsApp em nova aba', async ({ page }) => {
  await useSiteConfig(page, [
    ["number: '',", `number: '${NUMBER}',`],
    ['productionHosts: [],', "productionHosts: ['127.0.0.1'],"],
  ]);
  await page.goto('/');
  for (const cta of await page.locator(CTAS).all()) {
    await expect(cta).toHaveAttribute('href', new RegExp(`^https://wa\\.me/${NUMBER}\\?text=`));
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
  }
  await expect(page.locator('[data-whatsapp-status]:visible')).toHaveCount(0);
});

test('se site-config.js não carregar, a página continua segura e sem erro de script', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('**/site-config.js', (route) => route.fulfill({ status: 404, body: '' }));
  await page.goto('/');
  await expectDisabled(page, 'O contato pelo WhatsApp está temporariamente indisponível.');
  expect(errors).toEqual([]);
});

test('agenda manual sem horários futuros mostra a consulta pelo WhatsApp (IMP-207)', async ({ page }) => {
  await useSiteConfig(page, [
    ["mode: 'whatsapp-only',", "mode: 'manual-schedule',"],
    ['days: [],', "days: [{ date: '2026-11-10', times: ['09:00'] }],"],
  ]);
  await page.clock.setFixedTime(new Date('2026-11-20T12:00:00Z'));
  await page.goto('/');
  await expect(page.locator('[data-schedule-consult-text]')).toHaveText(
    'No momento não há horários publicados. Envie uma mensagem para consultar a disponibilidade.',
  );
  await expect(page.getByRole('tablist', { name: 'Dias com horários publicados' })).toHaveCount(0);
  await expect(page.locator('.schedule-confirmation')).toContainText('não reserva um horário');
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('os botões continuam seguros e há orientação para o visitante', async ({ page }) => {
    await page.goto('/');
    for (const cta of await page.locator(CTAS).all()) await expect(cta).not.toHaveAttribute('href', /.*/);
    // getByText ignora <noscript>; o aviso é localizado diretamente.
    const notice = page.locator('noscript .whatsapp-status').first();
    await expect(notice).toBeVisible();
    await expect(notice).toHaveText('Para conversar pelo WhatsApp, ative o JavaScript do navegador.');
    await expect(page.locator('a[href*="wa.me"], a[href="#"]')).toHaveCount(0);
  });
});
