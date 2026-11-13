# Baseline do commit-base — IMP-007

Medição de referência da landing page **antes de qualquer alteração de implementação**. Serve para comparar as fases seguintes (IMP-107, IMP-411, IMP-633) e calibrar as metas da Fase 6.

| Item | Valor |
| --- | --- |
| Commit medido | `77bcc7b` (código do site idêntico ao commit-base `0720985`) |
| Data | 2026-11-12, 21:53–21:56 (-03) |
| Servidor | `python3 -m http.server` em `127.0.0.1:8765`, sem compressão nem cache |
| Navegador | Google Chrome do sistema, headless |
| Ferramentas | Lighthouse 12.8.2, axe-core 4.14.0, playwright-core 1.65.0 |
| Recursos externos | Tailwind CDN (resolvido para **3.4.17**) e Google Fonts, carregados da internet |

## Resultados

### Lighthouse (mediana de 3 execuções por perfil)

| Categoria | Mobile | Desktop | Meta inicial (§6 do plano) |
| --- | ---: | ---: | ---: |
| Desempenho | **73** (68–76) | **95** (80–97) | 85 mobile |
| Acessibilidade | **90** | **90** | 95 |
| Boas práticas | **96** | **96** | 90 |
| SEO | **100** | **100** | 90 |

| Métrica (mediana) | Mobile | Desktop |
| --- | ---: | ---: |
| First Contentful Paint | 2,4 s | 0,76 s |
| Largest Contentful Paint | 7,2 s | 1,4 s |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 2,4 s | 0,79 s |
| Peso total transferido | 2,47 MB | 2,47 MB |
| Requisições | 22 | 22 |

Principais oportunidades apontadas: imagens maiores que o exibido (~1,7–1,9 MB de economia estimada), formatos modernos (~960 KB), recursos que bloqueiam renderização (~1,5 s no mobile), imagens sem `width`/`height` e erro no console (favicon 404).

As auditorias de compressão de texto e de cache refletem o servidor de desenvolvimento, não o site; devem ser reavaliadas na hospedagem definida em DEC-04.

### axe-core

| Regra | Impacto | Mobile 390 | Desktop 1280 |
| --- | --- | ---: | ---: |
| `aria-required-children` (indicadores do carrossel em `role="tablist"` sem `role="tab"`) | Crítico | 1 | 1 |
| `color-contrast` | Sério | 8 nós | 13 nós |
| `color-contrast` (incompleto, revisar manualmente) | Sério | 74 nós | 75 nós |
| `aria-prohibited-attr` (incompleto) | Sério | 1 | 1 |

Resultado frente à meta “0 violações críticas/sérias não justificadas”: **2 regras violadas** em ambos os perfis.

### Requisições (perfil mobile)

| Tipo | Quantidade | Bytes |
| --- | ---: | ---: |
| Imagens | 13 | 2,20 MB |
| Scripts | 3 | 139 KB (127 KB do Tailwind CDN) |
| Fontes | 2 | 63 KB |
| Folhas de estilo | 2 | 12 KB |
| Documento | 1 | 29 KB |
| XHR (Google Fonts) | 1 | 1 KB |

Todas as 13 imagens, inclusive os nove posts do carrossel, são requisitadas no carregamento inicial. Os recursos de terceiros são: `cdn.tailwindcss.com` (302 → `3.4.17`), `fonts.googleapis.com` e `fonts.gstatic.com`.

### Layout

| Viewport | Altura do documento | Overflow horizontal do documento |
| --- | ---: | --- |
| 320 × 720 | 9 385 px | não |
| 390 × 844 | 8 711 px | não |
| 768 × 1024 | 7 294 px | não |
| 1280 × 800 | 5 611 px | não |
| 1440 × 900 | 5 886 px | não |

**Atenção:** mesmo sem overflow do documento, as capturas confirmam o **corte lateral do título, do texto e dos CTAs do hero em 320 px** (o excesso é ocultado por `overflow: hidden`) e a **quebra do CTA “Vamos conversar” no cabeçalho em 768 px**. Por isso, a verificação de IMP-617 não pode se limitar a comparar `scrollWidth` com a largura da janela: precisa verificar os limites de cada elemento visível.

Console em todos os viewports: aviso do Tailwind CDN para produção; em 320 px também o 404 do favicon.

## Conteúdo da pasta

| Caminho | Conteúdo |
| --- | --- |
| `screenshots/<largura>/` | Página inteira e cada seção (cabeçalho, hero, atendimentos, sobre, conteúdos, FAQ, agenda, contato, rodapé) em 320, 390, 768, 1280 e 1440 px |
| `lighthouse-mobile.json`, `lighthouse-desktop.json` | Relatório completo da execução mediana; abre em <https://googlechrome.github.io/lighthouse/viewer/> |
| `axe-mobile-390.json`, `axe-desktop-1280.json` | Violações e itens incompletos do axe |
| `requests-mobile-390.json`, `requests-desktop-1280.json` | Inventário de requisições com tipo, status e tamanho |
| `capture-summary.json` | Dimensões do documento e mensagens de console por viewport |
| `scripts/capture.mjs` | Script que gera capturas, axe, requisições e resumo |

## Como reproduzir

As ferramentas ficam fora do projeto, pois `package.json` pertence à FR-01:

```bash
mkdir -p /tmp/baseline-tools && cd /tmp/baseline-tools
npm init -y && npm install lighthouse@12.8.2 playwright-core@1.65.0 axe-core@4.14.0

# em outro terminal, na raiz do site
python3 -m http.server 8765 --bind 127.0.0.1

# capturas, axe e requisições
TOOLS_DIR=/tmp/baseline-tools node tests/baseline/scripts/capture.mjs tests/baseline

# Lighthouse: 3 execuções por perfil; guardar a de desempenho mediano
cd /tmp/baseline-tools
npx lighthouse http://127.0.0.1:8765/ --chrome-flags="--headless=new" --output=json --output-path=mobile-1.json
npx lighthouse http://127.0.0.1:8765/ --preset=desktop --chrome-flags="--headless=new" --output=json --output-path=desktop-1.json
```

Notas de método:

- nas capturas, `setInterval` é desativado para manter os carrosséis no primeiro slide, e as animações CSS são finalizadas pelo Playwright (`animations: 'disabled'`);
- axe e requisições são medidos sem essas intervenções;
- o desempenho varia com a rede, porque Tailwind e fontes vêm da internet; compare sempre medianas de pelo menos 3 execuções.

Este diretório é um registro histórico: não deve ser sobrescrito. Novas medições devem ir para outra pasta (por exemplo `tests/baseline/<data>/` ou os artefatos da Fase 6).
