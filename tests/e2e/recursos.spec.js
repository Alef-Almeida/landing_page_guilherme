// FR-04 — imagens, carregamento e recursos (IMP-404, IMP-405, IMP-407, IMP-409, IMP-619).
const { test, expect } = require('@playwright/test');

test('nenhum recurso local falha e o favicon existe (IMP-409, IMP-619)', async ({ page }) => {
  const failures = [];
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1') && response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
  page.on('requestfailed', (request) => failures.push(`falhou ${request.url()}`));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 600) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(50);
  }
  await page.waitForLoadState('networkidle');
  for (const path of [
    '/favicon.ico',
    '/assets/icons/favicon.svg',
    '/assets/icons/apple-touch-icon.png',
    '/site.webmanifest',
  ]) {
    const response = await page.request.get(path);
    expect(response.status(), path).toBe(200);
  }
  const manifest = await (await page.request.get('/site.webmanifest')).json();
  for (const icon of manifest.icons)
    expect((await page.request.get(`/${icon.src.replace('./', '')}`)).status()).toBe(200);
  expect(failures).toEqual([]);
});

test('links internos apontam para seções existentes (IMP-619)', async ({ page }) => {
  await page.goto('/');
  const missing = await page.$$eval('a[href^="#"]', (links) =>
    links.map((a) => a.getAttribute('href')).filter((href) => href.length > 1 && !document.querySelector(href)),
  );
  expect(missing).toEqual([]);
});

test('toda imagem declara largura e altura (IMP-404)', async ({ page }) => {
  await page.goto('/');
  const missing = await page.$$eval('img', (imgs) =>
    imgs
      .filter((img) => !img.getAttribute('width') || !img.getAttribute('height'))
      .map((img) => img.outerHTML.slice(0, 80)),
  );
  expect(missing).toEqual([]);
});

test.describe('carregamento das imagens no mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('só o primeiro post é baixado de início; os demais esperam o carregamento da página (IMP-406, IMP-407)', async ({
    page,
  }) => {
    const requested = [];
    page.on('request', (request) => requested.push(request.url()));
    // Segura a primeira imagem por 1,5 s: o evento load só ocorre depois dela, o que dá um ponto de
    // observação estável para verificar que os demais posts ainda não foram pedidos.
    let releaseFirst;
    const firstHeld = new Promise((resolve) => (releaseFirst = resolve));
    await page.route(/instagram-01-400\.(avif|webp)/, async (route) => {
      await firstHeld;
      await route.continue();
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const early = requested.filter((url) => /\/assets\/img\/instagram/.test(url));
    expect(early.some((url) => /instagram-01-400\.(avif|webp)/.test(url))).toBe(true);
    expect(early.filter((url) => /instagram-0[2-9]/.test(url))).toEqual([]);
    await expect(page.locator('.instagram-slide.is-active img')).toHaveAttribute('fetchpriority', 'high');

    releaseFirst();
    await page.waitForLoadState('networkidle');
    await expect.poll(() => page.locator('[data-defer-src]').count(), { timeout: 5000 }).toBe(0);
  });

  test('imagens fora da primeira dobra usam carregamento tardio (IMP-405)', async ({ page }) => {
    // O momento exato do download fica com o navegador: o Chrome antecipa imagens lazy a até ~2.500 px da tela.
    await page.goto('/');
    await expect(page.locator('.portrait-slide img')).toHaveCount(2);
    for (const img of await page.locator('.portrait-slide img, .about-tab-art img').all())
      await expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('ao avançar o carrossel antes do carregamento adiado, o slide recebe a imagem na hora', async ({ page }) => {
    await page.addInitScript(() => {
      window.requestIdleCallback = () => 0; // impede o carregamento adiado automático
    });
    await page.goto('/');
    await page.getByRole('button', { name: 'Próximo post' }).click();
    const slide = page.getByRole('group', { name: '2 de 9' });
    await expect(slide.locator('img')).not.toHaveAttribute('data-defer-src', /.+/);
    await expect
      .poll(() => slide.locator('img').evaluate((img) => img.complete && img.naturalWidth))
      .toBeGreaterThan(1);
  });
});
