/*
 * Contato pelo WhatsApp e agenda.
 *
 * As funções puras (validação, URLs, mensagens e datas) são testadas em tests/unit.
 * `initContactFlow` aplica o resultado à página. Sem configuração válida, ou fora dos
 * domínios de produção, nenhum link externo é gerado: os botões ficam desativados
 * com uma explicação visível.
 *
 * Carregado como script clássico (window.ContactFlow) e exportado para o Node.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ContactFlow = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SCHEDULE_MODES = ['whatsapp-only', 'manual-schedule'];
  // DDI 55 + DDD (dois dígitos, sem zero) + celular (9 + 8 dígitos) ou fixo (8 dígitos iniciados em 2–5).
  const BR_WHATSAPP = /^55[1-9]{2}(?:9\d{8}|[2-5]\d{7})$/;
  const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
  const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;

  const STATUS_MESSAGES = {
    unconfigured: 'O contato pelo WhatsApp está temporariamente indisponível.',
    'test-environment': 'Ambiente de teste: o link do WhatsApp fica desativado aqui para não enviar mensagens reais.',
  };

  function normalizePhone(value) {
    return String(value ?? '').replace(/\D/g, '');
  }

  function isValidWhatsAppNumber(value) {
    const digits = normalizePhone(value);
    if (!BR_WHATSAPP.test(digits)) return false;
    // Rejeita números de exemplo com um único dígito repetido, como 99999-9999.
    return !/^9?(\d)\1+$/.test(digits.slice(4));
  }

  function buildWhatsAppUrl(number, message) {
    if (!isValidWhatsAppNumber(number)) throw new Error('Número de WhatsApp inválido.');
    const text = String(message ?? '').trim();
    return `https://wa.me/${normalizePhone(number)}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
  }

  function parseIsoDate(value) {
    const match = ISO_DATE.exec(String(value ?? ''));
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const date = new Date(Date.UTC(year, month - 1, day, 12));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
    return date;
  }

  function isValidTime(value) {
    return TIME.test(String(value ?? ''));
  }

  function formatLongDate(isoDate) {
    const date = parseIsoDate(isoDate);
    if (!date) throw new Error(`Data inválida: ${isoDate}`);
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }

  function getDateParts(isoDate) {
    const date = parseIsoDate(isoDate);
    if (!date) throw new Error(`Data inválida: ${isoDate}`);
    const format = (options) => new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: 'UTC' }).format(date);
    return {
      weekday: format({ weekday: 'long' }).replace('-feira', ''),
      day: format({ day: '2-digit' }),
      month: format({ month: 'short' }).replace('.', ''),
      long: formatLongDate(isoDate),
    };
  }

  function describeModalities(modalities) {
    const list = (Array.isArray(modalities) ? modalities : []).map((m) => String(m).trim()).filter(Boolean);
    if (list.length <= 1) return list[0] || '';
    return `${list.slice(0, -1).join(', ')} ou ${list[list.length - 1]}`;
  }

  function buildScheduleMessage({ professionalName = 'Guilherme', date, time, modalities = [] }) {
    if (!isValidTime(time)) throw new Error(`Horário inválido: ${time}`);
    const list = (Array.isArray(modalities) ? modalities : []).filter(Boolean);
    let modalityText = '';
    if (list.length === 1) modalityText = ` Modalidade: ${list[0]}.`;
    else if (list.length > 1) modalityText = ` Gostaria de combinar a modalidade (${describeModalities(list)}).`;
    return (
      `Olá, ${professionalName}. Gostaria de solicitar o horário de ${formatLongDate(date)}, às ${time}.` +
      `${modalityText} Sei que o horário ainda depende da sua confirmação.`
    );
  }

  function getNowInTimeZone(timeZone, now = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const get = (type) => parts.find((part) => part.type === type).value;
    return { date: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}` };
  }

  // Mantém somente datas e horários válidos e futuros no fuso informado, em ordem e sem repetição.
  function getUpcomingSchedule(days, { timeZone = 'America/Bahia', now = new Date() } = {}) {
    const current = getNowInTimeZone(timeZone, now);
    return (Array.isArray(days) ? days : [])
      .filter((day) => day && parseIsoDate(day.date) && day.date >= current.date)
      .map((day) => ({
        date: day.date,
        times: [...new Set((Array.isArray(day.times) ? day.times : []).filter(isValidTime))]
          .sort()
          .filter((time) => day.date > current.date || time > current.time),
      }))
      .filter((day) => day.times.length > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Erros impedem o contato; `release: true` acrescenta as exigências de publicação.
  function validateConfig(config, { release = false } = {}) {
    const errors = [];
    const warnings = [];
    if (!config || typeof config !== 'object') return { errors: ['Configuração ausente.'], warnings };

    if (!isValidWhatsAppNumber(config.whatsapp?.number))
      errors.push('whatsapp.number: informe o número profissional com DDI 55 e DDD (DEC-01).');
    if (!String(config.whatsapp?.initialMessage ?? '').trim()) errors.push('whatsapp.initialMessage está vazio.');

    const schedule = config.schedule ?? {};
    if (!SCHEDULE_MODES.includes(schedule.mode))
      errors.push(`schedule.mode deve ser ${SCHEDULE_MODES.map((m) => `'${m}'`).join(' ou ')}.`);
    try {
      new Intl.DateTimeFormat('en-CA', { timeZone: schedule.timeZone });
    } catch {
      errors.push(`schedule.timeZone inválido: ${schedule.timeZone}.`);
    }
    if (schedule.mode === 'manual-schedule') {
      for (const day of Array.isArray(schedule.days) ? schedule.days : []) {
        if (!parseIsoDate(day?.date)) errors.push(`schedule.days: data inválida ${JSON.stringify(day?.date)}.`);
        for (const time of Array.isArray(day?.times) ? day.times : [])
          if (!isValidTime(time))
            errors.push(`schedule.days: horário inválido ${JSON.stringify(time)} em ${day?.date}.`);
      }
      if (!errors.length && !getUpcomingSchedule(schedule.days, { timeZone: schedule.timeZone }).length)
        warnings.push('schedule.days não tem horários futuros: a página mostrará somente a consulta pelo WhatsApp.');
    }

    if (release) {
      const hosts = config.site?.productionHosts;
      if (!Array.isArray(hosts) || !hosts.length)
        errors.push('site.productionHosts: informe o domínio oficial (DEC-04); sem ele o link fica desativado.');
      const siteUrl = String(config.site?.url ?? '');
      let parsed = null;
      try {
        parsed = new URL(siteUrl);
      } catch {
        parsed = null;
      }
      if (!parsed || parsed.protocol !== 'https:' || !siteUrl.endsWith('/'))
        errors.push(
          "site.url: informe o endereço público com https e barra final, por exemplo 'https://www.dominio.com.br/' (DEC-04).",
        );
      else if (Array.isArray(hosts) && hosts.length && !hosts.includes(parsed.hostname))
        errors.push(`site.url: o domínio ${parsed.hostname} precisa constar em site.productionHosts.`);
      if (!Array.isArray(config.modalities) || !config.modalities.length)
        warnings.push('modalities está vazio: a página não informará a modalidade de atendimento (DEC-03).');
    }
    return { errors, warnings };
  }

  // 'enabled' | 'unconfigured' | 'test-environment'
  function resolveContactState(config, hostname) {
    if (validateConfig(config).errors.length) return 'unconfigured';
    const hosts = config.site?.productionHosts ?? [];
    return hosts.includes(hostname) ? 'enabled' : 'test-environment';
  }

  function escapeHtml(value) {
    return String(value).replace(
      /[&<>"']/g,
      (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
    );
  }

  // ---------------------------------------------------------------------------
  // Página
  // ---------------------------------------------------------------------------

  function applyCta(link, url, state) {
    if (state === 'enabled') {
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.removeAttribute('aria-disabled');
      link.removeAttribute('data-whatsapp-preview');
      return;
    }
    link.removeAttribute('href');
    link.removeAttribute('target');
    link.setAttribute('aria-disabled', 'true');
    if (url) link.dataset.whatsappPreview = url;
    else link.removeAttribute('data-whatsapp-preview');
  }

  function showStatus(container, state) {
    const status = container?.querySelector('[data-whatsapp-status]');
    if (!status) return;
    status.textContent = STATUS_MESSAGES[state] ?? '';
    status.hidden = state === 'enabled';
  }

  function safeUrl(config, message) {
    try {
      return buildWhatsAppUrl(config.whatsapp.number, message);
    } catch {
      return '';
    }
  }

  // Dias como abas (IMP-324 a IMP-327): a lista de dias é montada uma vez e só o painel de horários
  // é atualizado ao trocar de dia, preservando o foco e a operação por teclado.
  function renderManualSchedule(scheduleElement, upcoming, config, state) {
    const modalities = describeModalities(config.modalities);
    scheduleElement.innerHTML = `<div class="schedule-layout"><div class="schedule-days">${upcoming
      .map((item, index) => {
        const p = getDateParts(item.date);
        return `<button type="button" class="schedule-day" id="schedule-day-${index}" aria-controls="schedule-panel" aria-label="${escapeHtml(p.long)}"><span>${p.weekday}</span><strong>${p.day}</strong><small>${p.month}</small></button>`;
      })
      .join(
        '',
      )}</div><div class="schedule-panel" id="schedule-panel" role="tabpanel"><div class="schedule-panel-head"><div><span class="eyebrow">Horários publicados</span><h3 data-schedule-day-title></h3></div>${
      modalities ? `<span class="schedule-status">${escapeHtml(modalities)}</span>` : ''
    }</div><div class="schedule-slots" data-schedule-slots></div><p class="whatsapp-status" data-whatsapp-status hidden></p><p class="schedule-confirmation">Enviar a solicitação não reserva o horário: a consulta só é marcada após a confirmação pelo WhatsApp.</p></div></div>`;

    const panel = scheduleElement.querySelector('#schedule-panel');
    const title = panel.querySelector('[data-schedule-day-title]');
    const slots = panel.querySelector('[data-schedule-slots]');
    const days = [...scheduleElement.querySelectorAll('.schedule-day')];

    const showDay = (index) => {
      const selected = upcoming[index];
      title.textContent = getDateParts(selected.date).long;
      panel.setAttribute('aria-labelledby', days[index].id);
      slots.innerHTML = selected.times
        .map(
          (time) =>
            `<a class="schedule-slot" data-whatsapp-cta="slot" data-slot-time="${time}"><span>${time}</span><span>Solicitar horário <b aria-hidden="true">↗</b></span></a>`,
        )
        .join('');
      slots.querySelectorAll('[data-slot-time]').forEach((link) => {
        const message = buildScheduleMessage({
          professionalName: config.professionalName,
          date: selected.date,
          time: link.dataset.slotTime,
          modalities: config.modalities,
        });
        applyCta(link, safeUrl(config, message), state);
      });
    };

    globalThis.Tabs.setupTabs({
      tablist: scheduleElement.querySelector('.schedule-days'),
      tabs: days,
      label: 'Dias com horários publicados',
      onSelect: showDay,
    });
    showStatus(panel, state);
  }

  function initContactFlow({ document, config, hostname, now = new Date() }) {
    const { errors, warnings } = validateConfig(config);
    const state = resolveContactState(config, hostname);
    if (errors.length) console.warn(`[contato] Configuração incompleta:\n- ${errors.join('\n- ')}`);
    if (warnings.length) console.warn(`[contato] ${warnings.join('\n')}`);

    const general = document.querySelector('[data-whatsapp-cta="general"]');
    if (general) {
      applyCta(general, safeUrl(config, config?.whatsapp?.initialMessage), state);
      showStatus(general.parentElement, state);
    }

    const consult = document.querySelector('[data-whatsapp-cta="schedule"]');
    if (consult) {
      applyCta(consult, safeUrl(config, config?.whatsapp?.scheduleMessage), state);
      showStatus(consult.parentElement, state);
    }

    const scheduleElement = document.getElementById('schedule');
    const schedule = config?.schedule ?? {};
    if (!scheduleElement || schedule.mode !== 'manual-schedule') return state;

    const upcoming = getUpcomingSchedule(schedule.days, { timeZone: schedule.timeZone, now });
    if (!upcoming.length) {
      const text = scheduleElement.querySelector('[data-schedule-consult-text]');
      if (text)
        text.textContent =
          'No momento não há horários publicados. Envie uma mensagem para consultar a disponibilidade.';
      return state;
    }

    const title = document.querySelector('[data-schedule-title]');
    if (title) title.innerHTML = 'Escolha um horário<br class="hidden sm:block" /> para começar a conversa.';
    const note = document.querySelector('[data-schedule-note]');
    if (note) note.textContent = 'Horários sujeitos à confirmação pelo WhatsApp';
    renderManualSchedule(scheduleElement, upcoming, config, state);
    return state;
  }

  return {
    SCHEDULE_MODES,
    STATUS_MESSAGES,
    normalizePhone,
    isValidWhatsAppNumber,
    buildWhatsAppUrl,
    parseIsoDate,
    isValidTime,
    formatLongDate,
    getDateParts,
    describeModalities,
    buildScheduleMessage,
    getNowInTimeZone,
    getUpcomingSchedule,
    validateConfig,
    resolveContactState,
    escapeHtml,
    initContactFlow,
  };
});
