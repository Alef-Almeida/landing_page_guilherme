// Monta dist/ com somente o que é publicado (IMP-704) e gera _headers com os cabeçalhos de segurança e cache.
// Uso: npm run dist      → para homologação (não exige as decisões pendentes)
//      npm run release   → check:release + dist, para publicação
import { cp, mkdir, readFile, rm, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const FILES = [
  'index.html',
  'site-config.js',
  'accessibility.js',
  'tabs.js',
  'contact.js',
  'script.js',
  'styles.css',
  'favicon.ico',
  'site.webmanifest',
  'robots.txt',
  'sitemap.xml',
];
const DIRS = ['assets/img', 'assets/icons', 'assets/fonts'];
const ASSET_FILES = ['assets/guilherme-teixeira-logo.png', 'assets/paper-boat-line.png', 'assets/og-image.jpg'];

const exists = (file) =>
  stat(path.join(ROOT, file)).then(
    () => true,
    () => false,
  );

await rm(DIST, { recursive: true, force: true });
await mkdir(DIST, { recursive: true });
const copied = [];
for (const file of [...FILES, ...ASSET_FILES]) {
  if (!(await exists(file))) {
    if (['robots.txt', 'sitemap.xml'].includes(file)) continue; // só existem após `npm run seo` com domínio
    throw new Error(`Arquivo obrigatório ausente: ${file}`);
  }
  await mkdir(path.dirname(path.join(DIST, file)), { recursive: true });
  await cp(path.join(ROOT, file), path.join(DIST, file));
  copied.push(file);
}
for (const dir of DIRS) {
  await cp(path.join(ROOT, dir), path.join(DIST, dir), { recursive: true });
  copied.push(`${dir}/`);
}

// _headers: formato aceito por Netlify e Cloudflare Pages. Para outras hospedagens, ver docs/publicacao.md.
const { headers, productionOnly } = JSON.parse(await readFile(path.join(ROOT, 'security-headers.json'), 'utf8'));
const security = {
  ...headers,
  'Content-Security-Policy': headers['Content-Security-Policy'] + productionOnly['Content-Security-Policy-append'],
  'Strict-Transport-Security': productionOnly['Strict-Transport-Security'],
};
const block = (pattern, values) =>
  `${pattern}\n${Object.entries(values)
    .map(([name, value]) => `  ${name}: ${value}`)
    .join('\n')}\n`;
// Os nomes de arquivo não têm hash: HTML, CSS e JS são revalidados a cada visita; imagens e fontes ficam 7 dias.
const headersFile = [
  block('/*', security),
  block('/*.html', { 'Cache-Control': 'no-cache' }),
  block('/', { 'Cache-Control': 'no-cache' }),
  block('/*.css', { 'Cache-Control': 'no-cache' }),
  block('/*.js', { 'Cache-Control': 'no-cache' }),
  block('/assets/*', { 'Cache-Control': 'public, max-age=604800' }),
].join('\n');
await writeFile(path.join(DIST, '_headers'), headersFile);
copied.push('_headers');

console.log(`dist/ montado com: ${copied.join(', ')}`);
