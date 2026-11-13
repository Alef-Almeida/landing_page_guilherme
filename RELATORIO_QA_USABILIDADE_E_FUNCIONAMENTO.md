# Relatório de QA — Usabilidade e funcionamento

## 1. Identificação

| Item | Valor |
| --- | --- |
| Projeto | `landing_page_guilherme` |
| Data dos testes | 06/11/2026 |
| Branch | `main` |
| Commit | `0720985` — `Add Guilherme psychology landing page` |
| Tipo de teste | Funcional, responsivo, usabilidade e acessibilidade exploratória |
| Ambiente | Servidor HTTP local em `127.0.0.1` |
| Viewport desktop | 1280 × 720 px |
| Viewport mobile | 390 × 844 px |

Este documento complementa o relatório geral do projeto. Nenhuma correção foi realizada no código durante esta rodada; somente este relatório foi adicionado.

## 2. Objetivo

Avaliar a experiência de um visitante que deseja:

1. compreender o serviço oferecido;
2. conhecer o profissional;
3. navegar pelas seções;
4. consultar dúvidas;
5. escolher um horário;
6. iniciar contato pelo WhatsApp.

A auditoria também verificou comportamento responsivo, navegação por teclado, representação na árvore de acessibilidade, clareza das ações, carregamento de recursos e mensagens do navegador.

## 3. Escopo e limitações

### Incluído

- carregamento da página em desktop e mobile;
- navegação principal e menu mobile;
- âncoras e posição das seções;
- FAQ;
- abas da seção “Sobre”;
- carrosséis;
- agenda e geração dos links de horário;
- CTA principal do WhatsApp;
- inspeção de imagens, console e requisições locais;
- navegação por teclado em componentes selecionados;
- verificação exploratória de contraste, alvos de toque e ordem de leitura.

### Não incluído

- envio real de mensagem pelo WhatsApp;
- reserva ou confirmação real de consulta;
- testes com backend, pois ele não existe no projeto;
- testes em Safari, Firefox ou dispositivos físicos;
- teste com usuário real;
- auditoria formal completa WCAG com tecnologia assistiva real;
- teste de carga, pentest ou avaliação jurídica/regulatória.

Os links externos foram inspecionados sem concluir contato com terceiros.

## 4. Critérios de severidade

| Severidade | Definição |
| --- | --- |
| Bloqueador | Impede a função principal ou inviabiliza a publicação |
| Alta | Prejudica significativamente a conversão, entendimento ou acessibilidade |
| Média | Causa dificuldade relevante, inconsistência ou custo de manutenção |
| Baixa | Problema pontual, cosmético ou de menor impacto imediato |

## 5. Resumo do resultado

A página apresentou boa estabilidade visual nos dois tamanhos testados. O conteúdo principal foi renderizado, as imagens locais carregaram, as seções permaneceram dentro da largura da tela e as interações básicas responderam sem erros JavaScript.

Entretanto, a jornada principal não pode ser considerada aprovada para produção porque todo o contato aponta para um número fictício. A agenda também apresenta disponibilidade apenas demonstrativa e envia uma mensagem sem a data selecionada.

O maior conjunto de riscos de usabilidade está em acessibilidade:

- textos pequenos com contraste insuficiente;
- ordem visual diferente da ordem de leitura do documento;
- controles de carrossel com aproximadamente 5 × 5 px;
- abas sem navegação por setas;
- menu mobile sem informar seu estado;
- carrosséis automáticos sem pausa ou redução de movimento;
- slides invisíveis visualmente, mas ainda expostos a leitores de tela.

### Síntese dos cenários

| Resultado | Quantidade |
| --- | ---: |
| Aprovado | 6 |
| Aprovado com ressalvas | 5 |
| Reprovado | 3 |
| Total | 14 |

## 6. Casos de teste executados

| ID | Cenário | Resultado | Evidência resumida |
| --- | --- | --- | --- |
| CT-01 | Abrir a página em desktop | Aprovado | Conteúdo, fontes, CSS, JavaScript e imagens renderizados |
| CT-02 | Abrir a página em mobile | Aprovado | Hero legível e sem rolagem horizontal |
| CT-03 | Navegar pelo menu desktop | Aprovado | Âncora e item ativo atualizados; título da agenda ficou abaixo do cabeçalho |
| CT-04 | Abrir e usar o menu mobile | Com ressalvas | Abre, fecha após seleção e navega; faltam atributos de estado |
| CT-05 | Abrir uma resposta do FAQ | Aprovado | `details` expande e expõe a resposta corretamente |
| CT-06 | Alternar abas da seção “Sobre” | Com ressalvas | Clique altera conteúdo; teclado por setas não funciona |
| CT-07 | Selecionar outro dia da agenda | Aprovado | Dia, título e lista de horários são atualizados |
| CT-08 | Usar o CTA principal do WhatsApp | Reprovado | Link aponta para `5500000000000` |
| CT-09 | Solicitar um horário da agenda | Reprovado | Link usa número fictício e mensagem não contém dia/data |
| CT-10 | Usar o carrossel de posts | Com ressalvas | Alternância automática funciona; controles e acessibilidade inadequados |
| CT-11 | Carregar as imagens da página | Com ressalvas | Todas carregam, mas todas são requisitadas imediatamente |
| CT-12 | Validar layout responsivo da agenda | Aprovado | Painel permaneceu dentro da viewport mobile |
| CT-13 | Navegar na ordem lógica por teclado/leitor de tela | Reprovado | Ordem do DOM diverge da ordem visual e slides ocultos são anunciáveis |
| CT-14 | Inspecionar console e requisições | Com ressalvas | Sem erro de aplicação; aviso do Tailwind CDN e favicon 404 |

## 7. Funcionalidades aprovadas

### 7.1 Carregamento e estabilidade

- Não ocorreu exceção JavaScript durante os fluxos testados.
- Todas as imagens locais terminaram o carregamento com dimensões válidas.
- Os arquivos HTML, CSS, JavaScript e assets responderam com HTTP 200.
- A única resposta local 404 foi `/favicon.ico`.

### 7.2 Responsividade

- Em 1280 px, o conteúdo não ultrapassou a largura útil do documento.
- Em 390 px, não foi detectado overflow horizontal do conteúdo.
- A agenda mobile ocupou de 24 px a 351 px em uma viewport de 390 px.
- Os quatro dias da agenda permaneceram visíveis na mesma linha.
- Hero, CTAs e texto introdutório permaneceram legíveis no mobile.

### 7.3 Navegação

- O menu desktop direciona corretamente para as seções.
- Ao selecionar “Agenda”, o hash mudou para `#agenda`.
- O título da agenda ficou a 140 px do topo, abaixo do cabeçalho fixo de 83 px.
- O menu mobile abre e fecha após a escolha de uma seção.
- O destaque do item ativo acompanhou a seção observada.

### 7.4 Componentes

- FAQ funciona com o comportamento nativo de `details`/`summary`.
- As abas alteram corretamente o texto quando acionadas por clique.
- A troca do dia da agenda atualiza os horários.
- O carrossel troca o slide automaticamente.
- O foco padrão do navegador permanece visível nos botões testados.

## 8. Defeitos e oportunidades de melhoria

### QA-001 — Todos os CTAs de conversão usam um número fictício

**Severidade:** Bloqueador  
**Área:** Conversão / funcionamento

**Evidência:** `script.js:2` define `5500000000000`. O CTA principal e todos os links da agenda usam esse valor.

**Comportamento atual:** o visitante é direcionado para um destinatário inválido.

**Comportamento esperado:** todo CTA deve abrir uma conversa com o número profissional confirmado.

**Critério de aceite:**

- configurar o número real com código do país e DDD;
- validar o link em desktop e celular;
- garantir que todos os CTAs utilizem a mesma configuração;
- confirmar que nenhum ambiente de homologação contata uma pessoa indevidamente.

### QA-002 — A solicitação de horário não informa a data selecionada

**Severidade:** Alta  
**Área:** Agenda / clareza

**Evidência:** após selecionar quinta-feira, 12 de novembro de 2026, o link informa somente “horário de 09:30”, “11:00” ou “17:00”. `createWhatsAppUrl` recebe apenas `time`.

**Impacto:** o profissional não sabe qual dia o visitante escolheu.

**Critério de aceite:** a mensagem deve conter dia da semana, data completa, horário, modalidade desejada e indicação de que a vaga ainda depende de confirmação.

### QA-003 — A agenda demonstrativa parece disponibilidade real

**Severidade:** Alta  
**Área:** Confiança / operação

**Evidência:** são exibidos dias e horários específicos, mas os dados são fixos em `script.js` e não existe fonte de disponibilidade.

**Impacto:** o usuário pode interpretar um horário como disponível quando ele já não existe. As datas também ficam obsoletas sem nova publicação.

**Critério de aceite:** integrar uma fonte confiável de agenda ou trocar a grade por uma consulta genérica de disponibilidade via WhatsApp.

### QA-004 — Textos importantes não alcançam contraste mínimo para texto normal

**Severidade:** Alta  
**Área:** Acessibilidade / legibilidade

Foram encontrados textos entre 12 px e 18 px usando o azul `#17324D` com opacidade sobre fundos claros. Os contrastes calculados sobre `#F8F5F1` foram:

| Opacidade | Contraste aproximado |
| ---: | ---: |
| 50% | 2,85:1 |
| 55% | 3,25:1 |
| 60% | 3,73:1 |
| 65% | 4,29:1 |

Para texto normal, o objetivo WCAG AA é 4,5:1. Exemplos observados:

- descrição principal: 18 px, peso 400, opacidade 65%;
- nota “Atendimento ético…”: 12 px, opacidade 50%;
- parágrafo da seção “Sobre”: 16 px, opacidade 60%;
- aviso da agenda: 12 px, opacidade 55%.

**Critério de aceite:** todos os textos normais devem atingir pelo menos 4,5:1 e elementos gráficos/controles relevantes, 3:1.

### QA-005 — Ordem visual e ordem de leitura são diferentes

**Severidade:** Alta  
**Área:** Acessibilidade / navegação

**Evidência:** no DOM, `#contato` aparece antes de `#agenda`. O CSS aplica `order: 99` ao contato, fazendo a agenda aparecer primeiro visualmente.

No desktop, as posições visuais medidas foram:

- agenda: 4059 px;
- contato: 4896 px.

Na árvore de acessibilidade e na ordem de foco, contato continua antes de agenda.

**Impacto:** usuários de teclado e leitor de tela percorrem uma sequência diferente da que é apresentada visualmente.

**Critério de aceite:** colocar as seções na ordem final diretamente no HTML e remover a reordenação por CSS.

### QA-006 — Alvos de toque pequenos demais

**Severidade:** Alta  
**Área:** Mobile / acessibilidade motora

Medições no viewport mobile:

- botão do menu: aproximadamente 38 × 26 px;
- nove indicadores do carrossel: aproximadamente 5 × 5 px;
- links “Quero saber mais”: cerca de 20 px de altura;
- links dos cards de conteúdo: cerca de 19 px de altura;
- abas da seção “Sobre”: cerca de 43 px de altura.

Os indicadores do carrossel são especialmente difíceis de selecionar. Como referência prática, os alvos devem ter aproximadamente 44 × 44 px ou espaçamento equivalente.

**Critério de aceite:** ampliar a área clicável sem depender apenas do tamanho visual do ícone.

### QA-007 — Carrosséis não são adequados para teclado, leitor de tela ou redução de movimento

**Severidade:** Alta  
**Área:** Acessibilidade / movimento

**Evidências:**

- o slide troca automaticamente;
- não há botão de pausar;
- não existe regra `prefers-reduced-motion`;
- pausa por `mouseenter` não atende teclado ou toque;
- as nove imagens do Instagram e as duas fotografias aparecem na árvore de acessibilidade mesmo quando visualmente ocultas por `opacity: 0`;
- os indicadores estão dentro de `role="tablist"`, mas os botões não implementam integralmente o padrão de abas.

**Impacto:** excesso de anúncios para leitor de tela, movimento sem controle e navegação confusa.

**Critério de aceite:**

- anunciar somente o slide ativo;
- usar `aria-hidden`/`inert` de forma coerente nos inativos;
- fornecer pausa e retomada;
- pausar com foco e interação;
- respeitar redução de movimento;
- implementar um padrão acessível de carrossel, sem ARIA parcial.

### QA-008 — Abas funcionam por clique, mas não pelo padrão esperado de teclado

**Severidade:** Média  
**Área:** Teclado / ARIA

**Evidência:** ao pressionar `ArrowRight` em “Escuta que considera”, o foco e a seleção permaneceram na mesma aba. Todos os botões também permanecem na ordem de Tab.

**Critério de aceite:** implementar setas esquerda/direita, Home/End, `tabindex` gerenciado, `aria-controls`, IDs de painel e associação semântica completa.

### QA-009 — Menu mobile não informa se está aberto

**Severidade:** Média  
**Área:** Acessibilidade

**Evidência:** o menu abre visualmente, mas o botão continua com `aria-label="Abrir menu"` e não possui `aria-expanded` nem `aria-controls`.

**Critério de aceite:** atualizar rótulo e `aria-expanded`, relacionar o botão ao menu e manter foco previsível ao abrir e fechar.

### QA-010 — Todas as imagens são baixadas no carregamento inicial

**Severidade:** Média  
**Área:** Desempenho percebido

**Evidência:** as requisições iniciais incluem nove posts, duas fotografias, logotipo e elementos decorativos. Nenhuma imagem usa `loading="lazy"`. Os assets de imagem somam aproximadamente 2,21 MB.

**Impacto:** maior consumo de dados e atraso em redes móveis, mesmo para imagens que só serão vistas depois.

**Critério de aceite:**

- priorizar somente a imagem inicialmente visível;
- usar lazy loading nas demais;
- fornecer `width`/`height` ou `aspect-ratio` estável;
- gerar WebP/AVIF e tamanhos responsivos;
- validar LCP e CLS com Lighthouse.

### QA-011 — Logotipo é deformado pelo limite de altura

**Severidade:** Média  
**Área:** Identidade visual

**Evidência:** o arquivo original mede 316 × 158 px, proporção 2:1. No mobile, o elemento foi renderizado em 158 × 44 px, proporção aproximada 3,59:1.

**Impacto:** a marca fica achatada verticalmente e os textos internos perdem legibilidade.

**Critério de aceite:** preservar a proporção natural, definir apenas uma dimensão principal ou usar um contêiner com `object-fit: contain` sem forçar largura e altura incompatíveis.

### QA-012 — Tailwind por CDN gera aviso explícito de ambiente não produtivo

**Severidade:** Média  
**Área:** Desempenho / confiabilidade

**Evidência do console:** o próprio Tailwind informa que `cdn.tailwindcss.com` não deve ser usado em produção e recomenda CLI ou PostCSS.

**Impacto:** dependência externa em tempo de execução, CSS não otimizado e risco de indisponibilidade ou mudança externa.

**Critério de aceite:** compilar um CSS estático, versionado e minificado no processo de build.

### QA-013 — Favicon ausente

**Severidade:** Baixa  
**Área:** Acabamento

**Evidência:** `GET /favicon.ico` respondeu HTTP 404.

**Critério de aceite:** adicionar favicon e declarar os formatos necessários no `<head>`.

### QA-014 — Links “Em breve” executam uma ação inesperada

**Severidade:** Baixa  
**Área:** Clareza de conteúdo

**Evidência:** os dois primeiros cards exibem “Em breve →”, porém levam à seção de contato.

**Impacto:** “Em breve” sugere conteúdo indisponível, não um convite para conversar.

**Critério de aceite:** remover a aparência de link até o conteúdo existir ou alterar o texto para uma ação coerente, como “Conversar sobre este tema”.

## 9. Avaliação por dimensão

| Dimensão | Avaliação | Observação |
| --- | --- | --- |
| Clareza da proposta | Boa | Serviço e públicos aparecem logo no início |
| Arquitetura de informação | Boa com ressalvas | Seções claras, mas ordem DOM/visual diverge |
| Navegação desktop | Boa | Links e indicação ativa funcionam |
| Navegação mobile | Regular | Funciona, mas estado não é anunciado |
| Conversão | Reprovada | WhatsApp fictício inviabiliza a jornada |
| Agenda | Reprovada | Dados demonstrativos e mensagem sem data |
| Responsividade | Boa nos tamanhos testados | Sem overflow horizontal detectado |
| Acessibilidade | Insuficiente | Contraste, carrossel, ordem e teclado |
| Desempenho percebido | Regular | Todas as imagens são carregadas de imediato |
| Robustez | Regular | Sem erros no fluxo, mas depende de CDN e JavaScript |
| Conteúdo | Bom com ressalvas | Linguagem clara; ações “Em breve” são ambíguas |

## 10. Priorização recomendada

### Antes de qualquer publicação

1. QA-001 — configurar o WhatsApp real;
2. QA-002 — incluir data completa na mensagem;
3. QA-003 — remover ou tornar real a disponibilidade;
4. testar os CTAs em ambiente de homologação;
5. confirmar textos, horários, modalidades e dados profissionais.

### Primeira rodada de usabilidade e acessibilidade

1. QA-004 — corrigir contraste;
2. QA-005 — alinhar ordem visual e DOM;
3. QA-006 — ampliar alvos de toque;
4. QA-007 — tornar os carrosséis controláveis e acessíveis;
5. QA-008 — completar comportamento das abas;
6. QA-009 — corrigir estado do menu mobile.

### Preparação técnica de produção

1. QA-010 — otimizar imagens e carregamento;
2. QA-011 — corrigir proporção do logotipo;
3. QA-012 — compilar Tailwind localmente;
4. QA-013 — adicionar favicon;
5. executar Lighthouse, axe e testes cross-browser.

## 11. Roteiro de regressão após as correções

### Navegação

- validar todas as âncoras em desktop e mobile;
- confirmar que o cabeçalho não encobre títulos;
- verificar item ativo ao rolar para cima e para baixo;
- testar Voltar/Avançar do navegador após uso das âncoras.

### Conversão

- conferir número e texto do CTA principal;
- conferir data, horário e modalidade em cada link da agenda;
- testar todos os dias da agenda;
- confirmar comportamento quando não houver horários.

### Teclado e acessibilidade

- percorrer toda a página somente com Tab e Shift+Tab;
- verificar foco visível;
- testar Escape no menu quando aplicável;
- testar setas, Home e End nas abas;
- testar pausa dos carrosséis;
- verificar que somente o slide ativo é anunciado;
- repetir a navegação com leitor de tela.

### Responsividade

- 320 px, 360 px, 390 px e 430 px;
- tablet em retrato e paisagem;
- desktop em 1024 px, 1280 px, 1440 px e largura ampliada;
- zoom do navegador em 200%;
- orientação e textos longos.

### Desempenho

- verificar que imagens fora da tela não são baixadas imediatamente;
- medir LCP, CLS e INP;
- testar rede móvel lenta;
- validar funcionamento quando fontes externas falharem.

## 12. Parecer final de QA

A landing page oferece uma boa primeira impressão, conteúdo claro e comportamento responsivo estável nos tamanhos testados. Os fluxos informativos estão funcionalmente maduros para um protótipo.

O fluxo de conversão, porém, está reprovado: o número é fictício e a agenda não representa uma disponibilidade confiável. Além disso, as barreiras de acessibilidade são relevantes o suficiente para afetar usuários com baixa visão, mobilidade reduzida, navegação por teclado ou leitor de tela.

Recomenda-se liberar a página como oficial somente após resolver os três primeiros defeitos, executar a primeira rodada de acessibilidade e repetir este roteiro de regressão. Até lá, o estado adequado é **homologação / protótipo**, não produção.
