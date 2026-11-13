// FR-03C — layout responsivo (IMP-343, IMP-345 a IMP-350, IMP-617, IMP-625, IMP-627, IMP-628).
const { test, expect } = require('@playwright/test');

// 640 px equivale a 1280 px com zoom de 200%.
const WIDTHS = [320, 375, 390, 640, 768, 1024, 1280, 1440];

const prepare = async (page, width, height = 900) => {
  await page.setViewportSize({ width, height });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() =>
    Promise.all(
      ['400', '500', '600', '700']
        .flatMap((w) => [`${w} 16px Inter`, `${w} 16px "DM Sans"`])
        .map((font) => document.fonts.load(font)),
    ),
  );
};

for (const width of WIDTHS) {
  test(`nenhum conteúdo fica cortado ou fora da tela em ${width}px (IMP-617, IMP-348)`, async ({ page }) => {
    await prepare(page, width);
    const problems = await page.evaluate(() => {
      const out = [];
      const vw = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth > vw)
        out.push(`rolagem horizontal: ${document.documentElement.scrollWidth}px`);
      const content = document.querySelectorAll('h1, h2, h3, p, li, a, button, summary, strong, img, label');
      for (const el of content) {
        if (!el.checkVisibility() || el.closest('[aria-hidden="true"]')) continue;
        let { left, right, top, bottom } = el.getBoundingClientRect();
        const full = { left, right };
        for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
          const cs = getComputedStyle(a);
          if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
          const r = a.getBoundingClientRect();
          left = Math.max(left, r.left);
          right = Math.min(right, r.right);
          top = Math.max(top, r.top);
          bottom = Math.min(bottom, r.bottom);
        }
        const name = `${el.tagName.toLowerCase()} “${(el.textContent || el.alt || '').trim().slice(0, 30)}”`;
        if (right - left <= 0) continue; // totalmente recortado por decisão de layout (por exemplo, slides)
        if (full.left < left - 1 || full.right > right + 1) out.push(`${name} recortado por um contêiner`);
        if (left < -1 || right > vw + 1) out.push(`${name} fora da tela (${Math.round(left)}–${Math.round(right)})`);
      }
      return out;
    });
    expect(problems).toEqual([]);
  });
}

test('logotipo mantém a proporção natural em todas as larguras (IMP-343, IMP-628)', async ({ page }) => {
  for (const width of WIDTHS) {
    await prepare(page, width);
    const { natural, rendered } = await page.locator('.brand-logo').evaluate((img) => ({
      natural: img.naturalWidth / img.naturalHeight,
      rendered: img.getBoundingClientRect().width / img.getBoundingClientRect().height,
    }));
    expect(Math.abs(rendered / natural - 1), `${width}px`).toBeLessThan(0.02);
  }
});

for (const width of [768, 1024, 1280]) {
  test(`cabeçalho em ${width}px: itens sem colisão e botão em uma linha (IMP-345)`, async ({ page }) => {
    await prepare(page, width);
    const boxes = await page.evaluate(() =>
      [
        'header a[aria-label="Voltar ao início"]',
        'header nav[aria-label="Navegação principal"]',
        'header a[href="#contato"].rounded-full',
        '#menu-toggle',
      ]
        .map((sel) => document.querySelector(sel))
        .filter((el) => el && el.checkVisibility())
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, height: r.height };
        }),
    );
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].left).toBeGreaterThanOrEqual(boxes[i - 1].right);
    const cta = page.locator('header a[href="#contato"].rounded-full');
    expect((await cta.boundingBox()).height).toBeLessThanOrEqual(48);
  });
}

for (const width of [320, 390, 1440]) {
  test(`card do hero não excede o contêiner em ${width}px (IMP-347, IMP-628)`, async ({ page }) => {
    await prepare(page, width);
    // offsetWidth é a largura de layout; a caixa visual é maior por causa da rotação decorativa de 2,2°.
    const { card, parent, rotatedOverflow } = await page.locator('.instagram-card').evaluate((el) => {
      const section = el.closest('section').getBoundingClientRect();
      const visual = el.getBoundingClientRect();
      return {
        card: el.offsetWidth,
        parent: el.parentElement.clientWidth,
        rotatedOverflow: visual.left < section.left || visual.right > section.right,
      };
    });
    expect(rotatedOverflow).toBe(false);
    expect(card).toBeLessThanOrEqual(parent + 0.5);
  });
}

test('alvos de toque principais têm ao menos 44 × 44 px no mobile (IMP-341)', async ({ page }) => {
  await prepare(page, 390);
  const small = await page.evaluate(() =>
    [...document.querySelectorAll('a[href], button')]
      .filter((el) => el.checkVisibility() && !el.classList.contains('skip-link'))
      .map((el) => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.height < 43.5 || r.width < 43.5)
      .map(
        ({ el, r }) =>
          `${el.textContent.trim().slice(0, 30) || el.getAttribute('aria-label')} (${Math.round(r.width)}×${Math.round(r.height)})`,
      ),
  );
  expect(small).toEqual([]);
});

test('foco visível em fundo claro e escuro (IMP-342)', async ({ page }) => {
  await prepare(page, 1280);
  const outline = async (selector) => {
    await page.locator(selector).first().focus();
    return page
      .locator(selector)
      .first()
      .evaluate((el) => {
        const cs = getComputedStyle(el);
        return { style: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor };
      });
  };
  expect(await outline('.nav-link')).toEqual({ style: 'solid', width: '2px', color: 'rgb(23, 50, 77)' });
  expect(await outline('#conteudos .content-card a')).toEqual({
    style: 'solid',
    width: '2px',
    color: 'rgb(245, 183, 156)',
  });
});

test.describe('regressão visual (IMP-625, IMP-627)', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Referências geradas no Chromium');
  for (const width of [320, 390, 1440])
    test(`hero em ${width}px`, async ({ page }) => {
      await prepare(page, width);
      await expect(page.locator('main > section').first()).toHaveScreenshot(`hero-${width}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });
    });

  for (const width of [768, 1024])
    test(`cabeçalho em ${width}px`, async ({ page }) => {
      await prepare(page, width);
      await expect(page.locator('header')).toHaveScreenshot(`cabecalho-${width}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });
    });
});
