// Garante que styles.css corresponde a styles.source.css e que o HTML não depende do Tailwind via CDN.
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const cli = require.resolve('tailwindcss/lib/cli.js');
const dir = mkdtempSync(path.join(tmpdir(), 'check-css-'));
const out = path.join(dir, 'styles.css');
const errors = [];

try {
  const build = spawnSync(
    process.execPath,
    [cli, '--postcss', 'postcss.build.config.js', '-i', 'styles.source.css', '-o', out],
    { encoding: 'utf8' },
  );
  if (build.status !== 0) errors.push(`Falha ao compilar o CSS:\n${build.stderr}`);
  else if (readFileSync(out, 'utf8') !== readFileSync('styles.css', 'utf8'))
    errors.push('styles.css está desatualizado em relação a styles.source.css. Rode `npm run build`.');

  const html = readFileSync('index.html', 'utf8');
  if (html.includes('cdn.tailwindcss.com')) errors.push('index.html ainda carrega o Tailwind via CDN.');
  if (/<style[\s>]/i.test(html))
    errors.push('index.html contém blocos <style>; mova os estilos para styles.source.css.');
  // !important só é aceito no bloco de preferências de acessibilidade escolhidas pela pessoa (IMP-802),
  // que precisa vencer qualquer estilo da página.
  const source = readFileSync('styles.source.css', 'utf8');
  const outsidePreferences = source.replace(/\/\* preferencias:inicio \*\/[\s\S]*?\/\* preferencias:fim \*\//, '');
  if (/!important/.test(outsidePreferences))
    errors.push(
      'styles.source.css contém !important fora do bloco de preferências; resolva pela especificidade ou pelas classes do HTML.',
    );
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  process.exit(1);
}
console.log('✓ CSS gerado atualizado, sem CDN, sem <style> no HTML e sem !important fora das preferências');
