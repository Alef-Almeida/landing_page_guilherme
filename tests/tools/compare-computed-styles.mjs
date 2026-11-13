// Compara o estilo computado de todos os elementos e pseudo-elementos renderizados entre duas URLs,
// em 320, 390, 768, 1280 e 1440 px, no estado padrão, em hover e com o menu mobile aberto.
// Usado na FR-01 para provar que a migração do Tailwind via CDN para o build local não mudou nada.
// Requer playwright-core instalado em TOOLS_DIR e Google Chrome em /usr/bin/google-chrome.
// Uso: TOOLS_DIR=<pasta> node tests/tools/compare-computed-styles.mjs <url-original> <url-nova> [--verbose]
import { createRequire } from 'node:module';
const require = createRequire(process.env.TOOLS_DIR + '/package.json');
const { chromium } = require('playwright-core');

const [urlA, urlB] = process.argv.slice(2);
const verbose = process.argv.includes('--verbose');
const VIEWPORTS = [320, 390, 768, 1280, 1440].map((w) => ({ width: w, height: w < 768 ? 800 : 900 }));
const HOVER_TARGETS = [
  '.nav-link',
  '.service-card.child-card',
  '.service-card.adult-card',
  '.content-card',
  '.content-card a',
  '.contact-panel a',
  '.schedule-day:not(.is-active)',
  '.schedule-slot',
  '.about-tab:not(.is-active)',
  '.instagram-card',
  'summary',
  '.service-card a',
];

const freeze = () => {
  window.setInterval = () => 0;
};

const collect = (skipBoat) => {
  // Exceção documentada: o autoprefixer do CDN listava -webkit-text-decoration-color, dispensável nos navegadores-alvo.
  const norm = (v) => v.replace(/https?:\/\/127\.0\.0\.1:\d+/g, '').replace(/, -webkit-text-decoration-color/g, '');
  const pathOf = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      let i = 1;
      for (let s = n.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === n.tagName) i++;
      parts.unshift(`${n.tagName.toLowerCase()}[${i}]`);
    }
    return parts.join('>');
  };
  const snap = (el, pseudo) => {
    const cs = getComputedStyle(el, pseudo);
    if (pseudo && (cs.content === 'none' || cs.content === 'normal' || cs.display === 'none')) return 'ABSENT';
    const o = {};
    for (let i = 0; i < cs.length; i++) {
      const p = cs[i];
      if (p.startsWith('--')) continue;
      o[p] = norm(cs.getPropertyValue(p));
    }
    // Bordas de largura zero não são renderizadas: estilo e cor delas não têm efeito visual.
    const sides = { top: 'block-start', bottom: 'block-end', left: 'inline-start', right: 'inline-end' };
    for (const [side, logical] of Object.entries(sides)) {
      if (o[`border-${side}-width`] === '0px')
        for (const k of [
          `border-${side}-style`,
          `border-${side}-color`,
          `border-${logical}-style`,
          `border-${logical}-color`,
        ])
          delete o[k];
    }
    return o;
  };
  const out = {};
  const els = [document.documentElement, ...document.body.querySelectorAll('*'), document.body];
  for (const el of els) {
    if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    if (skipBoat && el.closest('#scroll-boat')) continue;
    // Elementos não renderizados (dentro de display:none) não têm efeito visual.
    if (el !== document.documentElement && el !== document.body && !el.checkVisibility()) continue;
    const k = pathOf(el);
    out[k] = snap(el, null);
    out[k + '::before'] = snap(el, '::before');
    out[k + '::after'] = snap(el, '::after');
  }
  return out;
};

const settleAnimations = () => {
  for (const a of document.getAnimations()) {
    try {
      a.finish();
    } catch {
      a.pause();
      a.currentTime = 0;
    }
  }
};

const diff = (a, b) => {
  const res = [];
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k],
      y = b[k];
    if (x === undefined || y === undefined) {
      res.push(`${k}: só em ${x === undefined ? 'B' : 'A'}`);
      continue;
    }
    if (x === 'ABSENT' || y === 'ABSENT') {
      if (x !== y) res.push(`${k}: ${x === 'ABSENT' ? 'ausente em A' : 'ausente em B'}`);
      continue;
    }
    for (const p of new Set([...Object.keys(x), ...Object.keys(y)]))
      if (x[p] !== y[p]) res.push(`${k} { ${p}: ${x[p]} → ${y[p]} }`);
  }
  return res;
};

const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const load = async (url, viewport) => {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(freeze);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
  });
  page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`));
  await page.goto(url);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.evaluate(settleAnimations);
  return { ctx, page, errors };
};

let total = 0;
for (const vp of VIEWPORTS) {
  const A = await load(urlA, vp),
    B = await load(urlB, vp);
  const states = [['padrão', async () => {}]];
  for (const sel of HOVER_TARGETS)
    states.push([
      `hover ${sel}`,
      async (p) => {
        const el = p.locator(sel).first();
        if (!(await el.count()) || !(await el.isVisible())) return 'skip';
        await p
          .addStyleTag({
            content: '*,*::before,*::after{transition:none!important}html{scroll-behavior:auto!important}',
          })
          .catch(() => {});
        await el.scrollIntoViewIfNeeded();
        const hovered = await el
          .hover({ timeout: 3000 })
          .then(() => true)
          .catch(() => false);
        // Alvos que não recebem ponteiro (por exemplo, botões desativados) são ignorados neste estado.
        if (!hovered) return 'skip';
        await p.evaluate(settleAnimations);
      },
    ]);
  if (vp.width < 768)
    states.push([
      'menu mobile aberto',
      async (p) => {
        await p.click('#menu-toggle');
      },
    ]);
  for (const [name, act] of states) {
    const ra = await act(A.page),
      rb = await act(B.page);
    for (const p of [A.page, B.page]) {
      await p.evaluate(() => document.fonts.ready);
      await p.waitForTimeout(150);
    }
    if (ra === 'skip' || rb === 'skip') continue;
    const skip = name !== 'padrão';
    const d = diff(await A.page.evaluate(collect, skip), await B.page.evaluate(collect, skip));
    total += d.length;
    if (d.length) {
      console.log(`✗ ${vp.width}px ${name}: ${d.length} diferenças`);
      for (const l of d.slice(0, verbose ? 400 : 12)) console.log('   ' + l);
    } else if (verbose) console.log(`✓ ${vp.width}px ${name}`);
    if (name !== 'padrão') {
      await A.page.mouse.move(0, 0);
      await B.page.mouse.move(0, 0);
    }
  }
  console.log(`${vp.width}px  erros/avisos A: ${JSON.stringify(A.errors)}  B: ${JSON.stringify(B.errors)}`);
  await A.ctx.close();
  await B.ctx.close();
}
await browser.close();
console.log(total === 0 ? 'EQUIVALENTE: nenhuma diferença de estilo computado' : `TOTAL: ${total} diferenças`);
process.exit(total ? 1 : 0);
