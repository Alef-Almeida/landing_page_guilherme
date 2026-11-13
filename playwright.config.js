// Testes end-to-end. Uso: npm run test:e2e
// O servidor local é iniciado automaticamente em 127.0.0.1:4173. Para testar outro endereço
// (por exemplo, a homologação), defina E2E_BASE_URL; nesse caso nenhum servidor local é iniciado.
const { defineConfig, devices } = require('@playwright/test');

const PORT = 4173;
const externalBaseUrl = process.env.E2E_BASE_URL;

module.exports = defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: externalBaseUrl || `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: `node scripts/serve.mjs --port ${PORT}`,
        url: `http://127.0.0.1:${PORT}/`,
        reuseExistingServer: !process.env.CI,
      },
  // IMP-631: Chromium, Firefox e WebKit. Localmente, `npm run test:e2e` usa só o Chromium;
  // `npm run test:e2e:all` roda os três (o WebKit no Linux exige `sudo npx playwright install-deps webkit`).
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
