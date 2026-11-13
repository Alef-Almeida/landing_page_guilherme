// IMP-511/IMP-512 — recursos de terceiros e cabeçalhos de segurança.
const { test, expect } = require('@playwright/test');
const config = require('../../security-headers.json');

test('a página envia os cabeçalhos de segurança definidos', async ({ page }) => {
  const response = await page.goto('/');
  const headers = response.headers();
  for (const [name, value] of Object.entries(config.headers)) {
    // Em produção a CSP recebe upgrade-insecure-requests no fim; por isso a comparação é pelo início.
    if (name === 'Content-Security-Policy')
      expect(headers[name.toLowerCase()], name).toMatch(new RegExp(`^${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    else expect(headers[name.toLowerCase()], name).toBe(value);
  }
  if (response.url().startsWith('https://'))
    expect(headers['strict-transport-security'], 'HSTS em produção').toBe(
      config.productionOnly['Strict-Transport-Security'],
    );
});

test('nenhuma violação de CSP ao carregar, rolar e interagir', async ({ page }) => {
  const violations = [];
  await page.exposeFunction('reportViolation', (v) => violations.push(v));
  await page.addInitScript(() =>
    document.addEventListener('securitypolicyviolation', (e) =>
      window.reportViolation(`${e.violatedDirective} ${e.blockedURI}`),
    ),
  );
  page.on('console', (m) => {
    if (/Content Security Policy|Refused to/.test(m.text())) violations.push(m.text());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'Próximo post' }).click();
  await page.getByRole('tab', { name: 'Cuidado em rede' }).click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
  expect(violations).toEqual([]);
});

test('nenhum recurso é carregado de outro domínio (IMP-511)', async ({ page, baseURL }) => {
  const own = new URL(baseURL).hostname;
  const external = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (url.protocol !== 'data:' && url.hostname !== own) external.push(request.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForLoadState('networkidle');
  expect(external).toEqual([]);
});

test('a CSP só abre exceção para o VLibras, sem eval nem curingas genéricos (IMP-810)', () => {
  const csp = config.headers['Content-Security-Policy'];
  const allowed = new Set([
    "'self'",
    "'none'",
    "'unsafe-inline'",
    'data:',
    'blob:',
    'https://vlibras.gov.br',
    'https://*.vlibras.gov.br',
    'https://cdn.jsdelivr.net/gh/spbgovbr-vlibras/',
  ]);
  for (const directive of csp.split(';').map((d) => d.trim())) {
    const [name, ...sources] = directive.split(/\s+/);
    for (const source of sources) expect(allowed.has(source), `${name} ${source}`).toBe(true);
    // Estilos inline são exigência do VLibras; scripts inline continuam proibidos.
    if (name === 'script-src') expect(sources).not.toContain("'unsafe-inline'");
  }
  expect(csp).not.toMatch(/unsafe-eval/);
});
