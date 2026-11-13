// Testes do gerador de metadados de domínio (IMP-504 a IMP-506) e das exigências de publicação.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { buildSeo } from '../../scripts/seo.mjs';

const require = createRequire(import.meta.url);
const contact = require('../../contact.js');
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

describe('gerador de SEO', () => {
  test('sem site.url não gera canonical, robots.txt nem sitemap.xml', () => {
    const result = buildSeo({ site: { url: '' } }, html);
    assert.equal(result.html, html);
    assert.deepEqual(result.files, { 'robots.txt': null, 'sitemap.xml': null });
  });

  test('com site.url gera metadados absolutos, robots.txt e sitemap.xml', () => {
    const url = 'https://www.exemplo.com.br/';
    const result = buildSeo({ site: { url } }, html, '2026-11-13');
    assert.match(result.html, /<link rel="canonical" href="https:\/\/www\.exemplo\.com\.br\/" \/>/);
    assert.match(
      result.html,
      /<meta property="og:image" content="https:\/\/www\.exemplo\.com\.br\/assets\/og-image\.jpg" \/>/,
    );
    assert.match(result.html, /<meta property="og:url" content="https:\/\/www\.exemplo\.com\.br\/" \/>/);
    assert.equal(
      result.files['robots.txt'],
      'User-agent: *\nAllow: /\n\nSitemap: https://www.exemplo.com.br/sitemap.xml\n',
    );
    assert.match(
      result.files['sitemap.xml'],
      /<loc>https:\/\/www\.exemplo\.com\.br\/<\/loc>\s*<lastmod>2026-11-13<\/lastmod>/,
    );
    // gerar de novo sobre o resultado não duplica as tags
    assert.equal(buildSeo({ site: { url } }, result.html, '2026-11-13').html, result.html);
  });
});

describe('exigências de publicação', () => {
  const base = {
    professionalName: 'Guilherme',
    whatsapp: { number: '5571991234567', initialMessage: 'Olá.' },
    modalities: ['online'],
    schedule: { mode: 'whatsapp-only', timeZone: 'America/Bahia', days: [] },
  };

  test('exige site.url com https, barra final e domínio presente em productionHosts', () => {
    const errorsFor = (site) => contact.validateConfig({ ...base, site }, { release: true }).errors.join('\n');
    assert.match(errorsFor({ productionHosts: ['www.exemplo.com.br'], url: '' }), /site\.url/);
    assert.match(
      errorsFor({ productionHosts: ['www.exemplo.com.br'], url: 'http://www.exemplo.com.br/' }),
      /site\.url/,
    );
    assert.match(
      errorsFor({ productionHosts: ['www.exemplo.com.br'], url: 'https://www.exemplo.com.br' }),
      /site\.url/,
    );
    assert.match(
      errorsFor({ productionHosts: ['outro.com.br'], url: 'https://www.exemplo.com.br/' }),
      /precisa constar/,
    );
    assert.equal(errorsFor({ productionHosts: ['www.exemplo.com.br'], url: 'https://www.exemplo.com.br/' }), '');
  });
});
