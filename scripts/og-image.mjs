// Gera assets/og-image.jpg (1200 × 630), a imagem de compartilhamento, com as fontes e cores da página.
// Uso: npm run og-image (requer o Chromium do Playwright: npx playwright install chromium).
import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const asset = (file) => pathToFileURL(path.join(ROOT, file)).href;
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face { font-family: 'DM Sans'; font-weight: 100 1000; src: url('${asset('assets/fonts/dm-sans-latin-wght-normal.woff2')}'); }
@font-face { font-family: 'Inter'; font-weight: 100 900; src: url('${asset('assets/fonts/inter-latin-wght-normal.woff2')}'); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #f8f5f1; color: #17324d; font-family: Inter, sans-serif; position: relative; }
.sky { position: absolute; right: -120px; top: -140px; width: 560px; height: 560px; border-radius: 50%; background: #ddecf5; filter: blur(40px); }
.peach { position: absolute; left: -160px; bottom: -220px; width: 520px; height: 520px; border-radius: 50%; background: rgba(245,183,156,.35); filter: blur(50px); }
main { position: relative; padding: 72px 80px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
.logo { height: 76px; mix-blend-mode: multiply; align-self: flex-start; }
h1 { font-family: 'DM Sans', sans-serif; font-weight: 600; font-size: 64px; line-height: 1.04; letter-spacing: -0.045em; max-width: 760px; }
p { font-size: 26px; color: rgba(23,50,77,.8); }
.boat { position: absolute; right: 86px; bottom: 96px; width: 230px; mix-blend-mode: multiply; opacity: .85; }
</style></head><body><div class="sky"></div><div class="peach"></div>
<main><img class="logo" src="${asset('assets/guilherme-teixeira-logo.png')}" alt="">
<h1>Cuidar da mente é abrir espaço para novas possibilidades.</h1>
<p>Psicologia clínica para crianças, adolescentes e adultos · CRP 03/36532</p></main>
<img class="boat" src="${asset('assets/paper-boat-line.png')}" alt=""></body></html>`;

const tmp = path.join(os.tmpdir(), `og-image-${process.pid}.html`);
await writeFile(tmp, html);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(pathToFileURL(tmp).href);
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot();
await browser.close();
await rm(tmp, { force: true });
const info = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, 'assets/og-image.jpg'));
console.log(`assets/og-image.jpg  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
