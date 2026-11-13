// Lighthouse mobile (IMP-621, IMP-633): 3 execuções com throttling real (devtools), mediana pelo desempenho.
// Compara com as metas do plano e com o baseline do commit-base (tests/baseline/lighthouse-mobile.json).
// Uso: npm run lighthouse  (usa o Chromium do Playwright: npx playwright install chromium)
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4174;
const RUNS = 3;
const TARGETS = { performance: 85, accessibility: 95, 'best-practices': 90, seo: 90 };
const METRICS = {
  'first-contentful-paint': 's',
  'largest-contentful-paint': 's',
  'total-blocking-time': 'ms',
  'cumulative-layout-shift': '',
  'speed-index': 's',
  'total-byte-weight': 'KB',
};

const format = (id, value) => {
  const unit = METRICS[id];
  if (unit === 's') return `${(value / 1000).toFixed(2)} s`;
  if (unit === 'KB') return `${Math.round(value / 1024)} KB`;
  if (unit === 'ms') return `${Math.round(value)} ms`;
  return value.toFixed(3);
};

const server = startServer(PORT);
const chrome = await chromeLauncher.launch({
  chromePath: chromium.executablePath(),
  chromeFlags: ['--headless=new', '--no-sandbox'],
});
const runs = [];
try {
  for (let i = 0; i < RUNS; i++) {
    const { lhr } = await lighthouse(`http://127.0.0.1:${PORT}/`, {
      port: chrome.port,
      output: 'json',
      throttlingMethod: 'devtools',
      onlyCategories: Object.keys(TARGETS),
    });
    runs.push(lhr);
  }
} finally {
  await chrome.kill();
  server.close();
}

runs.sort((a, b) => a.categories.performance.score - b.categories.performance.score);
const median = runs[Math.floor(runs.length / 2)];
const baseline = JSON.parse(await readFile(path.join(ROOT, 'tests/baseline/lighthouse-mobile.json'), 'utf8'));
await mkdir(path.join(ROOT, 'lighthouse-report'), { recursive: true });
await writeFile(path.join(ROOT, 'lighthouse-report/mobile.json'), JSON.stringify(median));

const rows = [];
let failed = false;
for (const [id, target] of Object.entries(TARGETS)) {
  const score = Math.round(median.categories[id].score * 100);
  const base = Math.round(baseline.categories[id].score * 100);
  const all = runs.map((r) => Math.round(r.categories[id].score * 100)).join('/');
  const ok = score >= target && score >= base;
  if (!ok) failed = true;
  rows.push(
    `${ok ? '✓' : '✗'} ${id.padEnd(15)} ${String(score).padStart(3)} (execuções ${all})  meta ${target}  baseline ${base}`,
  );
}
rows.push('');
for (const id of Object.keys(METRICS))
  rows.push(
    `  ${id.padEnd(25)} ${format(id, median.audits[id].numericValue).padStart(9)}   baseline ${format(id, baseline.audits[id].numericValue)}`,
  );
rows.push(
  '',
  'Baseline medido com throttling simulado (padrão do Lighthouse); as execuções atuais usam throttling real.',
);
console.log(rows.join('\n'));
if (failed) process.exit(1);
