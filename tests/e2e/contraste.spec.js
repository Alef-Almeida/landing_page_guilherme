// IMP-340 — contraste medido nos pixels reais do fundo, inclusive gradientes e imagens, que o axe não avalia.
// A página é renderizada uma vez com todo o texto transparente; para cada elemento com texto próprio, a cor
// do texto (com a opacidade dela) é combinada com os pixels de fundo sob o elemento e o pior caso é comparado
// com o mínimo WCAG AA: 4,5:1 para texto normal e 3:1 para texto grande (≥ 24 px, ou ≥ 18,66 px em negrito).
const { test, expect } = require('@playwright/test');
const { PNG } = require('pngjs');

const luminance = ([r, g, b]) => {
  const lin = (c) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
const ratio = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

for (const width of [320, 390, 768, 1280]) {
  test(`texto atinge contraste AA sobre o fundo real em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => window.scrollTo(0, 0));

    const items = await page.evaluate(() => {
      const out = [];
      for (const el of document.querySelectorAll('body *')) {
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        if (el.closest('[aria-disabled="true"], .skip-link, [aria-hidden="true"], noscript')) continue;
        const cs = getComputedStyle(el);
        // Amostra só as caixas das linhas de texto, não a caixa inteira do elemento (cantos arredondados etc.).
        const rects = [];
        for (const node of el.childNodes) {
          if (node.nodeType !== 3 || !node.textContent.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of range.getClientRects())
            if (r.width >= 2 && r.height >= 2)
              rects.push({ x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height });
        }
        if (!rects.length) continue;
        const m = cs.color.match(/[\d.]+/g).map(Number);
        const size = parseFloat(cs.fontSize);
        const bold = Number(cs.fontWeight) >= 700;
        out.push({
          label: `${el.tagName.toLowerCase()} “${el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)}”`,
          rects,
          color: m.slice(0, 3),
          alpha: m[3] ?? 1,
          min: size >= 24 || (bold && size >= 18.66) ? 3 : 4.5,
        });
      }
      return out;
    });

    await page.addStyleTag({
      content:
        '*, *::before, *::after { color: transparent !important; text-shadow: none !important; caret-color: transparent !important; }',
    });
    const shot = PNG.sync.read(await page.screenshot({ fullPage: true }));
    const failures = [];
    for (const item of items) {
      const samples = [];
      for (const rect of item.rects) {
        const x0 = Math.max(0, Math.ceil(rect.x)),
          y0 = Math.max(0, Math.ceil(rect.y));
        const x1 = Math.min(shot.width - 1, Math.floor(rect.x + rect.w) - 1);
        const y1 = Math.min(shot.height - 1, Math.floor(rect.y + rect.h) - 1);
        const stepX = Math.max(1, Math.floor((x1 - x0) / 24)),
          stepY = Math.max(1, Math.floor((y1 - y0) / 6));
        for (let y = y0; y <= y1; y += stepY)
          for (let x = x0; x <= x1; x += stepX) {
            const i = (y * shot.width + x) * 4;
            const bg = [shot.data[i], shot.data[i + 1], shot.data[i + 2]];
            const fg = item.color.map((c, k) => c * item.alpha + bg[k] * (1 - item.alpha));
            samples.push(ratio(fg, bg));
          }
      }
      if (!samples.length) continue;
      samples.sort((a, b) => a - b);
      const worst = samples[Math.floor(samples.length * 0.05)]; // ignora 5% de bordas e ruído de antialiasing
      if (worst < item.min) failures.push(`${item.label}: ${worst.toFixed(2)}:1 (mínimo ${item.min}:1)`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
}
