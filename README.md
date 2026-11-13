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

Abra <http://127.0.0.1:8080/>. O comando `dev` recompila o CSS a cada alteração em `styles.source.css`, `index.html`, `script.js` ou `contact.js` e serve a página localmente.

## Comandos

| Comando                 | O que faz                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run dev`           | Servidor local em `127.0.0.1:8080` com recompilação automática do CSS                                |
| `npm run build`         | Gera `styles.css` minificado a partir de `styles.source.css`                                         |
| `npm run serve`         | Somente serve a página (use `npm run serve -- --port 3000` para outra porta)                         |
| `npm run format`        | Formata os arquivos com Prettier                                                                     |
| `npm run format:check`  | Verifica a formatação sem alterar arquivos                                                           |
| `npm run check:js`      | Verifica a sintaxe de `site-config.js`, `tabs.js`, `contact.js` e `script.js`                        |
| `npm run check:css`     | Confere se `styles.css` está atualizado e se não há CDN, `<style>` no HTML ou `!important`           |
| `npm run test:unit`     | Testes unitários do contato e da agenda (`node:test`, sem dependências)                              |
| `npm run test:e2e`      | Testes end-to-end no navegador (Playwright). Na primeira vez, rode `npx playwright install chromium` |
| `npm test`              | Sintaxe, formatação, CSS e testes unitários (não inclui os end-to-end, que precisam de navegador)    |
| `npm run check:release` | **Antes de publicar.** Falha enquanto número, domínio ou agenda estiverem pendentes ou inválidos     |

## Configuração do WhatsApp e da agenda

Todos os dados operacionais ficam em [`site-config.js`](site-config.js). Não espalhe telefone, mensagens ou horários em outros arquivos.

| Campo                  | Para que serve                                                                                        | Situação atual                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `whatsapp.number`      | Número profissional com DDI 55 e DDD, por exemplo `5571912345678`                                     | Vazio até DEC-01                      |
| `site.productionHosts` | Domínios em que o link do WhatsApp fica ativo, por exemplo `['www.dominio.com.br', 'dominio.com.br']` | Vazio até DEC-04                      |
| `modalities`           | Modalidades confirmadas, por exemplo `['online', 'presencial']`                                       | Vazio até DEC-03                      |
| `schedule.mode`        | `'whatsapp-only'` (consulta pelo WhatsApp) ou `'manual-schedule'` (horários publicados)               | `'whatsapp-only'` até DEC-02 e DEC-10 |
| `schedule.days`        | Somente no modo manual: `[{ date: 'AAAA-MM-DD', times: ['HH:MM'] }]`                                  | Vazio                                 |
| `schedule.timeZone`    | Fuso usado para esconder datas e horários que já passaram                                             | `America/Bahia`                       |

Como a página se comporta:

- **Sem número válido:** os botões do WhatsApp ficam desativados, com o aviso “O contato pelo WhatsApp está temporariamente indisponível.” Nenhum link externo é gerado.
- **Com número válido, fora de `productionHosts`** (localhost, homologação, testes): os botões ficam desativados com um aviso de ambiente de teste, para que ninguém envie mensagens reais por engano. A URL que seria usada fica no atributo `data-whatsapp-preview` para conferência.
- **Com número válido, em `productionHosts`:** os botões abrem o WhatsApp com a mensagem pronta.
- **Sem JavaScript:** os botões continuam desativados e um aviso pede para ativar o JavaScript.
- **Agenda manual:** datas e horários vencidos somem automaticamente; se não sobrar nenhum, a página mostra a consulta pelo WhatsApp. Cada solicitação informa dia da semana, data completa, ano, horário, modalidade (quando configurada) e que a vaga depende de confirmação.

Os textos e as regras ficam em [`contact.js`](contact.js), coberto por `npm run test:unit`.

## Como o CSS funciona

- **Edite somente `styles.source.css`.** O arquivo `styles.css` é gerado por `npm run build` e não deve ser editado à mão.
- `styles.css` é versionado para que a página funcione em qualquer hospedagem estática sem etapa de build. Depois de alterar `styles.source.css`, `index.html`, `script.js` ou `contact.js`, rode `npm run build` e inclua o `styles.css` atualizado no commit; `npm test` falha se ele estiver desatualizado.
- O Tailwind CSS é compilado localmente (versão fixada em `3.4.17`, a mesma servida antes pelo CDN). As classes são lidas de `index.html`, `script.js` e `contact.js` (ver `tailwind.config.js`).
- Ordem no arquivo final: base do Tailwind → componentes → estilos próprios → utilitários. Os utilitários ficam por último para vencerem os estilos próprios de mesma especificidade.
- Não use `!important`: resolva conflitos pela especificidade do seletor ou ajustando as classes no HTML.
- Prefixos de navegador são gerados pelo autoprefixer conforme `browserslist` em `package.json` (padrão do mercado, mais Safari e iOS 15 ou superior).
- A minificação (`postcss.build.config.js`) usa cssnano com as transformações de cor, gradiente, posição e unidades desligadas, para que o CSS final seja idêntico ao escrito.

## Estrutura

```text
├── index.html               página
├── site-config.js           configuração operacional: WhatsApp, domínio, modalidades e agenda
├── tabs.js                  abas acessíveis (padrão WAI-ARIA), usadas no "Sobre" e na agenda
├── contact.js               contato e agenda: validação, mensagens, datas e estados dos botões
├── script.js                demais comportamentos (menu, seção ativa, abas do "Sobre", carrosséis)
├── styles.source.css        fonte do CSS (edite este)
├── styles.css               CSS gerado e minificado (não edite)
├── tailwind.config.js       tema e arquivos lidos pelo Tailwind
├── postcss.config.js        Tailwind + autoprefixer
├── postcss.build.config.js  configuração de produção (inclui minificação)
├── scripts/                 servidor local, modo de desenvolvimento e verificação do CSS
├── assets/                  imagens
├── tests/unit/              testes unitários (`npm run test:unit`)
├── tests/e2e/               testes end-to-end com Playwright (`npm run test:e2e`)
├── tests/tools/             ferramentas de verificação (comparação de estilo computado)
└── tests/baseline/          medição de referência do commit-base (não sobrescrever)
```

## Publicação

Ainda não definida (DEC-04 no plano). Os arquivos necessários para publicar são `index.html`, `site-config.js`, `tabs.js`, `contact.js`, `script.js`, `styles.css` e a pasta `assets/`. Antes de publicar, `npm run check:release` precisa passar.
