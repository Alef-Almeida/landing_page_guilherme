// Testes de quebra (unitários): entradas hostis ou malformadas nas funções puras.
// Cada teste afirma o comportamento CORRETO; uma falha aqui indica um defeito encontrado.
// Uso: node --test tests/quebra/
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const C = require('../../contact.js');
const A = require('../../accessibility.js');

const NUMBER = '5571991234567'; // fictício
const config = (overrides = {}) => ({
  professionalName: 'Guilherme',
  site: { url: '', productionHosts: [] },
  whatsapp: { number: NUMBER, initialMessage: 'Olá', scheduleMessage: 'Horários' },
  modalities: [],
  schedule: { mode: 'whatsapp-only', timeZone: 'America/Bahia', days: [] },
  ...overrides,
});

describe('contato: domínio de produção', () => {
  test('productionHosts como string não habilita o link por substring', () => {
    const cfg = config({ site: { productionHosts: 'www.dominio.com.br' } });
    // String.prototype.includes faz busca de substring: "com.br", "dominio.com.br" e "" (file://) casam.
    assert.notEqual(C.resolveContactState(cfg, 'com.br'), 'enabled');
    assert.notEqual(C.resolveContactState(cfg, ''), 'enabled');
    assert.ok(C.validateConfig(cfg).errors.length > 0, 'validateConfig deveria acusar productionHosts que não é lista');
  });

  test('productionHosts com maiúsculas casa com o hostname (sempre minúsculo no navegador)', () => {
    const cfg = config({ site: { productionHosts: ['WWW.Dominio.com.br'] } });
    assert.equal(C.resolveContactState(cfg, 'www.dominio.com.br'), 'enabled');
  });

  test('check:release rejeita host com protocolo, barra ou porta em productionHosts', () => {
    const cfg = config({
      modalities: ['online'],
      site: { url: 'https://www.dominio.com.br/', productionHosts: ['www.dominio.com.br', 'https://dominio.com.br/'] },
    });
    assert.ok(
      C.validateConfig(cfg, { release: true }).errors.some((e) => /productionHosts/.test(e)),
      '"https://dominio.com.br/" nunca será igual a location.hostname: o domínio sem www fica desativado em produção',
    );
  });
});

describe('contato: agenda manual', () => {
  const now = new Date('2030-01-01T12:00:00Z');

  test('datas repetidas são mescladas (senão viram duas abas com o mesmo nome)', () => {
    const upcoming = C.getUpcomingSchedule(
      [
        { date: '2030-02-01', times: ['09:00'] },
        { date: '2030-02-01', times: ['10:00'] },
      ],
      { now },
    );
    assert.deepEqual(upcoming, [{ date: '2030-02-01', times: ['09:00', '10:00'] }]);
  });

  test('times como string (erro comum de digitação) é acusado na validação', () => {
    const cfg = config({
      schedule: { mode: 'manual-schedule', timeZone: 'America/Bahia', days: [{ date: '2030-02-01', times: '09:00' }] },
    });
    assert.ok(C.validateConfig(cfg).errors.length > 0, 'o horário some em silêncio, só sobra um aviso genérico');
  });

  test('fuso inválido não derruba initContactFlow (validateConfig já o acusou)', () => {
    assert.doesNotThrow(() =>
      C.getUpcomingSchedule([{ date: '2030-02-01', times: ['09:00'] }], { timeZone: 'Marte/Base', now }),
    );
  });

  test('a modalidade única é normalizada como na lista (sem espaços sobrando)', () => {
    const message = C.buildScheduleMessage({ date: '2030-02-01', time: '09:00', modalities: ['  online '] });
    assert.match(message, /Modalidade: online\./);
  });

  test('professionalName vazio ou nulo não gera "Olá, ." nem "Olá, null."', () => {
    for (const professionalName of ['', null]) {
      const message = C.buildScheduleMessage({ professionalName, date: '2030-02-01', time: '09:00' });
      assert.doesNotMatch(message, /^Olá, (null)?\./);
    }
  });

  test('virada de ano e fuso: 23:30 em Salvador ainda é o dia anterior', () => {
    const late = new Date('2030-01-02T02:30:00Z'); // 23:30 de 01/01 em America/Bahia (UTC−3)
    const upcoming = C.getUpcomingSchedule([{ date: '2030-01-01', times: ['23:45', '23:00'] }], { now: late });
    assert.deepEqual(upcoming, [{ date: '2030-01-01', times: ['23:45'] }]);
  });

  test('1000 dias e horários repetidos são processados rápido e sem duplicatas', () => {
    const days = Array.from({ length: 1000 }, (_, i) => ({
      date: new Date(Date.UTC(2030, 0, 2 + i)).toISOString().slice(0, 10),
      times: ['09:00', '09:00', '08:00', 'xx', null, '25:00'],
    }));
    const started = performance.now();
    const upcoming = C.getUpcomingSchedule(days, { now });
    assert.ok(performance.now() - started < 500);
    assert.equal(upcoming.length, 1000);
    assert.deepEqual(upcoming[0].times, ['08:00', '09:00']);
  });
});

describe('contato: entradas hostis', () => {
  test('escapeHtml neutraliza todos os caracteres perigosos', () => {
    assert.equal(
      C.escapeHtml(`<img src=x onerror='a("b")'>&`),
      '&lt;img src=x onerror=&#39;a(&quot;b&quot;)&#39;&gt;&amp;',
    );
  });

  test('a URL do WhatsApp codifica &, ?, # e emoji na mensagem', () => {
    const url = new URL(C.buildWhatsAppUrl(NUMBER, 'a & b ? c # d 👋'));
    assert.equal(url.searchParams.get('text'), 'a & b ? c # d 👋');
    assert.equal(url.hash, '');
  });

  test('configurações absurdas não lançam exceção', () => {
    for (const bad of [null, undefined, 0, '', [], { whatsapp: null, schedule: null, site: null }]) {
      assert.doesNotThrow(() => C.validateConfig(bad, { release: true }));
      assert.doesNotThrow(() => C.resolveContactState(bad, 'localhost'));
    }
  });
});

describe('preferências de acessibilidade: armazenamento corrompido', () => {
  const storageWith = (value) => ({ getItem: () => value, setItem() {}, removeItem() {} });

  test('JSON inválido, tipos errados e protótipo poluído voltam ao padrão', () => {
    for (const raw of [
      '{',
      'null',
      '"texto"',
      '[1,2]',
      '{"texto":"200","fonte":"comic","contraste":"true"}',
      '{"__proto__":{"contraste":true},"constructor":{"prototype":{"x":1}}}',
      'x'.repeat(5_000_000),
    ]) {
      assert.deepEqual(A.readPrefs(storageWith(raw)), { ...A.DEFAULTS }, raw.slice(0, 40));
    }
    assert.equal({}.contraste, undefined);
  });

  test('cota cheia ao salvar não lança e informa que não salvou', () => {
    const full = {
      setItem() {
        throw new DOMException('quota', 'QuotaExceededError');
      },
      removeItem() {},
    };
    assert.equal(A.savePrefs(full, { ...A.DEFAULTS, contraste: true }), false);
  });
});

describe('gerador de SEO: URL com caracteres especiais', () => {
  const html = '<head>\n    <!-- seo:dominio:inicio — x -->\n    <!-- seo:dominio:fim -->\n</head>';
  const load = () => import(pathToFileURL(path.join(__dirname, '../../scripts/seo.mjs')).href);
  const withUrl = (url) => config({ modalities: ['online'], site: { url, productionHosts: ['exemplo.com.br'] } });

  test("'$&' e \"$'\" na URL não corrompem o index.html (padrões especiais de String.replace)", async () => {
    const { buildSeo } = await load();
    for (const url of ['https://exemplo.com.br/$&/', "https://exemplo.com.br/$'/"]) {
      const out = buildSeo(withUrl(url), html, '2030-01-01').html;
      assert.ok(out.includes(`<link rel="canonical" href="${C.escapeHtml(url)}" />`), out);
      assert.ok(!out.includes('seo:dominio:inicio — x -->/'), 'o marcador foi duplicado dentro da URL');
    }
  });

  test('aspas e & na URL são escapadas no HTML e no sitemap.xml', async () => {
    const { buildSeo } = await load();
    const out = buildSeo(withUrl('https://exemplo.com.br/a"b&c/'), html, '2030-01-01');
    assert.doesNotMatch(out.html, /href="[^"]*"b/);
    assert.doesNotMatch(out.files['sitemap.xml'], /&c/);
  });

  test('check:release recusa URL fora da forma normalizada e aceita caracteres válidos como $', () => {
    for (const url of ['https://exemplo.com.br/a"b/', 'https://EXEMPLO.com.br/', 'https://exemplo.com.br/a b/']) {
      assert.ok(C.validateConfig(withUrl(url), { release: true }).errors.length > 0, url);
    }
    assert.deepEqual(C.validateConfig(withUrl('https://exemplo.com.br/$&/'), { release: true }).errors, []);
  });
});
