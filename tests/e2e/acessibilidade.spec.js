// IMP-620 — auditoria axe sem violações críticas ou sérias, nos estados principais da página.
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { useSiteConfig, waitForAnimations } = require('./helpers');

const audit = async (page, configure = (builder) => builder) => {
  await page.waitForLoadState('networkidle');
  await waitForAnimations(page);
  return serious(await configure(new AxeBuilder({ page })).analyze());
};

const serious = (results) =>
  results.violations
    .filter((v) => ['critical', 'serious'].includes(v.impact))
    .map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);

for (const width of [390, 1280]) {
  test(`axe em ${width}px, estado atual`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await audit(page)).toEqual([]);
  });
}

test('axe com a agenda manual ativa e contato habilitado', async ({ page }) => {
  await useSiteConfig(page, [
    ["number: '',", "number: '5571991234567',"],
    ['productionHosts: [],', "productionHosts: ['127.0.0.1'],"],
    ["mode: 'whatsapp-only',", "mode: 'manual-schedule',"],
    [
      'days: [],',
      "days: [{ date: '2026-11-24', times: ['09:00', '14:00'] }, { date: '2026-11-25', times: ['16:00'] }],",
    ],
  ]);
  await page.clock.setFixedTime(new Date('2026-11-20T12:00:00Z'));
  await page.goto('/');
  expect(await audit(page)).toEqual([]);
});

test('axe no menu mobile aberto', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir menu' }).click();
  // Só o cabeçalho: o restante da página fica sob o menu aberto e seria medido através dele.
  expect(await audit(page, (b) => b.include('header'))).toEqual([]);
});
