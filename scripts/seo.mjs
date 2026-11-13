// Metadados que dependem do domínio (IMP-504, IMP-505, IMP-506): canonical, og:url, og:image e
// twitter:image absolutos no index.html, além de robots.txt e sitemap.xml.
// Uso: npm run seo           → grava os arquivos a partir de site.url (site-config.js)
//      npm run seo -- --check → só confere se estão atualizados (usado por check:release)
import { createRequire } from 'node:module';
import { readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const START = /(<!-- seo:dominio:inicio[^>]*-->)[\s\S]*?(\s*<!-- seo:dominio:fim -->)/;
const OG_IMAGE = { path: 'assets/og-image.jpg', width: 1200, height: 630 };

export function buildSeo(config, html, today = new Date().toISOString().slice(0, 10)) {
  const url = String(config.site?.url ?? '');
  if (!url) return { html: html.replace(START, '$1$2'), files: { 'robots.txt': null, 'sitemap.xml': null } };
  const image = new URL(OG_IMAGE.path, url).href;
  const tags = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="Guilherme Teixeira, psicólogo clínico: cuidar da mente é abrir espaço para novas possibilidades." />`,
    `<meta name="twitter:image" content="${image}" />`,
  ]
    .map((tag) => `\n    ${tag}`)
    .join('');
  return {
    html: html.replace(START, `$1${tags}$2`),
    files: {
      'robots.txt': `User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap.xml', url).href}\n`,
      'sitemap.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${url}</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n</urlset>\n`,
    },
  };
}

const readOrNull = (file) => readFile(path.join(ROOT, file), 'utf8').catch(() => null);

export async function checkSeo(config) {
  const html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
  const sitemap = await readOrNull('sitemap.xml');
  const lastmod = sitemap?.match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
  const expected = buildSeo(config, html, lastmod);
  const problems = [];
  if (expected.html !== html) problems.push('index.html: metadados de domínio desatualizados. Rode `npm run seo`.');
  for (const [file, content] of Object.entries(expected.files))
    if ((await readOrNull(file)) !== content)
      problems.push(
        `${file}: ${content === null ? 'não deveria existir sem site.url' : 'ausente ou desatualizado'}. Rode \`npm run seo\`.`,
      );
  return problems;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = require('../site-config.js');
  if (process.argv.includes('--check')) {
    const problems = await checkSeo(config);
    for (const p of problems) console.error(`✗ ${p}`);
    if (problems.length) process.exit(1);
    console.log('✓ Metadados de domínio atualizados');
  } else {
    const html = await readFile(path.join(ROOT, 'index.html'), 'utf8');
    const result = buildSeo(config, html);
    await writeFile(path.join(ROOT, 'index.html'), result.html);
    for (const [file, content] of Object.entries(result.files)) {
      if (content === null) await rm(path.join(ROOT, file), { force: true });
      else await writeFile(path.join(ROOT, file), content);
    }
    console.log(
      config.site?.url
        ? `✓ SEO gerado para ${config.site.url}`
        : '• site.url vazio: nenhum metadado de domínio gerado (DEC-04).',
    );
  }
}
