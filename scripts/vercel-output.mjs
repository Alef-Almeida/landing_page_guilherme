// Ajusta somente dist/ ao domínio fornecido pela Vercel; a configuração local fica intacta.
import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSeo } from './seo.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);

function publicOrigin(value) {
  const raw = String(value).trim();
  const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
    throw new Error('O domínio de publicação precisa ser uma origem HTTPS, sem caminho ou credenciais.');
  return url;
}

export function buildVercelConfig(config, env) {
  const domain = env.SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  if (!domain) throw new Error('Domínio ausente: a Vercel deve fornecer VERCEL_PROJECT_PRODUCTION_URL ou SITE_URL.');
  const origin = publicOrigin(domain);
  const hosts = [origin.hostname];
  for (const domain of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) if (domain) hosts.push(publicOrigin(domain).hostname);
  return {
    ...config,
    site: {
      ...config.site,
      url: `${origin.origin}/`,
      productionHosts: [...new Set([...(config.site.productionHosts || []), ...hosts])],
    },
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const config = buildVercelConfig(require('../site-config.js'), process.env);
  const { errors } = require('../contact.js').validateConfig(config, { release: true });
  if (errors.length) throw new Error(errors.join('\n'));
  const dist = path.join(ROOT, 'dist');
  const html = await readFile(path.join(dist, 'index.html'), 'utf8');
  const seo = buildSeo(config, html);
  await writeFile(path.join(dist, 'index.html'), seo.html);
  for (const [file, content] of Object.entries(seo.files)) await writeFile(path.join(dist, file), content);
  const runtime = `// Gerado durante o build da Vercel.\n(function (root) {\n  const config = ${JSON.stringify(config, null, 2)};\n  if (typeof module === 'object' && module.exports) module.exports = config;\n  else root.SITE_CONFIG = config;\n})(typeof self !== 'undefined' ? self : this);\n`;
  await writeFile(path.join(dist, 'site-config.js'), runtime);
  console.log(`Publicação Vercel preparada para ${config.site.url}`);
}
