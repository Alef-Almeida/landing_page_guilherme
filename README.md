# Landing page — Guilherme dos Santos Teixeira

Página estática (HTML, CSS e JavaScript, sem framework) de apresentação do trabalho de psicologia clínica de Guilherme dos Santos Teixeira.

O planejamento e o acompanhamento da evolução do projeto estão em [`PLANO_IMPLEMENTACAO_COLABORATIVO.md`](PLANO_IMPLEMENTACAO_COLABORATIVO.md). Leia esse documento antes de alterar qualquer arquivo.

## Requisitos

- Node.js 20 ou superior
- npm

## Primeiros passos

```bash
npm install
npm run dev
```

Abra <http://127.0.0.1:8080/>. O comando `dev` recompila o CSS a cada alteração em `styles.source.css`, `index.html` ou `script.js` e serve a página localmente.

## Comandos

| Comando                | O que faz                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `npm run dev`          | Servidor local em `127.0.0.1:8080` com recompilação automática do CSS                         |
| `npm run build`        | Gera `styles.css` minificado a partir de `styles.source.css`                                  |
| `npm run serve`        | Somente serve a página (use `npm run serve -- --port 3000` para outra porta)                  |
| `npm run format`       | Formata os arquivos com Prettier                                                              |
| `npm run format:check` | Verifica a formatação sem alterar arquivos                                                    |
| `npm run check:js`     | Verifica a sintaxe de `script.js`                                                             |
| `npm run check:css`    | Confere se `styles.css` está atualizado e se não há CDN, `<style>` no HTML ou `!important`    |
| `npm test`             | Executa todas as verificações acima (testes unitários e end-to-end entram na Fase 6 do plano) |

## Como o CSS funciona

- **Edite somente `styles.source.css`.** O arquivo `styles.css` é gerado por `npm run build` e não deve ser editado à mão.
- `styles.css` é versionado para que a página funcione em qualquer hospedagem estática sem etapa de build. Depois de alterar `styles.source.css`, `index.html` ou `script.js`, rode `npm run build` e inclua o `styles.css` atualizado no commit; `npm test` falha se ele estiver desatualizado.
- O Tailwind CSS é compilado localmente (versão fixada em `3.4.17`, a mesma servida antes pelo CDN). As classes são lidas de `index.html` e `script.js` (ver `tailwind.config.js`).
- Ordem no arquivo final: base do Tailwind → componentes → estilos próprios → utilitários. Os utilitários ficam por último para vencerem os estilos próprios de mesma especificidade.
- Não use `!important`: resolva conflitos pela especificidade do seletor ou ajustando as classes no HTML.
- Prefixos de navegador são gerados pelo autoprefixer conforme `browserslist` em `package.json` (padrão do mercado, mais Safari e iOS 15 ou superior).
- A minificação (`postcss.build.config.js`) usa cssnano com as transformações de cor, gradiente, posição e unidades desligadas, para que o CSS final seja idêntico ao escrito.

## Estrutura

```text
├── index.html               página
├── script.js                comportamento (WhatsApp, agenda, menu, abas, carrosséis)
├── styles.source.css        fonte do CSS (edite este)
├── styles.css               CSS gerado e minificado (não edite)
├── tailwind.config.js       tema e arquivos lidos pelo Tailwind
├── postcss.config.js        Tailwind + autoprefixer
├── postcss.build.config.js  configuração de produção (inclui minificação)
├── scripts/                 servidor local, modo de desenvolvimento e verificação do CSS
├── assets/                  imagens
└── tests/baseline/          medição de referência do commit-base (não sobrescrever)
```

## Publicação

Ainda não definida (DEC-04 no plano). Os arquivos necessários para publicar são `index.html`, `script.js`, `styles.css` e a pasta `assets/`.
