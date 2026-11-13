// Servidor estático local, sem dependências. Uso: npm run serve [-- --port 8080]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// --root permite servir outra pasta, por exemplo dist/ para conferir o pacote de publicação.
const rootArg = process.argv.indexOf('--root');
const ROOT = rootArg > -1 ? path.resolve(PROJECT, process.argv[rootArg + 1]) : PROJECT;
// Mesmos cabeçalhos de segurança da publicação (sem os exclusivos de HTTPS), para que a CSP seja testada localmente.
const { headers: SECURITY_HEADERS } = JSON.parse(await readFile(path.join(PROJECT, 'security-headers.json'), 'utf8'));
const portArg = process.argv.indexOf('--port');
const PORT = Number(portArg > -1 ? process.argv[portArg + 1] : process.env.PORT || 8080);
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

export const startServer = (port = PORT) =>
  createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let file = path.normalize(path.join(ROOT, decodeURIComponent(url.pathname)));
      if (!file.startsWith(ROOT + path.sep) && file !== ROOT) throw Object.assign(new Error(), { code: 'EACCES' });
      if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      });
      res.end(body);
    } catch (error) {
      const status = error.code === 'EACCES' ? 403 : 404;
      res.writeHead(status, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(status === 403 ? 'Acesso negado' : 'Não encontrado');
    }
  }).listen(port, '127.0.0.1', () => console.log(`Servindo em http://127.0.0.1:${port}/`));

if (process.argv[1] === fileURLToPath(import.meta.url)) startServer();
