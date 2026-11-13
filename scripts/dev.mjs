// Desenvolvimento: recompila styles.css a cada alteração e serve a página.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { startServer } from './serve.mjs';

const require = createRequire(import.meta.url);
const cli = require.resolve('tailwindcss/lib/cli.js');
const args = ['--postcss', 'postcss.build.config.js', '-i', 'styles.source.css', '-o', 'styles.css', '--watch=always'];
const watcher = spawn(process.execPath, [cli, ...args], { stdio: 'inherit' });

startServer();
const stop = () => {
  watcher.kill();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
