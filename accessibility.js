/*
 * Preferências de acessibilidade (IMP-802 a IMP-809) e tradutor de Libras VLibras (IMP-810).
 *
 * Carregado no <head>, de forma síncrona, para aplicar as preferências salvas antes da primeira
 * pintura (sem "piscar" o visual padrão). O painel e o botão do VLibras são ligados depois que o
 * HTML termina de carregar. As funções puras são testadas em tests/unit.
 *
 * As preferências ficam só neste navegador (localStorage) e nunca saem dele. O VLibras é um
 * serviço do Governo Federal: o script dele só é baixado quando a pessoa pede a tradução.
 *
 * Carregado como script clássico (window.Acessibilidade) e exportado para o Node.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    root.Acessibilidade = api;
    api.boot(root);
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'acessibilidade';
  const TEXT_STEPS = [100, 125, 150, 175, 200];
  const FONTS = ['padrao', 'legivel', 'dislexia'];
  const SWITCHES = ['contraste', 'espacamento', 'links', 'pausar', 'guia'];
  const DEFAULTS = Object.freeze({
    texto: 100,
    fonte: 'padrao',
    contraste: false,
    espacamento: false,
    links: false,
    pausar: false,
    guia: false,
  });

  const VLIBRAS_SRC = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  const VLIBRAS_STORAGE_KEY = '@vlibras-widget';

  // Aceita só valores conhecidos; qualquer outra coisa volta ao padrão.
  function normalizePrefs(raw) {
    const prefs = { ...DEFAULTS };
    if (!raw || typeof raw !== 'object') return prefs;
    if (TEXT_STEPS.includes(raw.texto)) prefs.texto = raw.texto;
    if (FONTS.includes(raw.fonte)) prefs.fonte = raw.fonte;
    for (const key of SWITCHES) if (typeof raw[key] === 'boolean') prefs[key] = raw[key];
    return prefs;
  }

  function isDefault(prefs) {
    return Object.keys(DEFAULTS).every((key) => prefs[key] === DEFAULTS[key]);
  }

  // O armazenamento pode não existir ou lançar erro (navegação privada, cookies bloqueados).
  function readPrefs(storage) {
    try {
      const saved = storage && storage.getItem(STORAGE_KEY);
      return normalizePrefs(saved ? JSON.parse(saved) : null);
    } catch {
      return { ...DEFAULTS };
    }
  }

  function savePrefs(storage, prefs) {
    try {
      if (!storage) return false;
      if (isDefault(prefs)) storage.removeItem(STORAGE_KEY);
      else storage.setItem(STORAGE_KEY, JSON.stringify(normalizePrefs(prefs)));
      return true;
    } catch {
      return false;
    }
  }

  function stepText(current, delta) {
    const index = TEXT_STEPS.indexOf(current);
    const next = Math.min(Math.max((index < 0 ? 0 : index) + delta, 0), TEXT_STEPS.length - 1);
    return TEXT_STEPS[next];
  }

  // Classes e atributos lidos pelo CSS (styles.source.css, bloco "Preferências de acessibilidade").
  function applyPrefs(html, prefs) {
    for (const key of SWITCHES) html.classList.toggle(`a11y-${key}`, prefs[key]);
    if (prefs.texto === DEFAULTS.texto) html.removeAttribute('data-a11y-texto');
    else html.setAttribute('data-a11y-texto', String(prefs.texto));
    if (prefs.fonte === DEFAULTS.fonte) html.removeAttribute('data-a11y-fonte');
    else html.setAttribute('data-a11y-fonte', prefs.fonte);
  }

  function getStorage(win) {
    try {
      return win.localStorage;
    } catch {
      return null;
    }
  }

  // -------------------------------------------------------------------------
  // Painel de preferências (padrão disclosure, como o menu)
  // -------------------------------------------------------------------------
  function initPanel(doc, win, state) {
    const toggle = doc.getElementById('a11y-toggle');
    const panel = doc.getElementById('a11y-panel');
    if (!toggle || !panel) return;
    const textValue = panel.querySelector('[data-a11y-texto-valor]');
    const decrease = panel.querySelector('[data-a11y-texto="-1"]');
    const increase = panel.querySelector('[data-a11y-texto="1"]');
    const storageStatus = panel.querySelector('[data-a11y-armazenamento]');

    const render = () => {
      const { prefs } = state;
      textValue.textContent = `${prefs.texto}%`;
      decrease.disabled = prefs.texto === TEXT_STEPS[0];
      increase.disabled = prefs.texto === TEXT_STEPS[TEXT_STEPS.length - 1];
      panel.querySelectorAll('input[name="a11y-fonte"]').forEach((input) => {
        input.checked = input.value === prefs.fonte;
      });
      panel.querySelectorAll('input[data-a11y-opcao]').forEach((input) => {
        input.checked = prefs[input.dataset.a11yOpcao];
      });
    };

    const update = (changes, changed) => {
      state.prefs = normalizePrefs({ ...state.prefs, ...changes });
      applyPrefs(doc.documentElement, state.prefs);
      const saved = savePrefs(getStorage(win), state.prefs);
      if (storageStatus) storageStatus.hidden = saved;
      render();
      doc.dispatchEvent(new win.CustomEvent('a11y:change', { detail: { changed, prefs: { ...state.prefs } } }));
    };

    const setOpen = (open, { returnFocus = false } = {}) => {
      panel.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      if (!open && returnFocus) toggle.focus();
    };

    toggle.addEventListener('click', () => setOpen(panel.hidden));
    panel.querySelector('[data-a11y-fechar]')?.addEventListener('click', () => setOpen(false, { returnFocus: true }));
    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !panel.hidden) setOpen(false, { returnFocus: true });
    });
    doc.addEventListener('click', (event) => {
      if (!panel.hidden && !panel.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });

    decrease.addEventListener('click', () => update({ texto: stepText(state.prefs.texto, -1) }, 'texto'));
    increase.addEventListener('click', () => update({ texto: stepText(state.prefs.texto, 1) }, 'texto'));
    panel
      .querySelectorAll('input[name="a11y-fonte"]')
      .forEach((input) => input.addEventListener('change', () => update({ fonte: input.value }, 'fonte')));
    panel
      .querySelectorAll('input[data-a11y-opcao]')
      .forEach((input) =>
        input.addEventListener('change', () =>
          update({ [input.dataset.a11yOpcao]: input.checked }, input.dataset.a11yOpcao),
        ),
      );
    panel.querySelector('[data-a11y-restaurar]')?.addEventListener('click', () => update({ ...DEFAULTS }, 'restaurar'));

    render();
    toggle.hidden = false;
  }

  // -------------------------------------------------------------------------
  // Guia de leitura: faixa horizontal que acompanha o mouse (dislexia, TDAH, baixa visão)
  // -------------------------------------------------------------------------
  function initReadingGuide(doc, win) {
    const guide = doc.createElement('div');
    guide.className = 'a11y-guia-faixa';
    guide.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(guide);
    let frame = null;
    let y = -100;
    doc.addEventListener(
      'pointermove',
      (event) => {
        if (event.pointerType !== 'mouse') return;
        y = event.clientY;
        if (frame) return;
        frame = win.requestAnimationFrame(() => {
          frame = null;
          guide.style.transform = `translateY(${Math.round(y)}px)`;
        });
      },
      { passive: true },
    );
  }

  // -------------------------------------------------------------------------
  // VLibras: carregado sob demanda a partir do servidor oficial do Governo Federal
  // -------------------------------------------------------------------------
  function hasOpenVLibrasSession(storage) {
    try {
      return Boolean(storage && String(storage.getItem(VLIBRAS_STORAGE_KEY) || '').includes('"isOpen":true'));
    } catch {
      return false;
    }
  }

  function waitFor(win, check, timeout = 8000, step = 50) {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const poll = () => {
        const value = check();
        if (value) resolve(value);
        else if (Date.now() - started > timeout) reject(new Error('tempo esgotado'));
        else win.setTimeout(poll, step);
      };
      poll();
    });
  }

  function initVLibras(doc, win) {
    const triggers = [...doc.querySelectorAll('[data-vlibras-abrir]')];
    const launcher = doc.getElementById('vlibras-launcher');
    const status = doc.getElementById('vlibras-status');
    if (!triggers.length) return;
    let loading = null;

    const setStatus = (message) => {
      if (!status) return;
      status.textContent = message;
      status.hidden = !message;
    };

    const load = () => {
      if (loading) return loading;
      loading = new Promise((resolve, reject) => {
        const script = doc.createElement('script');
        script.src = VLIBRAS_SRC;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('falha de rede'));
        doc.body.appendChild(script);
      })
        .then(() => waitFor(win, () => win.VLibrasWidget && win.VLibrasWidget.open))
        .catch((error) => {
          loading = null;
          throw error;
        });
      return loading;
    };

    const open = (event) => {
      if (event) event.preventDefault();
      triggers.forEach((trigger) => trigger.setAttribute('aria-busy', 'true'));
      setStatus('Carregando o tradutor de Libras…');
      return load()
        .then(() => {
          win.VLibrasWidget.open();
          setStatus('');
          // O próprio VLibras mostra o botão dele no mesmo lugar; o nosso sai de cena.
          if (launcher) launcher.hidden = true;
          doc.documentElement.classList.add('vlibras-ativo');
        })
        .catch(() => {
          setStatus('Não foi possível carregar o VLibras. Verifique a conexão e tente de novo.');
        })
        .finally(() => triggers.forEach((trigger) => trigger.removeAttribute('aria-busy')));
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', open);
      trigger.hidden = false;
    });
    // Quem deixou o VLibras aberto na visita anterior o encontra aberto de novo.
    if (hasOpenVLibrasSession(getStorage(win))) open();
  }

  function boot(win) {
    const doc = win.document;
    const state = { prefs: readPrefs(getStorage(win)) };
    applyPrefs(doc.documentElement, state.prefs);
    const start = () => {
      try {
        initPanel(doc, win, state);
        initReadingGuide(doc, win);
        initVLibras(doc, win);
      } catch (error) {
        console.error('Falha ao iniciar as opções de acessibilidade:', error);
      }
    };
    if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
  }

  return {
    STORAGE_KEY,
    TEXT_STEPS,
    FONTS,
    SWITCHES,
    DEFAULTS,
    VLIBRAS_SRC,
    normalizePrefs,
    isDefault,
    readPrefs,
    savePrefs,
    stepText,
    applyPrefs,
    hasOpenVLibrasSession,
    boot,
  };
});
