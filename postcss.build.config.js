// Configuração de produção: a mesma do desenvolvimento, mais minificação.
// colormin, minifyGradients, normalizePositions e convertValues ficam desligados para não
// alterar cores (conversão com arredondamento) nem a forma dos gradientes.
const base = require('./postcss.config.js');

module.exports = {
  plugins: {
    ...base.plugins,
    cssnano: {
      preset: ['default', { colormin: false, minifyGradients: false, normalizePositions: false, convertValues: false }],
    },
  },
};
