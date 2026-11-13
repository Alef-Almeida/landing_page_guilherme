// Gera as imagens otimizadas da página a partir dos originais (IMP-402, IMP-403, IMP-409, IMP-410).
// Uso: npm run images
//
// - Originais em assets/source/ (não são publicados nem referenciados pela página).
// - Saída em assets/img/: AVIF e WebP em dois tamanhos (1x e 2x da maior área em que a imagem aparece).
// - Ícones em assets/icons/ e favicon.ico na raiz, gerados a partir de assets/icons/favicon.svg.
//
// O resultado é versionado; rode este script de novo sempre que um original mudar.
import sharp from 'sharp';
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'assets/source');
const OUT = path.join(ROOT, 'assets/img');
const ICONS = path.join(ROOT, 'assets/icons');

// Larguras geradas por imagem. Posts aparecem em até ~384 px; a foto horizontal precisa de mais
// largura porque é recortada em quadrado (object-fit: cover) e quem limita é a altura.
const IMAGES = [
  ...Array.from({ length: 9 }, (_, i) => ({ name: `instagram-0${i + 1}`, widths: [400, 800] })),
  { name: 'guilherme-photo-01', widths: [720, 1440] },
  { name: 'guilherme-photo-02', widths: [480, 960] },
];

const FORMATS = {
  avif: (img) => img.avif({ quality: 55, effort: 6 }),
  webp: (img) => img.webp({ quality: 78, effort: 6 }),
};

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
const report = [];
for (const { name, widths } of IMAGES) {
  const input = path.join(SOURCE, `${name}.jpeg`);
  const meta = await sharp(input).metadata();
  for (const width of widths) {
    for (const [ext, encode] of Object.entries(FORMATS)) {
      const file = path.join(OUT, `${name}-${width}.${ext}`);
      const info = await encode(sharp(input).rotate().resize({ width, withoutEnlargement: true })).toFile(file);
      report.push(`${path.relative(ROOT, file)}  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(1)} KB`);
    }
  }
  report.push(`  original ${meta.width}×${meta.height}`);
}

// Ícones: favicon.svg é a fonte; PNGs para Apple e manifesto; ICO com 16, 32 e 48 px.
const svg = await readFile(path.join(ICONS, 'favicon.svg'));
for (const [file, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  // O iOS preenche transparência com preto: o ícone da Apple recebe fundo cheio na cor da página.
  const image = sharp(svg, { density: 512 }).resize(size, size);
  if (file === 'apple-touch-icon.png') image.flatten({ background: '#F8F5F1' });
  await image.png({ compressionLevel: 9 }).toFile(path.join(ICONS, file));
  report.push(`assets/icons/${file}  ${size}×${size}`);
}
const icoSizes = [16, 32, 48];
const pngs = await Promise.all(icoSizes.map((s) => sharp(svg, { density: 512 }).resize(s, s).png().toBuffer()));
await writeFile(path.join(ROOT, 'favicon.ico'), toIco(pngs, icoSizes));
report.push(`favicon.ico  ${icoSizes.join(', ')} px`);

console.log(report.join('\n'));
const files = await readdir(OUT);
console.log(`\n${files.length} arquivos em assets/img/`);

// Monta um .ico com imagens PNG embutidas (formato aceito por todos os navegadores atuais).
function toIco(images, sizes) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((png, i) => {
    const entry = 6 + i * 16;
    header.writeUInt8(sizes[i] % 256, entry);
    header.writeUInt8(sizes[i] % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images]);
}
