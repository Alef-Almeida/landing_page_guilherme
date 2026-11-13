// Copia as fontes variáveis (subconjunto latino, que cobre o português) dos pacotes @fontsource-variable
// para assets/fonts/, junto com as licenças SIL OFL. Uso: npm run fonts (após atualizar os pacotes).
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets/fonts');
const FONTS = [
  { pkg: 'inter', file: 'inter-latin-wght-normal.woff2', license: 'LICENSE-Inter.txt' },
  { pkg: 'dm-sans', file: 'dm-sans-latin-wght-normal.woff2', license: 'LICENSE-DM-Sans.txt' },
];

await mkdir(OUT, { recursive: true });
for (const { pkg, file, license } of FONTS) {
  const base = path.join(ROOT, 'node_modules/@fontsource-variable', pkg);
  await copyFile(path.join(base, 'files', file), path.join(OUT, file));
  await copyFile(path.join(base, 'LICENSE'), path.join(OUT, license));
  console.log(`assets/fonts/${file}`);
}
