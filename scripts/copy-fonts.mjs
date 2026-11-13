// Copia as fontes (subconjunto latino, que cobre o português) dos pacotes @fontsource-variable e @fontsource
// para assets/fonts/, junto com as licenças SIL OFL. Uso: npm run fonts (após atualizar os pacotes).
// Atkinson Hyperlegible e OpenDyslexic são as fontes de leitura do painel de acessibilidade (IMP-805):
// só são baixadas pelo navegador quando a pessoa escolhe uma delas.
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/fonts');
const FONTS = [
  { pkg: '@fontsource-variable/inter', file: 'inter-latin-wght-normal.woff2', license: 'LICENSE-Inter.txt' },
  { pkg: '@fontsource-variable/dm-sans', file: 'dm-sans-latin-wght-normal.woff2', license: 'LICENSE-DM-Sans.txt' },
  ...['400', '700'].map((weight) => ({
    pkg: '@fontsource/atkinson-hyperlegible',
    file: `atkinson-hyperlegible-latin-${weight}-normal.woff2`,
    license: 'LICENSE-Atkinson-Hyperlegible.txt',
  })),
  ...['400', '700'].map((weight) => ({
    pkg: '@fontsource/opendyslexic',
    file: `opendyslexic-latin-${weight}-normal.woff2`,
    license: 'LICENSE-OpenDyslexic.txt',
  })),
];

await mkdir(OUT, { recursive: true });
for (const { pkg, file, license } of FONTS) {
  const base = path.join(ROOT, 'node_modules', pkg);
  await copyFile(path.join(base, 'files', file), path.join(OUT, file));
  await copyFile(path.join(base, 'LICENSE'), path.join(OUT, license));
  console.log(`assets/fonts/${file}`);
}
