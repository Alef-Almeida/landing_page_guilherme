// Utilitários compartilhados pelos testes end-to-end.
const fs = require('node:fs');
const path = require('node:path');

const baseConfig = fs.readFileSync(path.join(__dirname, '../../site-config.js'), 'utf8');

// Substitui site-config.js durante o teste. `replacements` é uma lista de pares [trecho original, novo trecho].
async function useSiteConfig(page, replacements = []) {
  let source = baseConfig;
  const fallbacks = {
    "number: '',": "number: '557499542056',",
    'productionHosts: [],': "productionHosts: ['localhost', '127.0.0.1'],",
  };
  for (const [from, to] of replacements) {
    const target = source.includes(from) ? from : fallbacks[from] && source.includes(fallbacks[from]) ? fallbacks[from] : null;
    if (!target) throw new Error(`Trecho não encontrado em site-config.js: ${from}`);
    source = source.replace(target, to);
  }
  await page.route('**/site-config.js', (route) => route.fulfill({ contentType: 'text/javascript', body: source }));
}

// Fixa o relógio do navegador (a agenda depende da data atual).
async function freezeTime(page, isoDate) {
  await page.clock.setFixedTime(new Date(isoDate));
}

// Coleta erros de JavaScript e mensagens de erro do console.
function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  return errors;
}

// Espera as animações finitas (como a entrada do hero) terminarem antes de medir contraste ou capturar.
async function waitForAnimations(page) {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity),
  );
}

module.exports = { useSiteConfig, freezeTime, collectErrors, waitForAnimations };
