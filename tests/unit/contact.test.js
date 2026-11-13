// Testes unitários do contato e da agenda (IMP-600 a IMP-604). Executar com `npm run test:unit`.
// Usam somente números fictícios e funções puras: nenhuma mensagem é enviada.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const contact = require('../../contact.js');
const siteConfig = require('../../site-config.js');

const MOBILE = '5571991234567';
const LANDLINE = '557133214567';
const validConfig = (overrides = {}) => ({
  professionalName: 'Guilherme',
  site: { productionHosts: ['www.exemplo.com.br'] },
  whatsapp: { number: MOBILE, initialMessage: 'Olá.', scheduleMessage: 'Quero consultar horários.' },
  modalities: ['online'],
  schedule: { mode: 'whatsapp-only', timeZone: 'America/Bahia', days: [] },
  ...overrides,
});

describe('IMP-600 — URL do WhatsApp', () => {
  test('aceita celular e fixo brasileiros, inclusive com pontuação', () => {
    assert.equal(contact.isValidWhatsAppNumber(MOBILE), true);
    assert.equal(contact.isValidWhatsAppNumber(LANDLINE), true);
    assert.equal(contact.isValidWhatsAppNumber('+55 (71) 99123-4567'), true);
  });

  test('rejeita o placeholder do protótipo e números inválidos', () => {
    for (const value of [
      '5500000000000',
      '',
      null,
      undefined,
      '71991234567',
      '5571991234',
      '55719912345678',
      '5501991234567',
      '5571891234567',
      '5571999999999',
      '557133333333',
      '14155552671',
    ])
      assert.equal(contact.isValidWhatsAppNumber(value), false, String(value));
  });

  test('gera a URL com o número normalizado e o texto codificado', () => {
    const url = contact.buildWhatsAppUrl('+55 (71) 99123-4567', 'Olá & até já? #1\nobrigado');
    assert.equal(url, `https://wa.me/${MOBILE}?text=Ol%C3%A1%20%26%20at%C3%A9%20j%C3%A1%3F%20%231%0Aobrigado`);
    assert.equal(decodeURIComponent(new URL(url).searchParams.get('text')), 'Olá & até já? #1\nobrigado');
  });

  test('omite o parâmetro de texto quando a mensagem está vazia', () => {
    assert.equal(contact.buildWhatsAppUrl(MOBILE, '   '), `https://wa.me/${MOBILE}`);
  });

  test('recusa gerar URL para número inválido', () => {
    assert.throws(() => contact.buildWhatsAppUrl('5500000000000', 'Olá'), /inválido/);
  });
});

describe('IMP-601 — mensagem de solicitação de horário', () => {
  test('informa dia da semana, data completa, ano, horário e necessidade de confirmação', () => {
    const message = contact.buildScheduleMessage({ date: '2026-12-01', time: '09:30', modalities: [] });
    assert.equal(
      message,
      'Olá, Guilherme. Gostaria de solicitar o horário de terça-feira, 1 de dezembro de 2026, às 09:30. ' +
        'Sei que o horário ainda depende da sua confirmação.',
    );
  });

  test('inclui a modalidade quando há uma só', () => {
    const message = contact.buildScheduleMessage({ date: '2026-12-01', time: '09:30', modalities: ['online'] });
    assert.match(message, /às 09:30\. Modalidade: online\. Sei que/);
  });

  test('pede para combinar a modalidade quando há mais de uma', () => {
    const message = contact.buildScheduleMessage({
      date: '2026-12-01',
      time: '09:30',
      modalities: ['online', 'presencial'],
    });
    assert.match(message, /Gostaria de combinar a modalidade \(online ou presencial\)\./);
  });

  test('recusa data ou horário inválidos', () => {
    assert.throws(() => contact.buildScheduleMessage({ date: '2026-02-30', time: '09:00' }), /Data inválida/);
    assert.throws(() => contact.buildScheduleMessage({ date: '2026-12-01', time: '9h' }), /Horário inválido/);
  });

  test('formata as partes exibidas nos botões de dia', () => {
    assert.deepEqual(contact.getDateParts('2026-12-01'), {
      weekday: 'terça',
      day: '01',
      month: 'dez',
      long: 'terça-feira, 1 de dezembro de 2026',
    });
  });
});

describe('IMP-602 — filtragem de datas vencidas', () => {
  // 2026-11-12T12:00Z corresponde a 2026-11-12 09:00 em America/Bahia (UTC−3).
  const now = new Date('2026-11-12T12:00:00Z');
  const days = [
    { date: '2026-11-13', times: ['10:00', '08:00', '10:00'] },
    { date: '2026-11-10', times: ['09:00'] },
    { date: '2026-11-12', times: ['08:30', '09:00', '09:30'] },
  ];

  test('remove dias passados e horários já encerrados no dia atual, ordenando e sem repetir', () => {
    assert.deepEqual(contact.getUpcomingSchedule(days, { timeZone: 'America/Bahia', now }), [
      { date: '2026-11-12', times: ['09:30'] },
      { date: '2026-11-13', times: ['08:00', '10:00'] },
    ]);
  });

  test('usa o fuso configurado, não o UTC', () => {
    // 2026-11-13T02:30Z ainda é 2026-11-12 23:30 na Bahia.
    const lateNight = new Date('2026-11-13T02:30:00Z');
    const result = contact.getUpcomingSchedule([{ date: '2026-11-12', times: ['23:45', '23:00'] }], {
      timeZone: 'America/Bahia',
      now: lateNight,
    });
    assert.deepEqual(result, [{ date: '2026-11-12', times: ['23:45'] }]);
  });

  test('a agenda demonstrativa do protótipo (10 a 13/11/2026) está vencida a partir de 14/11/2026', () => {
    const prototype = ['10', '11', '12', '13'].map((day) => ({ date: `2026-11-${day}`, times: ['09:00', '17:00'] }));
    assert.deepEqual(
      contact.getUpcomingSchedule(prototype, { timeZone: 'America/Bahia', now: new Date('2026-11-14T03:00:00Z') }),
      [],
    );
  });
});

describe('IMP-603 — agenda vazia', () => {
  test('retorna lista vazia para entradas ausentes, vazias ou só com dados inválidos', () => {
    for (const days of [undefined, null, [], [{ date: '2026-13-01', times: ['09:00'] }], [{ date: '2026-12-01' }]])
      assert.deepEqual(contact.getUpcomingSchedule(days, { now: new Date('2026-11-12T12:00:00Z') }), []);
  });

  test('avisa quando a agenda manual não tem horários futuros', () => {
    const config = validConfig({
      schedule: {
        mode: 'manual-schedule',
        timeZone: 'America/Bahia',
        days: [{ date: '2020-01-01', times: ['09:00'] }],
      },
    });
    const { errors, warnings } = contact.validateConfig(config);
    assert.deepEqual(errors, []);
    assert.match(warnings.join(), /não tem horários futuros/);
  });
});

describe('IMP-604 — configuração inválida', () => {
  test('a configuração versionada não ativa contato real enquanto DEC-01 e DEC-04 estiverem pendentes', () => {
    assert.equal(contact.resolveContactState(siteConfig, 'www.exemplo.com.br'), 'unconfigured');
    assert.equal(siteConfig.schedule.mode, 'whatsapp-only');
    assert.ok(!JSON.stringify(siteConfig).includes('5500000000000'));
  });

  test('aponta número, modo, fuso, data e horário inválidos', () => {
    const { errors } = contact.validateConfig(
      validConfig({
        whatsapp: { number: '5500000000000', initialMessage: '' },
        schedule: { mode: 'agenda', timeZone: 'Lua/Base', days: [] },
      }),
    );
    assert.equal(errors.length, 4);
    const manual = contact.validateConfig(
      validConfig({
        schedule: {
          mode: 'manual-schedule',
          timeZone: 'America/Bahia',
          days: [{ date: '01/12/2026', times: ['25:00'] }],
        },
      }),
    );
    assert.match(manual.errors.join('\n'), /data inválida[\s\S]*horário inválido/);
    assert.deepEqual(contact.validateConfig(undefined).errors, ['Configuração ausente.']);
  });

  test('exige domínio de produção para publicar', () => {
    const config = validConfig({ site: { productionHosts: [] } });
    assert.deepEqual(contact.validateConfig(config).errors, []);
    assert.match(contact.validateConfig(config, { release: true }).errors.join(), /productionHosts/);
  });

  test('só ativa o link no domínio de produção', () => {
    const config = validConfig();
    assert.equal(contact.resolveContactState(config, 'www.exemplo.com.br'), 'enabled');
    assert.equal(contact.resolveContactState(config, 'localhost'), 'test-environment');
    assert.equal(contact.resolveContactState(config, '127.0.0.1'), 'test-environment');
    assert.equal(
      contact.resolveContactState(
        validConfig({ whatsapp: { number: '', initialMessage: 'Olá.' } }),
        'www.exemplo.com.br',
      ),
      'unconfigured',
    );
  });

  test('escapa texto livre da configuração antes de inserir no HTML', () => {
    assert.equal(contact.escapeHtml('<img src=x onerror="a">'), '&lt;img src=x onerror=&quot;a&quot;&gt;');
  });
});
