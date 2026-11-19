// Testes de quebra no navegador, separados da suíte principal (não rodam no CI).
// Uso: npx playwright test -c tests/quebra
//      VLIBRAS_REDE=1 npx playwright test -c tests/quebra   → inclui o VLibras real (exige internet)
const { defineConfig, devices } = require('@playwright/test');

const PORT = 4175;

module.exports = defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: 'retain-on-failure' },
  webServer: {
    command: `node scripts/serve.mjs --port ${PORT}`,
    cwd: '../..',
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: true,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
