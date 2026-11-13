// Verificação obrigatória antes de publicar (IMP-202): falha enquanto a configuração
// operacional tiver pendências que impediriam o contato real pelo WhatsApp.
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const config = require('../site-config.js');
const { validateConfig } = require('../contact.js');

const { errors, warnings } = validateConfig(config, { release: true });
// Metadados que dependem do domínio precisam estar gerados com o site.url atual.
if (config.site?.url) errors.push(...(await import('./seo.mjs').then((m) => m.checkSeo(config))));
for (const warning of warnings) console.warn(`! ${warning}`);
if (errors.length) {
  console.error('✗ A página não está pronta para publicação:');
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}
console.log('✓ Configuração de contato pronta para publicação');
