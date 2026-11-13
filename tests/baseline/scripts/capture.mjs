// IMP-007 — Capturas de referência, axe, console e requisições do commit-base.
// Uso: TOOLS_DIR=<pasta com playwright-core e axe-core> BASE_URL=http://127.0.0.1:8765/ node capture.mjs <pasta-de-saída>
import { createRequire } from 'node:module';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(path.join(process.env.TOOLS_DIR, 'package.json'));
const { chromium } = require('playwright-core');
const axePath = require.resolve('axe-core/axe.min.js');

const BASE_URL = process.env.BASE_URL ?? 'http://127.0.0.1:8765/';
const OUT = path.resolve(process.argv[2] ?? '.');
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';
const VIEWPORTS = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 }
];
const SECTIONS = [
  ['01-cabecalho', 'header'],
  ['02-hero', 'main > section:first-of-type'],
  ['03-atendimentos', '#atendimentos'],
  ['04-sobre', '#sobre'],
  ['05-conteudos', '#conteudos'],
  ['06-faq', '#faq'],
  ['07-agenda', '#agenda'],
  ['08-contato', '#contato'],
  ['09-rodape', 'footer']
];

// Congela os carrosséis no primeiro slide para que as capturas sejam determinísticas.
const freezeIntervals = () => { window.setInterval = () => 0; };

const settle = async page => {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
};

const browser = await chromium.launch({ executablePath: CHROME });
const summary = { baseUrl: BASE_URL, capturedAt: new Date().toISOString(), viewports: {} };

for (const viewport of VIEWPORTS) {
  const label = `${viewport.width}`;
  const dir = path.join(OUT, 'screenshots', label);
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.addInitScript(freezeIntervals);
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', err => consoleMessages.push({ type: 'pageerror', text: String(err) }));
  await page.goto(BASE_URL);
  await settle(page);

  const metrics = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    documentHeight: document.documentElement.scrollHeight,
    horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth
  }));

  await page.screenshot({ path: path.join(dir, '00-pagina-inteira.png'), fullPage: true, animations: 'disabled' });
  for (const [name, selector] of SECTIONS) {
    const el = page.locator(selector).first();
    if (await el.count()) await el.screenshot({ path: path.join(dir, `${name}.png`), animations: 'disabled' });
  }
  summary.viewports[label] = { ...metrics, console: consoleMessages };
  await context.close();
}

// axe e requisições: perfis mobile (390) e desktop (1280), sem congelar temporizadores.
const axeSource = await readFile(axePath, 'utf8');
for (const [label, viewport] of [['mobile-390', VIEWPORTS[1]], ['desktop-1280', VIEWPORTS[3]]]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const requests = [];
  page.on('requestfinished', async request => {
    const response = await request.response();
    const sizes = await request.sizes().catch(() => null);
    requests.push({
      url: request.url(),
      type: request.resourceType(),
      status: response?.status() ?? null,
      responseBodyBytes: sizes?.responseBodySize ?? null
    });
  });
  page.on('requestfailed', request => requests.push({ url: request.url(), type: request.resourceType(), status: 'failed', error: request.failure()?.errorText }));
  await page.goto(BASE_URL);
  await settle(page);
  await page.addScriptTag({ content: axeSource });
  const axe = await page.evaluate(async () => window.axe.run(document, { resultTypes: ['violations', 'incomplete'] }));
  await writeFile(path.join(OUT, `axe-${label}.json`), JSON.stringify({
    url: axe.url, timestamp: axe.timestamp, testEngine: axe.testEngine,
    violations: axe.violations, incomplete: axe.incomplete
  }, null, 2) + '\n');
  await writeFile(path.join(OUT, `requests-${label}.json`), JSON.stringify(requests, null, 2) + '\n');
  await context.close();
}

await writeFile(path.join(OUT, 'capture-summary.json'), JSON.stringify(summary, null, 2) + '\n');
await browser.close();
console.log('ok');
