# Landing page — Guilherme dos Santos Teixeira

Página estática (HTML, CSS e JavaScript, sem framework nem backend) de apresentação do trabalho de psicologia clínica de Guilherme dos Santos Teixeira (CRP 03/36532). O objetivo é apresentar o profissional e os atendimentos e levar o visitante a iniciar uma conversa pelo WhatsApp.

## Estado atual

A implementação técnica está concluída e testada. A publicação depende de decisões do responsável pelo projeto: número do WhatsApp, domínio, formato da agenda, modalidades e textos de privacidade. Enquanto elas não forem preenchidas, `npm run check:release` bloqueia a publicação e os botões do WhatsApp ficam desativados com um aviso.

- O que falta decidir e onde cada resposta entra: [`docs/conteudo-para-aprovacao.md`](docs/conteudo-para-aprovacao.md)
- Como publicar, configurar a hospedagem e voltar uma versão: [`docs/publicacao.md`](docs/publicacao.md)
- Checklist de homologação e limitações aceitas: [`docs/homologacao.md`](docs/homologacao.md)
- Planejamento, histórico e registro de cada etapa: [`PLANO_IMPLEMENTACAO_COLABORATIVO.md`](PLANO_IMPLEMENTACAO_COLABORATIVO.md). Leia antes de alterar qualquer arquivo.

## Início rápido

Requisitos: Node.js 20 ou superior e npm.

```bash
npm install
npx playwright install chromium   # navegador dos testes end-to-end, uma vez por máquina
npm run dev                        # http://127.0.0.1:8080/
```

O comando `dev` recompila o CSS a cada alteração e serve a página com os mesmos cabeçalhos de segurança da publicação.

## Comandos

**Desenvolvimento**

| Comando         | O que faz                                                                            |
| --------------- | ------------------------------------------------------------------------------------ |
| `npm run dev`   | Servidor local em `127.0.0.1:8080` com recompilação automática do CSS                |
| `npm run build` | Gera `styles.css` minificado a partir de `styles.source.css`                         |
| `npm run serve` | Só serve a página (`npm run serve -- --port 3000` ou `-- --root dist` para o pacote) |

**Recursos gerados** (o resultado é versionado; rode quando a fonte mudar)

| Comando            | O que faz                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `npm run images`   | AVIF/WebP em dois tamanhos a partir de `assets/source/`, além do favicon e dos ícones a partir de `assets/icons/favicon.svg` |
| `npm run fonts`    | Copia Inter e DM Sans (variáveis, subconjunto latino) dos pacotes para `assets/fonts/`                                       |
| `npm run og-image` | Regenera `assets/og-image.jpg`, a imagem de compartilhamento (1200 × 630)                                                    |
| `npm run seo`      | Gera canonical, Open Graph absoluto, `robots.txt` e `sitemap.xml` a partir de `site.url`                                     |

**Verificações e testes**

| Comando                | O que faz                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm test`             | Sintaxe, HTML, formatação, CSS e testes unitários                                                                    |
| `npm run test:e2e`     | Testes end-to-end no Chromium                                                                                        |
| `npm run test:e2e:all` | Testes end-to-end no Chromium, Firefox e WebKit (no Linux, o WebKit exige `sudo npx playwright install-deps webkit`) |
| `npm run lighthouse`   | Lighthouse mobile com throttling real (3 execuções); falha abaixo das metas do plano ou da referência inicial        |
| `npm run check:js`     | Sintaxe de `site-config.js`, `tabs.js`, `contact.js` e `script.js`                                                   |
| `npm run check:html`   | Validação do `index.html` (html-validate)                                                                            |
| `npm run check:css`    | `styles.css` atualizado e ausência de CDN, `<style>` no HTML e `!important`                                          |
| `npm run test:unit`    | Testes unitários (`node:test`)                                                                                       |
| `npm run format`       | Formata com Prettier (`npm run format:check` só verifica)                                                            |

**Publicação**

| Comando                 | O que faz                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run check:release` | Falha enquanto número, domínio, URL pública, agenda ou metadados estiverem pendentes ou inválidos |
| `npm run dist`          | Monta `dist/` com só o que é publicado e o arquivo `_headers` (uso em homologação)                |
| `npm run release`       | `check:release` + `dist`: o pacote para produção                                                  |

## Configuração do WhatsApp e da agenda

Todos os dados operacionais ficam em [`site-config.js`](site-config.js). Não espalhe telefone, mensagens ou horários em outros arquivos.

| Campo                  | Para que serve                                                                                        | Situação atual                        |
| ---------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `whatsapp.number`      | Número profissional com DDI 55 e DDD, por exemplo `5571912345678`                                     | Vazio até DEC-01                      |
| `site.url`             | Endereço público com https e barra final; depois de preencher, rode `npm run seo`                     | Vazio até DEC-04                      |
| `site.productionHosts` | Domínios em que o link do WhatsApp fica ativo, por exemplo `['www.dominio.com.br', 'dominio.com.br']` | Vazio até DEC-04                      |
| `modalities`           | Modalidades confirmadas, por exemplo `['online', 'presencial']`                                       | Vazio até DEC-03                      |
| `schedule.mode`        | `'whatsapp-only'` (consulta pelo WhatsApp) ou `'manual-schedule'` (horários publicados)               | `'whatsapp-only'` até DEC-02 e DEC-10 |
| `schedule.days`        | Só no modo manual: `[{ date: 'AAAA-MM-DD', times: ['HH:MM'] }]`                                       | Vazio                                 |
| `schedule.timeZone`    | Fuso usado para esconder datas e horários que já passaram                                             | `America/Bahia`                       |

Como a página se comporta:

- **Sem número válido:** os botões do WhatsApp ficam desativados, com o aviso “O contato pelo WhatsApp está temporariamente indisponível.” Nenhum link externo é gerado.
- **Com número válido, fora de `productionHosts`** (localhost, homologação, testes): os botões ficam desativados com um aviso de ambiente de teste, para que ninguém envie mensagens reais por engano. A URL que seria usada fica no atributo `data-whatsapp-preview`, para conferência.
- **Com número válido, em `productionHosts`:** os botões abrem o WhatsApp com a mensagem pronta.
- **Sem JavaScript:** os botões continuam desativados e um aviso pede para ativar o JavaScript; todo o conteúdo continua visível.
- **Agenda manual:** datas e horários vencidos somem sozinhos; se não sobrar nenhum, aparece a consulta pelo WhatsApp. Cada solicitação informa dia da semana, data completa, ano, horário, modalidade (quando configurada) e que a vaga depende de confirmação.

### Atualizar a agenda manual

1. Em `site-config.js`, ajuste `schedule.days` com as datas e horários confirmados (datas passadas podem ficar; elas são ocultadas).
2. Rode `npm test` e `npm run test:e2e`.
3. Publique de novo (ver [`docs/publicacao.md`](docs/publicacao.md)).

Se a agenda passar a vir de um serviço externo, isso exige uma integração nova, com aprovação do serviço e das credenciais (§6.3 do plano).

## Como o CSS funciona

- **Edite somente `styles.source.css`.** `styles.css` é gerado por `npm run build` e versionado, para que a página funcione em qualquer hospedagem estática. `npm test` falha se ele estiver desatualizado.
- Tailwind CSS compilado localmente, versão `3.4.17`. As classes são lidas de `index.html`, `script.js` e `contact.js`.
- Ordem no arquivo final: base do Tailwind → componentes → estilos próprios → utilitários.
- Não use `!important`: resolva pela especificidade do seletor ou pelas classes do HTML.
- Movimento: as transições usam os tokens `--motion-fast`, `--motion-base` e `--motion-slow`, que viram zero com `prefers-reduced-motion`.
- Prefixos pelo autoprefixer (`browserslist` em `package.json`); minificação por cssnano sem transformações que alterem cores ou gradientes.

## Imagens

- Os originais ficam em `assets/source/` e **não são publicados**. A página usa as versões de `assets/img/` (AVIF e WebP, 1x e 2x da maior área em que a imagem aparece).
- Para trocar ou acrescentar uma foto ou post: coloque o JPEG em `assets/source/`, ajuste a lista `IMAGES` em `scripts/optimize-images.mjs`, rode `npm run images` e atualize o `<picture>` em `index.html` (`srcset`, `sizes`, `width` e `height`).
- Só o primeiro post do carrossel é baixado com a página; os demais recebem a imagem real depois do carregamento (atributos `data-defer-*`). As fotos usam `loading="lazy"`.
- Favicon e ícones: edite `assets/icons/favicon.svg` e rode `npm run images`.

## Testes e integração contínua

- `tests/unit/`: regras de contato, agenda, datas, publicação e SEO.
- `tests/e2e/`: navegação, teclado, menu, abas, agenda, carrosséis, movimento reduzido, estados seguros do contato, FAQ, contraste medido nos pixels, layout em oito larguras, recursos, segurança (CSP), SEO, auditoria axe e capturas de referência.
- Capturas de referência em `tests/e2e/*-snapshots/`, geradas no Chromium/Linux. Para aceitar uma mudança visual intencional: `npx playwright test --project=chromium --update-snapshots` e revise as imagens alteradas antes do commit.
- Para testar outro endereço: `E2E_BASE_URL=https://homologacao.exemplo npx playwright test --project=chromium`.
- O GitHub Actions (`.github/workflows/ci.yml`) roda `npm test`, os testes end-to-end nos três navegadores e o Lighthouse a cada push na `main` e em pull requests.

## Segurança e privacidade

- Nenhum recurso de terceiros é carregado: fontes, imagens e scripts são servidos pelo próprio site. O WhatsApp é apenas um link.
- Os cabeçalhos de segurança (CSP, Referrer-Policy, Permissions-Policy e outros) ficam em `security-headers.json`. O servidor local os aplica, `npm run dist` os grava em `_headers` e os testes falham se houver violação de CSP.
- Não use scripts ou estilos inline: a CSP bloqueia. Dados estruturados em `<script type="application/ld+json">` são permitidos, pois não são executados.

## Estrutura

```text
├── index.html                    página
├── site-config.js                configuração operacional: WhatsApp, domínio, modalidades e agenda
├── tabs.js                       abas acessíveis (padrão WAI-ARIA), usadas no "Sobre" e na agenda
├── contact.js                    contato e agenda: validação, mensagens, datas e estados dos botões
├── script.js                     demais comportamentos (menu, seção ativa, carrosséis, ano do rodapé)
├── styles.source.css             fonte do CSS (edite este)
├── styles.css                    CSS gerado e minificado (não edite)
├── security-headers.json         cabeçalhos de segurança (fonte única)
├── favicon.ico, site.webmanifest favicon e manifesto
├── assets/                       logotipo, arte decorativa e imagem de compartilhamento
│   ├── source/                   originais das imagens (não publicados)
│   ├── img/                      imagens otimizadas geradas
│   ├── icons/                    favicon.svg (fonte) e ícones gerados
│   └── fonts/                    fontes e licenças
├── scripts/                      servidor local, build, imagens, SEO, pacote e verificações
├── docs/                         aprovação de conteúdo, publicação e homologação
├── tests/unit/, tests/e2e/       testes
├── tests/tools/                  comparação de estilo computado (usada na migração do CSS)
├── tests/baseline/               medição de referência do commit-base (não sobrescrever)
├── tailwind.config.js, postcss*.config.js, playwright.config.js, .htmlvalidate.json, .prettierrc.json
└── .github/workflows/ci.yml      integração contínua
```
