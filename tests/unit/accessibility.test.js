// Testes unitários das preferências de acessibilidade (IMP-802 a IMP-811). Executar com `npm run test:unit`.
const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const a11y = require('../../accessibility.js');

const memoryStorage = (initial = {}) => {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
};

const brokenStorage = {
  getItem() {
    throw new Error('bloqueado');
  },
  setItem() {
    throw new Error('bloqueado');
  },
  removeItem() {
    throw new Error('bloqueado');
  },
};

const fakeHtml = () => {
  const classes = new Set();
  const attrs = {};
  return {
    classes,
    attrs,
    classList: { toggle: (name, on) => (on ? classes.add(name) : classes.delete(name)) },
    setAttribute: (name, value) => {
      attrs[name] = value;
    },
    removeAttribute: (name) => {
      delete attrs[name];
    },
  };
};

describe('normalizePrefs', () => {
  test('sem dados, devolve o padrão', () => {
    assert.deepEqual(a11y.normalizePrefs(null), a11y.DEFAULTS);
    assert.deepEqual(a11y.normalizePrefs('texto'), a11y.DEFAULTS);
  });

  test('aceita só valores conhecidos', () => {
    const prefs = a11y.normalizePrefs({
      texto: 150,
      fonte: 'dislexia',
      contraste: true,
      pausar: 'sim',
      guia: 1,
      extra: true,
    });
    assert.equal(prefs.texto, 150);
    assert.equal(prefs.fonte, 'dislexia');
    assert.equal(prefs.contraste, true);
    assert.equal(prefs.pausar, false);
    assert.equal(prefs.guia, false);
    assert.equal('extra' in prefs, false);
  });

  test('tamanho e fonte fora da lista voltam ao padrão', () => {
    const prefs = a11y.normalizePrefs({ texto: 300, fonte: 'comic' });
    assert.equal(prefs.texto, 100);
    assert.equal(prefs.fonte, 'padrao');
  });
});

describe('stepText', () => {
  test('avança e recua pelos degraus, sem passar dos limites', () => {
    assert.equal(a11y.stepText(100, 1), 125);
    assert.equal(a11y.stepText(175, 1), 200);
    assert.equal(a11y.stepText(200, 1), 200);
    assert.equal(a11y.stepText(125, -1), 100);
    assert.equal(a11y.stepText(100, -1), 100);
    assert.equal(a11y.stepText(999, 1), 125);
  });
});

describe('readPrefs e savePrefs', () => {
  test('salva e lê de volta', () => {
    const storage = memoryStorage();
    const prefs = { ...a11y.DEFAULTS, texto: 175, links: true };
    assert.equal(a11y.savePrefs(storage, prefs), true);
    assert.deepEqual(a11y.readPrefs(storage), prefs);
  });

  test('preferências iguais ao padrão apagam o registro', () => {
    const storage = memoryStorage({ [a11y.STORAGE_KEY]: '{"contraste":true}' });
    a11y.savePrefs(storage, { ...a11y.DEFAULTS });
    assert.equal(a11y.STORAGE_KEY in storage.data, false);
  });

  test('JSON inválido e armazenamento bloqueado não quebram a página', () => {
    assert.deepEqual(a11y.readPrefs(memoryStorage({ [a11y.STORAGE_KEY]: '{oops' })), a11y.DEFAULTS);
    assert.deepEqual(a11y.readPrefs(brokenStorage), a11y.DEFAULTS);
    assert.deepEqual(a11y.readPrefs(null), a11y.DEFAULTS);
    assert.equal(a11y.savePrefs(brokenStorage, { ...a11y.DEFAULTS, contraste: true }), false);
    assert.equal(a11y.savePrefs(null, a11y.DEFAULTS), false);
  });
});

describe('applyPrefs', () => {
  test('marca o <html> com classes e atributos e os remove no padrão', () => {
    const html = fakeHtml();
    a11y.applyPrefs(html, { ...a11y.DEFAULTS, texto: 150, fonte: 'legivel', contraste: true, guia: true });
    assert.deepEqual([...html.classes].sort(), ['a11y-contraste', 'a11y-guia']);
    assert.deepEqual(html.attrs, { 'data-a11y-texto': '150', 'data-a11y-fonte': 'legivel' });
    a11y.applyPrefs(html, a11y.DEFAULTS);
    assert.equal(html.classes.size, 0);
    assert.deepEqual(html.attrs, {});
  });
});

describe('VLibras', () => {
  test('usa o endereço oficial do Governo Federal', () => {
    assert.equal(a11y.VLIBRAS_SRC, 'https://vlibras.gov.br/app/vlibras-plugin.js');
  });

  test('reconhece uma sessão aberta na visita anterior', () => {
    assert.equal(a11y.hasOpenVLibrasSession(memoryStorage({ '@vlibras-widget': '{"isOpen":true}' })), true);
    assert.equal(a11y.hasOpenVLibrasSession(memoryStorage({ '@vlibras-widget': '{"isOpen":false}' })), false);
    assert.equal(a11y.hasOpenVLibrasSession(memoryStorage()), false);
    assert.equal(a11y.hasOpenVLibrasSession(brokenStorage), false);
  });
});
