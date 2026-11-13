// IMP-411/IMP-412 — capturas de referência das seções nos breakpoints críticos.
// Protegem paleta, hierarquia, fotografia, sombras e composição contra regressões não aprovadas.
// Para aceitar uma mudança visual intencional: npx playwright test tests/e2e/visual.spec.js --update-snapshots
const { test, expect } = require('@playwright/test');

// Capturas de referência e medições por pixel dependem do motor de renderização: rodam só no Chromium.
test.skip(({ browserName }) => browserName !== 'chromium', 'Referências geradas no Chromium');

const SECTIONS = {
  hero: 'main > section:first-of-type',
  atendimentos: '#atendimentos',
  sobre: '#sobre',
  conteudos: '#conteudos',
  faq: '#faq',
  agenda: '#agenda',
  contato: '#contato',
};

for (const width of [390, 1280]) {
  test.describe(`${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      // Imagens com loading="lazy" fora da tela só carregam com a rolagem; aqui são carregadas antes da captura.
      await page.evaluate(() =>
        document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager')),
      );
      await page.evaluate(() =>
        Promise.all([
          ...['400', '500', '600', '700'].flatMap((w) =>
            [`${w} 16px Inter`, `${w} 16px "DM Sans"`].map((font) => document.fonts.load(font)),
          ),
          ...[...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))),
        ]),
      );
    });

    for (const [name, selector] of Object.entries(SECTIONS))
      test(name, async ({ page }) => {
        await expect(page.locator(selector)).toHaveScreenshot(`${name}-${width}.png`, {
          animations: 'disabled',
          // A faixa da onda lateral e o cabeçalho fixo mudam com a rolagem; ficam mascarados.
          mask: [page.locator('.brand-wave'), page.locator('header')],
          maxDiffPixelRatio: 0.01,
        });
      });
  });
}
