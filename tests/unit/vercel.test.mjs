import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildVercelConfig } from '../../scripts/vercel-output.mjs';

const config = { site: { url: 'https://original.example/', productionHosts: ['original.example'] } };

test('prévia usa o domínio de produção no SEO e libera o contato na URL específica do deploy', () => {
  const result = buildVercelConfig(config, {
    VERCEL_PROJECT_PRODUCTION_URL: 'guilherme.example',
    VERCEL_URL: 'deploy-123.vercel.app',
  });
  assert.equal(result.site.url, 'https://guilherme.example/');
  assert.ok(result.site.productionHosts.includes('deploy-123.vercel.app'));
  assert.equal(config.site.url, 'https://original.example/');
  assert.deepEqual(config.site.productionHosts, ['original.example']);
});

test('SITE_URL permite configurar domínio próprio sem adicionar permissões genéricas', () => {
  const result = buildVercelConfig(config, {
    SITE_URL: 'https://psicologia.example/',
    VERCEL_PROJECT_PRODUCTION_URL: 'default.vercel.app',
  });
  assert.equal(result.site.url, 'https://psicologia.example/');
  assert.deepEqual(result.site.productionHosts, ['original.example', 'psicologia.example']);
});

test('build rejeita domínio ausente, HTTP e URLs com caminho ou credenciais', () => {
  assert.throws(() => buildVercelConfig(config, {}), /Domínio ausente/);
  for (const SITE_URL of ['http://example.com', 'https://example.com/path', 'https://user:pass@example.com'])
    assert.throws(() => buildVercelConfig(config, { SITE_URL }), /origem HTTPS/);
});

test('Vercel mantém os cabeçalhos de segurança usados nas demais publicações', () => {
  const policy = JSON.parse(readFileSync(new URL('../../security-headers.json', import.meta.url), 'utf8'));
  const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  const deployed = Object.fromEntries(
    vercel.headers.find((rule) => rule.source === '/(.*)').headers.map(({ key, value }) => [key, value]),
  );
  for (const [key, value] of Object.entries(policy.headers))
    assert.equal(
      deployed[key],
      key === 'Content-Security-Policy' ? value + policy.productionOnly['Content-Security-Policy-append'] : value,
    );
  assert.equal(deployed['Strict-Transport-Security'], policy.productionOnly['Strict-Transport-Security']);
});
