// Aplica as preferências salvas antes da primeira pintura.
(function (root, factory) {
  const preferences = factory();
  if (typeof module === 'object' && module.exports) module.exports = preferences;
  else {
    root.AccessibilityPreferences = preferences;
    preferences.applyPrefs(root.document.documentElement, preferences.readPrefs(preferences.getStorage(root)));
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

  return {
    STORAGE_KEY,
    TEXT_STEPS,
    FONTS,
    SWITCHES,
    DEFAULTS,
    normalizePrefs,
    isDefault,
    readPrefs,
    savePrefs,
    stepText,
    applyPrefs,
    getStorage,
  };
});
