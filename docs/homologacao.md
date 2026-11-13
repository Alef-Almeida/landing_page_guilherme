# Homologação

Checklist de homologação (IMP-706), resultado da regressão final (IMP-707) e limitações aceitas (IMP-708). Os itens seguem o checklist de liberação da §13 do plano.

Legenda: **✓** verificado, com a evidência indicada; **◐** verificado em parte; **○** pendente de decisão ou de ação do responsável.

## 1. Regressão final (2026-11-13)

Executada no commit de integração da FR-07, nesta máquina (Linux, Node 24):

| Verificação                                                                             | Resultado                                                                    |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `npm test` (sintaxe, HTML, formatação, CSS, 23 testes unitários)                        | Aprovado                                                                     |
| `npm run test:e2e` — Chromium, 87 testes                                                | Aprovado                                                                     |
| `npx playwright test --project=firefox` — 64 testes (23 exclusivos do Chromium pulados) | Aprovado                                                                     |
| Suíte Chromium contra o pacote `dist/` servido com os cabeçalhos                        | Aprovado (87 testes)                                                         |
| `npm run lighthouse` — mobile, throttling real, mediana de 3                            | Desempenho 97, acessibilidade 100, boas práticas 100, SEO 100                |
| `npm audit`                                                                             | 0 vulnerabilidades                                                           |
| `npm run check:release`                                                                 | Bloqueia a publicação, como esperado: faltam DEC-01 e DEC-04                 |
| WebKit                                                                                  | Não executado localmente (dependências do sistema exigem `sudo`); roda no CI |

Comparação com a medição inicial do commit-base (IMP-007, IMP-633):

| Métrica (mobile)                 |                 Commit-base |  Agora |
| -------------------------------- | --------------------------: | -----: |
| Lighthouse desempenho            |                          73 |     97 |
| Lighthouse acessibilidade        |                          90 |    100 |
| Lighthouse boas práticas         |                          96 |    100 |
| Largest Contentful Paint         |                      7,21 s | 2,15 s |
| Peso total transferido           |                    2.414 KB | 649 KB |
| Violações axe críticas ou sérias |                    2 regras |      0 |
| Recursos de terceiros            | Tailwind CDN e Google Fonts | Nenhum |

O commit-base foi medido com o throttling simulado padrão do Lighthouse; as medições atuais usam throttling real, mais conservador para o LCP.

## 2. Checklist de liberação

### Conversão

| Item                                        | Estado | Evidência ou pendência                                                  |
| ------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| Número real validado                        | ○      | DEC-01; validação automática em `contact.js` e `check:release`          |
| Mensagem principal revisada                 | ◐      | Texto em `site-config.js`; falta aprovação do responsável (IMP-510)     |
| Mensagem de agenda contém data e horário    | ✓      | `tests/unit/contact.test.js`, `tests/e2e/componentes-movimento.spec.js` |
| Disponibilidade não é simulada              | ✓      | Modo `whatsapp-only`; agenda demonstrativa removida                     |
| Estado sem horário funciona                 | ✓      | `tests/e2e/contato.spec.js`                                             |
| Nenhuma data demonstrativa ou vencida       | ✓      | Testes unitários IMP-602                                                |
| Testes e homologação não geram contato real | ✓      | `site.productionHosts`; `tests/e2e/contato.spec.js`                     |

### Usabilidade e acessibilidade

| Item                                                                                          | Estado | Evidência ou pendência                                                                            |
| --------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------- |
| Ordem visual e DOM equivalentes                                                               | ✓      | `tests/e2e/estrutura-navegacao.spec.js`                                                           |
| Conteúdo essencial disponível sem JavaScript                                                  | ✓      | Testes sem JavaScript em `estrutura-navegacao` e `contato`                                        |
| Menu mobile acessível                                                                         | ✓      | Testes de teclado, Escape e foco                                                                  |
| Abas acessíveis por teclado                                                                   | ✓      | `componentes-movimento.spec.js`                                                                   |
| Agenda expõe o dia selecionado e a atualização do painel                                      | ✓      | `componentes-movimento.spec.js`, `acessibilidade.spec.js`                                         |
| Carrosséis com pausa e redução de movimento                                                   | ✓      | `componentes-movimento.spec.js`                                                                   |
| Só slides ativos são anunciados                                                               | ✓      | `componentes-movimento.spec.js`                                                                   |
| Contraste AA                                                                                  | ✓      | `contraste.spec.js` (pixels reais) e axe                                                          |
| Alvos de toque adequados                                                                      | ✓      | `layout.spec.js`                                                                                  |
| Foco visível e ordem de foco                                                                  | ✓      | `layout.spec.js`, `estrutura-navegacao.spec.js`                                                   |
| Cabeçalho em 320 a 1440 px sem compressão ou quebra                                           | ✓      | `layout.spec.js` e capturas de referência                                                         |
| Hero, textos e CTAs sem corte em 320 px e com zoom                                            | ✓      | `layout.spec.js` (inclui 640 px = 200% de zoom)                                                   |
| Card do hero dentro do contêiner                                                              | ✓      | `layout.spec.js`                                                                                  |
| Transições não bloqueiam e respeitam redução de movimento                                     | ✓      | `componentes-movimento.spec.js`                                                                   |
| Ritmo vertical aprovado                                                                       | ◐      | Alturas mínimas artificiais removidas e capturas revisadas; falta aprovação visual do responsável |
| Painel de acessibilidade (texto até 200%, contraste, fontes, espaçamento, links, guia, pausa) | ✓      | `preferencias-acessibilidade.spec.js` (320 a 1280 px, axe nos modos)                              |
| Tradução em Libras (VLibras) sob demanda                                                      | ✓      | `preferencias-acessibilidade.spec.js` (simulado) e verificação manual com o VLibras real          |
| Mais contraste, cores forçadas e tamanho de texto do sistema                                  | ✓      | `preferencias-acessibilidade.spec.js`                                                             |
| Leitor de tela real e dispositivos físicos                                                    | ○      | Roteiro na seção 3                                                                                |

### Desempenho e qualidade

| Item                                                             | Estado | Evidência ou pendência                                          |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------------------- |
| Tailwind CDN removido                                            | ✓      | `npm run check:css`                                             |
| Imagens otimizadas e responsivas                                 | ✓      | `assets/img/`, `recursos.spec.js`                               |
| Lazy loading                                                     | ✓      | `recursos.spec.js`                                              |
| Logotipo sem deformação                                          | ✓      | `layout.spec.js`                                                |
| Favicon sem 404                                                  | ✓      | `recursos.spec.js`                                              |
| CTA e agenda seguros com falha de configuração ou sem JavaScript | ✓      | `contato.spec.js`                                               |
| Recursos de terceiros reduzidos ao necessário                    | ✓      | `seguranca.spec.js` (nenhuma requisição externa)                |
| Cabeçalhos de segurança validados na hospedagem                  | ○      | DEC-04; roteiro em [`publicacao.md`](publicacao.md)             |
| Build reprodutível                                               | ✓      | `npm ci` + `npm run build` sem diferenças; clone limpo na FR-01 |
| Testes e CI aprovados                                            | ◐      | Local aprovado; o workflow roda após o primeiro push            |
| End-to-end em Chromium, Firefox e WebKit                         | ◐      | Chromium e Firefox aprovados; WebKit no CI                      |
| Métricas finais comparadas ao baseline                           | ✓      | Seção 1                                                         |

### Conteúdo e publicação

| Item                                          | Estado | Evidência ou pendência                                                                      |
| --------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| Domínio e canonical                           | ○      | DEC-04; `npm run seo` pronto                                                                |
| SEO e compartilhamento                        | ◐      | Título, descrição, Open Graph, JSON-LD e imagem prontos; URLs absolutas dependem do domínio |
| Privacidade e conteúdo profissional aprovados | ○      | DEC-07, IMP-510; rascunho em [`conteudo-para-aprovacao.md`](conteudo-para-aprovacao.md)     |
| FAQ com dúvidas operacionais confirmadas      | ○      | DEC-09; rascunhos no mesmo documento                                                        |
| Rodapé com informações reais suficientes      | ○      | DEC-06, DEC-09                                                                              |
| Mockup do Instagram sem controles sem ação    | ✓      | Alternativa provisória de DEC-08; `seo.spec.js`                                             |
| Ano do rodapé sem manutenção manual           | ✓      | `seo.spec.js`                                                                               |
| Plano, relatórios e homologação versionados   | ✓      | Repositório                                                                                 |
| README completo                               | ✓      | [`README.md`](../README.md)                                                                 |
| Homologação registrada                        | ◐      | Este documento; falta a etapa com dados reais (seção 4)                                     |
| Rollback documentado                          | ✓      | [`publicacao.md`](publicacao.md), seção 6                                                   |

## 3. Roteiro manual (antes de publicar)

Itens que os testes automáticos não substituem:

1. **Dispositivos físicos:** abrir a página num iPhone (Safari) e num Android (Chrome); conferir hero, menu, carrosséis, agenda e botões em retrato e paisagem.
2. **Leitor de tela:** VoiceOver (iOS ou macOS) e NVDA ou TalkBack; percorrer a página por títulos e landmarks, usar o menu, as abas, o carrossel, o painel de acessibilidade e os botões do WhatsApp.
3. **Acessibilidade ampliada:** no celular, ativar cada opção do painel e conferir a leitura; abrir o VLibras e conferir que o avatar traduz um trecho selecionado.
4. **WhatsApp real:** no domínio de produção, tocar nos botões e confirmar que o WhatsApp abre com a mensagem correta e o número do profissional, sem precisar enviar.
5. **Revisão de conteúdo** pelo responsável: textos, fotos, posts e dados profissionais (IMP-510).

## 4. Homologação com dados reais

Preencher depois das decisões:

- [ ] `site-config.js` completo e `npm run seo` executado
- [ ] `npm run release` aprovado
- [ ] Publicação em ambiente de homologação ou produção
- [ ] Verificações pós-publicação de [`publicacao.md`](publicacao.md), seção 5
- [ ] Roteiro manual da seção 3
- [ ] Aprovação explícita do responsável (IMP-709)

## 5. Limitações aceitas e pendências pós-publicação (IMP-708)

**Limitações aceitas**

- O link do WhatsApp depende de JavaScript, porque o número fica em `site-config.js`. Sem JavaScript o botão fica desativado e um aviso orienta o visitante. Todo o conteúdo continua visível.
- As capturas de referência foram geradas no Chromium/Linux; se o CI renderizar diferente, devem ser regeneradas a partir do artefato do CI.
- Os scripts não são minificados (cerca de 7 KB de economia possível), um ganho pequeno diante da compressão do servidor.
- Com rede rápida, o Chrome antecipa imagens `lazy` a até ~2.500 px da área visível; as fotos podem ser baixadas antes da rolagem no mobile.

**Pendências de conteúdo**

- Ordem dos posts do carrossel invertida em relação à numeração da série (DEC-08).
- Confirmar quem aparece nas fotos e a autorização de uso das imagens, inclusive das crianças nos posts (IMP-509).
- Cards “Em breve” (DEC-05) e link do Instagram (DEC-06).

**Pendências pós-publicação**

- Primeira execução do CI no GitHub, incluindo o WebKit.
- Validação dos cabeçalhos na hospedagem e, se aplicável, do HSTS com `includeSubDomains`.
- Envio do `sitemap.xml` às ferramentas de busca e verificação do compartilhamento.
- Lighthouse no endereço público.
