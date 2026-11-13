# Plano de implementação colaborativo — Landing Page Guilherme

## 1. Finalidade deste documento

Este é o documento central de planejamento, coordenação e acompanhamento da evolução da landing page. Ele foi criado para ser utilizado por esta conversa e pelas outras conversas que trabalham no mesmo repositório.

O documento possui quatro funções:

1. definir o que será implementado e em qual ordem;
2. impedir que trabalhos paralelos alterem os mesmos arquivos sem coordenação;
3. manter critérios de aceite e validações compartilhados;
4. permitir que cada conversa acrescente sua parte sem apagar o histórico das demais.

### Fontes do plano

- `RELATORIO_ESTADO_DO_PROJETO.md`;
- `RELATORIO_QA_USABILIDADE_E_FUNCIONAMENTO.md`;
- auditoria complementar de frontend executada em 2026-11-06, com validação renderizada nos viewports de 320, 375, 768, 1024 e 1280 px;
- auditoria visual especializada executada em 2026-11-06, com inspeção das seções, interações e composição nos viewports de 1440 × 900, 390 × 844 e 320 × 720 px;
- commit-base `0720985` — `Add Guilherme psychology landing page`.

### Regra principal

Este plano é a **fonte única de coordenação**. Os relatórios continuam sendo evidências da auditoria e não devem ser reescritos como se os problemas já estivessem resolvidos. A situação atual e as implementações futuras devem ser registradas neste documento.

## 2. Objetivo da implementação

Transformar o protótipo atual em uma landing page de produção que seja:

- funcional para contato e solicitação de horários;
- clara sobre o que é ou não disponibilidade real;
- acessível por teclado, leitor de tela e dispositivos de toque;
- responsiva e visualmente consistente;
- mais rápida em redes móveis;
- independente do compilador Tailwind executado pela CDN;
- testável e publicável por um processo documentado;
- simples de manter, preservando a arquitetura estática sempre que possível.

### 2.1 Baseline visual a preservar

A implementação atual já possui qualidades que não devem ser perdidas durante a correção técnica:

- identidade acolhedora e coerente com o serviço de psicologia;
- hierarquia tipográfica forte e proposta de valor clara na primeira dobra;
- paleta azul, pêssego e neutros aplicada de forma consistente;
- cards de atendimento com boa diferenciação entre públicos;
- seção “Sobre” com fotografia, apresentação, abordagem e CRP em posição de destaque;
- alternância entre seções claras e escuras, criando ritmo e separação visual;
- agenda e contato com composição visual clara e CTA reconhecível;
- organização satisfatória no viewport de 390 px.

O estado atual deve ser tratado como **protótipo visual avançado**, não como produto pronto para publicação. Correções de acessibilidade, conversão, responsividade e desempenho não devem descaracterizar os pontos fortes acima.

## 3. Resultado esperado

Ao final do plano, o projeto deverá possuir:

- número profissional real ou configuração segura para recebê-lo;
- fluxo de agenda coerente com a operação escolhida;
- mensagens de WhatsApp com data, horário e contexto completos;
- HTML na mesma ordem visual, de leitura e de foco;
- menu, abas, carrosséis e FAQ acessíveis;
- contrastes e áreas de toque adequados;
- carrosséis controláveis e compatíveis com redução de movimento;
- imagens responsivas, otimizadas e carregadas sob demanda;
- logotipo sem deformação;
- cabeçalho estável nos breakpoints intermediários, sem compressão da marca ou quebra indevida do CTA;
- hero, textos, botões, cards e elementos decorativos sem corte ou colisão em 320 px;
- ritmo vertical consistente, sem espaços vazios excessivos ou seções artificialmente alongadas;
- movimento visual contido, sem bloquear ou atrasar a navegação interna;
- elementos que parecem interativos com ação real e coerente, ou assumidos semanticamente como decorativos;
- conteúdo essencial (textos, primeira aba, primeiro slide e caminho de contato) disponível no HTML estático, mesmo sem JavaScript;
- FAQ e rodapé com informações suficientes para reduzir dúvidas e reforçar confiança, sem inventar dados não aprovados;
- seleção de dia da agenda exposta visual e semanticamente;
- estado seguro e compreensível quando JavaScript ou a configuração operacional não estiverem disponíveis;
- Tailwind compilado localmente;
- CSS consolidado e formatado;
- SEO técnico mínimo e favicon;
- testes automatizados dos fluxos críticos;
- checklist de regressão e documentação de publicação.

### Execução prevista por esta conversa

Se nenhuma outra conversa assumir formalmente uma frente, esta conversa irá:

1. coordenar o quadro, dependências e reservas de arquivos;
2. executar primeiro a fundação de build e organização do CSS;
3. implementar o fluxo de WhatsApp e agenda após as decisões do responsável;
4. corrigir estrutura, acessibilidade e comportamento responsivo;
5. integrar otimização de imagens, SEO e acabamento;
6. criar e executar testes unitários, end-to-end e auditorias de acessibilidade;
7. revisar as contribuições acrescentadas por outras conversas;
8. realizar a regressão final e produzir o registro de homologação.

Quando outra conversa assumir uma frente, esta conversa atuará como integradora: verificará compatibilidade com as demais mudanças, executará os testes compartilhados e atualizará o estado global sem apagar o registro do colaborador.

## 4. Decisões necessárias do responsável pelo projeto

As decisões abaixo não devem ser inventadas por nenhuma conversa. Quando não houver resposta, a implementação deverá seguir a alternativa provisória recomendada e registrar a pendência.

| ID | Decisão | Alternativa recomendada | Situação |
| --- | --- | --- | --- |
| DEC-01 | Qual é o número profissional do WhatsApp? | Manter configuração bloqueada para produção até o número ser informado | Pendente |
| DEC-02 | A agenda será real, manual ou apenas consulta pelo WhatsApp? | Remover horários específicos e usar “Consultar disponibilidade” até existir integração confiável | Pendente |
| DEC-03 | Quais modalidades estão realmente disponíveis? | Não afirmar “online ou presencial” sem confirmação | Pendente |
| DEC-04 | Qual é o domínio e a hospedagem? | Preparar build estático independente de provedor | Pendente |
| DEC-05 | Os cards “Em breve” devem ser removidos, desabilitados ou levar a outro destino? | Exibir como conteúdo indisponível, sem link enganoso | Pendente |
| DEC-06 | Qual é o perfil oficial do Instagram? | Não criar link externo enquanto o endereço não for confirmado | Pendente |
| DEC-07 | Existe texto aprovado de privacidade e divulgação profissional? | Criar espaço estrutural, mas aguardar conteúdo revisado | Pendente |
| DEC-08 | O mockup/carrossel do Instagram no hero será funcional, levará ao perfil ou será apenas editorial? | Remover affordances de curtir/comentar/compartilhar e tratá-lo como peça editorial enquanto não houver destino oficial | Pendente |
| DEC-09 | Quais informações operacionais podem constar no FAQ e no rodapé, como local, duração, frequência, pagamentos e cancelamentos? | Estruturar os espaços, mas publicar somente informações confirmadas pelo responsável | Pendente |
| DEC-10 | Se a agenda for manual, quem a atualiza, com que frequência e por qual processo? | Não usar `manual-schedule` sem responsável e rotina definidos; manter `whatsapp-only` | Pendente |

### 4.1 Regra de bloqueio

Uma decisão pendente **não bloqueia a frente inteira**: bloqueia somente as tarefas que precisam do dado real. As demais devem ser implementadas com a alternativa recomendada acima, deixando o ponto de configuração pronto para receber a resposta. As tarefas efetivamente bloqueadas estão listadas na §8.

### 4.2 Nota de consistência

Os registros de 2026-11-06 na §15 mencionam “DEC-01 a DEC-07” ou “DEC-01 a DEC-09” porque refletem o conjunto vigente em cada momento. Esses registros não devem ser alterados; o conjunto vigente é o desta tabela.

## 5. Princípios de implementação

1. **Manter a solução estática:** não adicionar backend sem uma necessidade aprovada.
2. **Não simular disponibilidade:** horário demonstrativo não deve parecer vaga real.
3. **Acessibilidade faz parte da entrega:** não será tratada apenas como ajuste posterior.
4. **Melhoria incremental:** cada fase deve deixar o site executável.
5. **Configuração centralizada:** telefone, textos operacionais e agenda não devem ficar espalhados.
6. **Sem dependência de CDN para compilar layout:** o CSS final deve existir como arquivo estático.
7. **Preservar mudanças de outras conversas:** não usar comandos destrutivos nem reverter arquivos alheios.
8. **Evidência antes de conclusão:** uma tarefa só será concluída após validação registrada.

## 6. Estratégia técnica proposta

### 6.1 Arquitetura

A página continuará sendo HTML, CSS e JavaScript sem framework de aplicação. Será adicionado um conjunto mínimo de ferramentas apenas para desenvolvimento, build e testes.

Estrutura-alvo inicial:

```text
landing_page_guilherme/
├── assets/
│   ├── images/
│   └── icons/
├── .github/
│   └── workflows/
├── tests/
│   ├── baseline/
│   ├── unit/
│   ├── e2e/
│   └── visual/
├── .gitignore
├── index.html
├── script.js
├── site-config.js
├── styles.source.css
├── styles.css
├── package.json
├── tailwind.config.js
├── README.md
├── PLANO_IMPLEMENTACAO_COLABORATIVO.md
└── RELATORIO_*.md
```

A estrutura poderá ser ajustada pela frente de fundação, mas qualquer alteração deverá ser registrada na seção de contribuições.

### 6.2 Configuração operacional

Será criado um ponto único para dados operacionais, por exemplo `site-config.js`, contendo:

- número do WhatsApp;
- mensagem inicial;
- modalidade disponível;
- modo da agenda;
- datas e horários somente quando forem dados reais;
- links externos confirmados.

O telefone continuará visível no frontend por natureza; o objetivo não é ocultá-lo, e sim impedir duplicações e placeholders esquecidos.

### 6.3 Agenda

O código suportará dois modos claros:

1. `whatsapp-only`: mostra somente consulta de disponibilidade;
2. `manual-schedule`: exibe datas reais em formato ISO, remove datas vencidas e gera mensagens completas.

Enquanto DEC-02 e DEC-10 estiverem pendentes, o modo ativo será `whatsapp-only`. Os dados demonstrativos atuais (10 a 13/11/2026) estão integralmente vencidos a partir de 2026-11-14 e não devem voltar a ser exibidos.

Uma integração externa de agenda será tratada como fase adicional e só será implementada após aprovação do serviço e das credenciais necessárias.

### 6.4 Diretriz de qualidade visual

As correções devem elevar o acabamento sem transformar a página em uma interface excessivamente animada ou promocional. A revisão final deverá observar:

- uma ação primária clara por seção, com ações secundárias visualmente subordinadas;
- largura de leitura confortável e contraste suficiente, inclusive em textos auxiliares;
- espaçamento vertical proporcional ao conteúdo em vez de alturas mínimas fixas sem função;
- preservação da proporção natural de logotipos e fotografias;
- decoração contida dentro do componente, sem provocar largura mínima, corte de conteúdo ou falsa affordance;
- animações curtas e não bloqueantes, com alternativa sem movimento;
- consistência entre o que um elemento aparenta fazer e a ação realmente disponível;
- comparação visual com o baseline atual para impedir regressão da paleta, tipografia, fotografia e composição das seções já bem resolvidas.

## 7. Fases de implementação

## Fase 0 — Coordenação, baseline e decisões

**Objetivo:** garantir que todas as conversas partam do mesmo estado e não sobreponham mudanças.

### Tarefas

- [x] IMP-000 — Confirmar commit-base e registrar `git status`.
- [x] IMP-001 — Preservar os dois relatórios existentes.
- [x] IMP-002 — Registrar responsáveis pelas frentes no quadro de trabalho.
- [ ] IMP-003 — Obter respostas de DEC-01 a DEC-10.
- IMP-004 — *Consolidada em DEC-02 (IMP-003).* A estratégia de agenda é a própria resposta de DEC-02; enquanto pendente, vale o modo provisório `whatsapp-only` (§6.3).
- [x] IMP-005 — Definir quais tarefas podem ocorrer em paralelo (§8.1).
- [x] IMP-006 — Versionar este plano e os dois relatórios em commit dedicado na `main`, antes de qualquer frente iniciar alterações.
- [x] IMP-007 — Registrar o baseline mensurável do commit-base em `tests/baseline/`: Lighthouse mobile e desktop, axe, peso total transferido, lista de requisições e capturas de tela das seções em 320, 390, 768, 1280 e 1440 px.

### Critérios de aceite

- nenhuma mudança preexistente foi removida;
- cada frente possui responsável ou permanece como “não atribuída”;
- os bloqueios de produto estão visíveis;
- os arquivos de atuação exclusiva estão declarados;
- o plano está versionado no Git e visível em qualquer clone;
- existe baseline numérico e visual para comparar as fases seguintes.

## Fase 1 — Fundação de desenvolvimento e build

**Objetivo:** substituir o Tailwind CDN por um build reprodutível e organizar a base sem alterar o comportamento funcional.

### Tarefas

- [x] IMP-100 — Criar `package.json` com scripts de desenvolvimento, build, formatação e testes.
- [x] IMP-101 — Fixar versões das dependências de desenvolvimento. O CDN resolve hoje para Tailwind **3.4.17** (baseline IMP-007); usar essa versão para reproduzir o layout atual e tratar qualquer atualização de major como mudança separada.
- [x] IMP-102 — Criar `tailwind.config.js` apontando para HTML e JavaScript, inclusive para as classes hoje montadas em template strings de `script.js` (até IMP-307 movê-las para o HTML).
- [x] IMP-103 — Criar `styles.source.css` com diretivas Tailwind e estilos próprios.
- [x] IMP-104 — Mover os 14 blocos `<style>` do HTML para a fonte de CSS.
- [x] IMP-105 — Remover regras duplicadas, sobrescritas e usos desnecessários de `!important`.
- [x] IMP-106 — Gerar `styles.css` minificado para produção.
- [x] IMP-107 — Remover `https://cdn.tailwindcss.com` e a configuração inline do HTML.
- [x] IMP-108 — Adicionar `.gitignore`, formatador e regras básicas de qualidade.
- [x] IMP-109 — Documentar os comandos no README.

### Arquivos de atuação exclusiva

- `package.json` e lockfile;
- `tailwind.config.js`;
- `styles.source.css`;
- geração de `styles.css`;
- configuração de formatação.

### Validações

- build executa do zero;
- página mantém o layout em 390 px e 1280 px, comparada às capturas do baseline (IMP-007);
- console não apresenta o aviso do Tailwind CDN;
- nenhum estilo depende de acesso ao CDN do Tailwind;
- `node --check script.js` continua aprovado.

## Fase 2 — Conversão e agenda

**Objetivo:** corrigir os bloqueadores QA-001, QA-002 e QA-003.

### Tarefas executáveis sem as decisões (alternativas provisórias da §4)

- [x] IMP-200 — Criar configuração central para WhatsApp e agenda.
- [x] IMP-202 — Bloquear build/publicação quando o número permanecer como placeholder e impedir que ambientes de desenvolvimento, homologação e testes automatizados enviem mensagens a um número real.
- [x] IMP-203 — Refatorar `createWhatsAppUrl` para receber data, horário e modalidade.
- [x] IMP-204 — Codificar a mensagem de forma segura com `encodeURIComponent`.
- [x] IMP-206 — Excluir automaticamente datas vencidas no modo manual.
- [x] IMP-207 — Criar estado vazio quando não houver horários.
- [x] IMP-208 — Informar claramente que a vaga depende de confirmação.
- IMP-209 — *Consolidada em IMP-600 a IMP-604*, que devem ser escritas e entregues durante esta fase pela frente FR-02.
- [x] IMP-210 — Garantir que o CTA principal não permaneça com `href="#"` quando JavaScript ou a configuração operacional falharem.
- [x] IMP-211 — Exibir estado indisponível seguro, sem gerar link externo inválido, quando telefone ou agenda não estiverem configurados.
- [x] IMP-212 — Ativar provisoriamente o modo `whatsapp-only`, retirando a grade demonstrativa de 10 a 13/11/2026 até DEC-02 e DEC-10 serem respondidas.

### Tarefas que dependem de decisão

- [ ] IMP-201 — Configurar o número profissional real e remover o número fictício de todos os links gerados (DEC-01).
- [ ] IMP-205 — Implementar o modo de agenda aprovado (DEC-02, DEC-03 e, se manual, DEC-10).

### Critérios de aceite

- nenhum link contém `5500000000000`;
- toda solicitação identifica dia, data, ano e horário;
- nenhuma data passada é exibida;
- o usuário entende que o contato não confirma automaticamente uma consulta;
- o comportamento sem horários está definido;
- falhas de configuração não direcionam o usuário para `#`, placeholder ou destinatário inválido;
- a página apresenta orientação compreensível quando o fluxo de contato não puder ser inicializado;
- testes cobrem número inválido, mensagem, data vencida e lista vazia;
- nenhuma data demonstrativa vencida permanece na página;
- nenhum teste ou ambiente de homologação gera contato real indevido.

## Fase 3 — Estrutura semântica e acessibilidade

**Objetivo:** corrigir QA-004 a QA-009 e tornar a navegação coerente para diferentes formas de interação.

### Divisão em entregas

Como todas as tarefas desta fase alteram arquivos de edição exclusiva, a fase é executada em três entregas sequenciais, cada uma com sua branch, validação e registro próprios:

| Entrega | Escopo | Tarefas |
| --- | --- | --- |
| FR-03A | Estrutura, conteúdo estático, navegação e menu | IMP-300 a IMP-313 |
| FR-03B | Abas, agenda acessível, carrosséis e movimento | IMP-320 a IMP-339 |
| FR-03C | Contraste, alvos de toque, foco, logotipo e responsividade | IMP-340 a IMP-350 |

### Tarefas de estrutura

- [x] IMP-307 — Mover para o HTML estático o conteúdo hoje injetado por `script.js` — abas da seção “Sobre”, passos do contato, card do Instagram e carrossel de fotografias —, deixando o JavaScript somente para comportamento (melhoria progressiva). Executar antes de IMP-300, IMP-320 e IMP-330.
- [x] IMP-308 — Garantir que, sem JavaScript, textos, primeira aba, primeiro slide de cada carrossel e caminho de contato permaneçam visíveis, e que nenhum controle sem função seja exibido.
- [x] IMP-300 — Colocar Agenda e Contato na ordem visual diretamente no HTML.
- [x] IMP-301 — Remover `order: 99` e outras reordenações que afetem leitura/foco.
- [x] IMP-302 — Adicionar link “Pular para o conteúdo”.
- [x] IMP-303 — Revisar hierarquia de títulos e landmarks.
- [x] IMP-304 — Garantir compensação do cabeçalho nas âncoras.
- [x] IMP-305 — Expor a seção ativa da navegação com `aria-current` sem depender apenas da classe visual `active`.
- [x] IMP-306 — Gerenciar foco, hash e cancelamento de temporizadores na navegação interna para evitar histórico duplicado ou rolagens concorrentes; a rolagem e o foco começam imediatamente, sem aguardar animação decorativa, e Voltar/Avançar do navegador levam à seção correta.

### Tarefas do menu mobile

- [x] IMP-310 — Adicionar `aria-controls` e `aria-expanded`.
- [x] IMP-311 — Alternar o rótulo entre “Abrir menu” e “Fechar menu”.
- [x] IMP-312 — Implementar fechamento por Escape.
- [x] IMP-313 — Validar foco ao abrir, navegar e fechar.

### Tarefas das abas

- [x] IMP-320 — Associar abas e painéis por ID e `aria-controls`.
- [x] IMP-321 — Implementar `tabindex` gerenciado.
- [x] IMP-322 — Implementar ArrowLeft, ArrowRight, Home e End.
- [x] IMP-323 — Garantir que conteúdo e foco mudem de forma previsível.

### Tarefas da agenda acessível

- [x] IMP-324 — Definir um padrão semântico para os seletores de dia, como botões pressionáveis, radio group ou abas completas.
- [x] IMP-325 — Expor programaticamente qual dia está selecionado por `aria-pressed`, `aria-checked` ou `aria-selected`, conforme o padrão escolhido.
- [x] IMP-326 — Associar os controles de dia ao painel de horários e anunciar atualizações relevantes sem duplicar conteúdo.
- [x] IMP-327 — Preservar foco e operação por teclado quando a agenda for renderizada novamente.

### Tarefas dos carrosséis

- [x] IMP-330 — Definir semântica acessível de carrossel.
- [x] IMP-331 — Expor somente o slide ativo à árvore de acessibilidade.
- [x] IMP-332 — Criar controles Anterior, Próximo e Pausar/Retomar.
- [x] IMP-333 — Pausar em hover, foco e interação do usuário.
- [x] IMP-334 — Respeitar `prefers-reduced-motion` nos carrosséis: sem troca automática e sem transição animada entre slides.
- [x] IMP-335 — Remover padrão ARIA parcial dos indicadores.

### Tarefas de movimento e transições

- [x] IMP-336 — Revisar a transição de tela cheia aplicada a toda âncora interna e remover o bloqueio visual de aproximadamente 620 ms.
- IMP-337 — *Consolidada em IMP-306* (rolagem e foco sem depender do término de animação decorativa).
- [x] IMP-338 — Reduzir a combinação simultânea de carrossel automático, elementos flutuantes e transição de página na primeira dobra.
- [x] IMP-339 — Definir durações e curvas consistentes para as demais animações — transição de página, elementos flutuantes, entradas, hover e barco animado pelo scroll — e desativar as não essenciais quando `prefers-reduced-motion` estiver ativo.

### Tarefas visuais de acessibilidade

- [x] IMP-340 — Ajustar tokens de cor para contraste mínimo AA.
- [x] IMP-341 — Ampliar áreas clicáveis para aproximadamente 44 × 44 px.
- [x] IMP-342 — Criar foco visível consistente.
- [x] IMP-343 — Corrigir a proporção do logotipo.
- [x] IMP-344 — Revisar textos alternativos e imagens decorativas.
- [x] IMP-345 — Corrigir o cabeçalho em 768 px para impedir encolhimento excessivo do logotipo e quebra do CTA “Vamos conversar”.
- [x] IMP-346 — Validar composição, legibilidade e colisões visuais em 320, 375, 768, 1024 e 1280 px, não apenas ausência de overflow.
- [x] IMP-347 — Corrigir a largura mínima criada pela grid e pelo card do Instagram no hero, garantindo que o card possa encolher dentro da área útil de 320 px.
- [x] IMP-348 — Aplicar limites de largura e `min-width: 0` onde necessário para impedir corte lateral de título, parágrafos e CTAs em telas estreitas ou com zoom.
- [x] IMP-349 — Revisar alturas mínimas e espaço vazio nos cards de atendimento, FAQ, agenda e transições entre seções, especialmente no mobile.
- [x] IMP-350 — Conter círculos, ilustrações e elementos flutuantes decorativos sem ocultar conteúdo nem ampliar a largura intrínseca dos componentes.

### Critérios de aceite

- ordem DOM, visual e de foco são equivalentes;
- conteúdo essencial permanece disponível com JavaScript desabilitado;
- página pode ser utilizada somente por teclado;
- abas funcionam por setas;
- menu anuncia estado aberto/fechado;
- agenda anuncia o dia selecionado e a relação com o painel de horários;
- carrosséis podem ser pausados e não anunciam slides inativos;
- redução de movimento desativa animações não essenciais;
- texto normal atinge contraste mínimo de 4,5:1;
- controles relevantes atingem contraste de 3:1;
- alvos de toque possuem tamanho ou espaçamento adequado;
- cabeçalho permanece legível em 768 px, sem marca comprimida, CTA quebrado ou colisão entre itens;
- em 320 px, nenhum título, parágrafo, botão, card ou decoração é cortado lateralmente;
- a largura do card do hero nunca ultrapassa a largura disponível de seu contêiner;
- espaços verticais e alturas de cards permanecem proporcionais ao conteúdo em desktop e mobile;
- a navegação interna não fica visualmente bloqueada por uma transição decorativa;
- navegação interna mantém foco e histórico previsíveis mesmo após cliques sucessivos;
- teste automatizado de acessibilidade não registra violação crítica ou séria não justificada.

## Fase 4 — Desempenho, imagens e acabamento visual

**Objetivo:** reduzir custo de carregamento e corrigir inconsistências visuais.

### Tarefas

- [ ] IMP-400 — Inventariar imagens realmente utilizadas.
- [ ] IMP-401 — Remover ou justificar assets não utilizados.
- [ ] IMP-402 — Gerar versões WebP/AVIF com fallback quando necessário.
- [ ] IMP-403 — Criar tamanhos responsivos e `srcset`/`sizes`.
- [ ] IMP-404 — Declarar dimensões para evitar deslocamento de layout.
- [ ] IMP-405 — Usar lazy loading fora da primeira dobra.
- [ ] IMP-406 — Priorizar somente a imagem principal necessária.
- [ ] IMP-407 — Evitar inserir os nove slides de forma custosa no primeiro carregamento, se possível.
- [ ] IMP-408 — Validar o enquadramento das fotografias em mobile e desktop.
- [ ] IMP-409 — Adicionar favicon e ícones necessários.
- [ ] IMP-410 — Revisar nitidez, enquadramento e compressão da mídia usada no hero para evitar aparência desfocada ou lavada em telas grandes.
- [ ] IMP-411 — Atualizar, a partir do baseline de IMP-007 e após a Fase 3, as capturas de referência de hero, atendimentos, sobre, conteúdos, FAQ, agenda e contato nos breakpoints críticos.
- [ ] IMP-412 — Comparar as capturas após a otimização para preservar paleta, hierarquia, fotografia, sombras e composição das seções já aprovadas visualmente.

### Critérios de aceite

- imagens fora da primeira dobra não são todas requisitadas imediatamente;
- não há deformação do logotipo;
- não há mudança perceptível de layout após o carregamento;
- não há asset quebrado ou favicon 404;
- Lighthouse mobile atinge meta acordada de desempenho, inicialmente 85 ou superior;
- a qualidade visual das fotografias e da mídia do hero permanece aceitável;
- as capturas de referência não apresentam regressão visual não aprovada.

## Fase 5 — Conteúdo, SEO, privacidade e confiança

**Objetivo:** alinhar a comunicação com as ações disponíveis e preparar indexação e compartilhamento.

### Tarefas

- [ ] IMP-500 — Resolver o destino dos cards “Em breve”.
- [ ] IMP-501 — Confirmar modalidades e remover afirmações não verificadas.
- [ ] IMP-502 — Adicionar link oficial do Instagram, se aprovado.
- [ ] IMP-503 — Revisar título e meta description finais.
- [ ] IMP-504 — Adicionar canonical após definição do domínio.
- [ ] IMP-505 — Adicionar Open Graph e metadados de compartilhamento.
- [ ] IMP-506 — Criar `robots.txt` e `sitemap.xml` após definição do domínio.
- [ ] IMP-507 — Avaliar dados estruturados apropriados sem promessas indevidas.
- [ ] IMP-508 — Adicionar informações de privacidade aprovadas.
- [ ] IMP-509 — Revisar autorização de uso das imagens.
- [ ] IMP-510 — Submeter conteúdo à revisão profissional/regulatória responsável.
- [ ] IMP-511 — Inventariar recursos de terceiros carregados no navegador, incluindo Google Fonts, e decidir quais devem ser removidos, compilados ou hospedados localmente, com fallback de fontes do sistema.
- [ ] IMP-512 — Definir com a hospedagem os cabeçalhos mínimos de segurança e privacidade, incluindo CSP, Referrer-Policy e Permissions-Policy compatíveis com o site.
- [ ] IMP-513 — Ampliar o FAQ com as dúvidas operacionais aprovadas em DEC-09, priorizando primeira sessão, modalidades, duração/frequência, atendimento infantil e políticas de cancelamento.
- [ ] IMP-514 — Reforçar o rodapé com informações confirmadas de contato, modalidades, localização, Instagram, privacidade e registro profissional, sem duplicação excessiva.
- [ ] IMP-515 — Revisar a hierarquia e o texto dos CTAs “Encontrar meu atendimento”, “Conhecer o trabalho” e “Vamos conversar” para manter uma ação primária inequívoca.
- [ ] IMP-516 — Tornar o mockup do Instagram coerente com DEC-08: fornecer destino real e acessível ou remover controles meramente cenográficos e sem ação.
- [ ] IMP-517 — Eliminar a manutenção manual do ano no rodapé (hoje fixo em “© 2026”), atualizando-o no build ou por script com valor estático correto como fallback.

### Critérios de aceite

- todo elemento com aparência de link possui destino coerente;
- não há modalidade, horário ou disponibilidade não confirmada;
- compartilhamento social apresenta título, texto e imagem corretos;
- sitemap e canonical usam o domínio oficial;
- nenhum script de compilação ou recurso de terceiro desnecessário é executado em tempo de uso;
- cabeçalhos de segurança e privacidade estão documentados e validados no ambiente de publicação;
- o FAQ responde às principais objeções de contato com informações aprovadas;
- o rodapé reforça confiança e oferece caminhos reais sem inventar dados operacionais;
- nenhum ícone ou controle cenográfico sugere uma ação inexistente;
- conteúdo de privacidade e divulgação foi aprovado pelo responsável.

## Fase 6 — Testes automatizados e regressão

**Objetivo:** transformar os cenários de QA em proteção permanente contra regressões.

### Responsabilidade pelos testes

Os testes de cada componente são escritos pela frente que o implementa, na mesma entrega. A FR-06 cria a infraestrutura (runner, configuração de navegadores, CI), consolida a suíte e cobre o que ficar sem dono. IMP-600 a IMP-604 pertencem à FR-02.

### Testes unitários

- [x] IMP-600 — Testar geração de URL do WhatsApp.
- [x] IMP-601 — Testar formatação da mensagem.
- [x] IMP-602 — Testar filtragem de datas vencidas.
- [x] IMP-603 — Testar agenda vazia.
- [x] IMP-604 — Testar configuração inválida.

### Testes end-to-end

- [x] IMP-610 — Carregamento sem erro JavaScript.
- [x] IMP-611 — Navegação desktop e mobile, incluindo Voltar/Avançar do navegador após uso das âncoras.
- [x] IMP-612 — Abertura e fechamento do menu por teclado.
- [ ] IMP-613 — FAQ.
- [x] IMP-614 — Navegação completa das abas.
- [x] IMP-615 — Agenda e mensagens geradas.
- [x] IMP-616 — Controles e pausa dos carrosséis.
- [x] IMP-617 — Ausência de overflow em 320, 375, 390, 768, 1024, 1280 e 1440 px e com zoom de 200%, verificando os limites de cada elemento visível e não apenas o `scrollWidth` do documento (o baseline mostra corte no hero em 320 px sem overflow do documento).
- [x] IMP-618 — Ordem de foco.
- [ ] IMP-619 — Links internos e assets sem 404.

### Auditorias automatizadas

- [ ] IMP-620 — Integrar axe ou ferramenta equivalente.
- [ ] IMP-621 — Executar Lighthouse em perfil mobile, registrando o método de throttling. Comparar versões com `--throttling-method=devtools` (mediana de 3 execuções): a simulação padrão pode atribuir ao LCP o download de imagens que não bloqueiam o elemento, como ocorreu na FR-01.
- [ ] IMP-622 — Verificar HTML, links e formatação.
- [ ] IMP-623 — Criar pipeline de CI para build e testes.

### Proteções complementares

- [x] IMP-624 — Automatizar a verificação do estado acessível da agenda após a troca de dia.
- [x] IMP-625 — Adicionar regressão visual do cabeçalho em 768 px e dos demais breakpoints de referência.
- [ ] IMP-626 — Testar o estado seguro do CTA e da agenda com configuração inválida ou JavaScript indisponível.
- [x] IMP-627 — Criar regressão visual específica do hero em 320, 390 e 1440 px.
- [x] IMP-628 — Verificar automaticamente que o card do hero não excede seu contêiner e que o logotipo preserva a proporção natural.
- [x] IMP-629 — Testar navegação interna e carrosséis com `prefers-reduced-motion: reduce`.
- [x] IMP-630 — Verificar que a transição visual não bloqueia foco, rolagem ou acionamento repetido de links internos.
- [ ] IMP-631 — Executar a suíte end-to-end em Chromium, Firefox e WebKit.
- [x] IMP-632 — Testar a página com JavaScript desabilitado: conteúdo essencial visível, caminho de contato seguro e nenhum controle sem função.
- [ ] IMP-633 — Comparar as métricas finais com o baseline de IMP-007 e registrar a evolução.

### Metas iniciais

| Métrica | Meta mínima inicial | Baseline (IMP-007) |
| --- | ---: | ---: |
| Lighthouse Acessibilidade | 95 | 90 |
| Lighthouse SEO | 90 | 100 |
| Lighthouse Boas Práticas | 90 | 96 |
| Lighthouse Desempenho mobile | 85 | 73 (mediana; 68–76) |
| Violações axe críticas/sérias | 0 não justificadas | 2 regras (1 crítica, 1 séria) |
| Erros JavaScript nos fluxos | 0 | 0 de aplicação; 1 erro de recurso (favicon 404) |
| Assets locais quebrados | 0 | 1 (`/favicon.ico`) |

Detalhes, método e capturas em `tests/baseline/README.md`. Além das metas mínimas, **nenhuma categoria pode ficar abaixo do baseline**: SEO e Boas Práticas já partem acima da meta e não podem regredir.

## Fase 7 — Documentação, homologação e publicação

**Objetivo:** garantir que outra pessoa consiga manter e publicar a página com segurança.

### Tarefas

- [ ] IMP-700 — Reescrever o README com objetivo, estrutura e comandos.
- [ ] IMP-701 — Documentar configuração do WhatsApp.
- [ ] IMP-702 — Documentar atualização ou integração da agenda.
- [ ] IMP-703 — Documentar otimização e substituição de imagens.
- [ ] IMP-704 — Documentar build e conteúdo de `dist`, se adotado.
- [ ] IMP-705 — Documentar hospedagem, domínio, HTTPS e rollback.
- [ ] IMP-706 — Criar checklist de homologação.
- [ ] IMP-707 — Executar regressão final em desktop e mobile, incluindo ao menos um dispositivo físico Android e um iOS.
- [ ] IMP-708 — Registrar limitações aceitas e pendências pós-publicação.
- [ ] IMP-709 — Publicar somente após aprovação explícita do responsável.

### Critérios de aceite

- um checkout limpo consegue instalar, construir e testar o projeto;
- o processo de publicação está documentado;
- existe estratégia de rollback;
- todos os bloqueadores e itens de severidade alta estão resolvidos ou formalmente aceitos;
- a homologação final está registrada na seção de contribuições.

## 8. Ordem e dependências

Ordem recomendada:

1. Fase 0 — versionar o plano (IMP-006), medir o baseline (IMP-007) e solicitar as decisões;
2. Fase 1 — fundação e build;
3. Fase 2 — conversão e agenda, começando pelas tarefas que não dependem de decisão;
4. Fase 3 — acessibilidade, em três entregas sequenciais (FR-03A, FR-03B, FR-03C);
5. Fases 4 e 5 — preparação em paralelo desde o início; integração no HTML após a Fase 3;
6. Fase 6 — testes começam junto das fases anteriores e fecham após todas;
7. Fase 7 — homologação e publicação.

### 8.1 Mapa de paralelismo

**Cadeia exclusiva** (alteram `index.html`, `script.js`, CSS ou `package.json`; uma frente por vez, nesta ordem):

FR-01 → FR-02 → FR-03A → FR-03B → FR-03C → integração de FR-04 → integração de FR-05 → FR-07.

**Pode ocorrer em paralelo a qualquer momento**, sem tocar arquivos exclusivos:

- obtenção das decisões DEC-01 a DEC-10 (IMP-003);
- medição do baseline (IMP-007), que é somente leitura sobre o site;
- FR-04: inventário e geração de cópias otimizadas em `assets/images/` (IMP-400 a IMP-403), sem referenciá-las no HTML;
- FR-05: rascunho de textos, metadados, FAQ, rodapé e privacidade em documento separado;
- FR-06: elaboração de testes em arquivos novos de `tests/` e da configuração de CI; as dependências de teste entram em `package.json` com reserva curta, depois que FR-01 o liberar;
- FR-07: rascunho da documentação de publicação fora do README.

### 8.2 Tarefas efetivamente bloqueadas por decisão

| Tarefa | Decisão |
| --- | --- |
| IMP-201 | DEC-01 |
| IMP-205 | DEC-02, DEC-03 e, se manual, DEC-10 |
| IMP-500 | DEC-05 |
| IMP-501 | DEC-03 |
| IMP-502 | DEC-06 |
| IMP-504, IMP-506 e validação final de IMP-512 | DEC-04 |
| IMP-508, IMP-510 | DEC-07 |
| IMP-513, IMP-514 | DEC-03, DEC-07 e DEC-09 |
| IMP-516 | DEC-06 e DEC-08 |

Todas as demais tarefas podem ser executadas com as alternativas provisórias da §4.

### Dependências importantes

- IMP-006 precede qualquer alteração de arquivo de implementação.
- IMP-007 precede IMP-107, para que a remoção do CDN seja comparada ao baseline.
- IMP-201 depende de DEC-01.
- IMP-210 e IMP-211 dependem de IMP-200 e da política provisória definida para DEC-01.
- IMP-212 depende somente de IMP-200.
- IMP-205 depende de DEC-02, DEC-03 e, se a agenda for manual, DEC-10.
- IMP-307 precede IMP-300, IMP-320 e IMP-330 e deve ser compatível com o estado seguro de IMP-210.
- IMP-504 e IMP-506 dependem de DEC-04.
- IMP-511 e IMP-512 dependem da estabilização da Fase 1; a validação final de cabeçalhos depende de DEC-04.
- IMP-500 depende de DEC-05.
- IMP-502 depende de DEC-06.
- IMP-508 e IMP-510 dependem de DEC-07.
- IMP-513 e IMP-514 dependem de DEC-03, DEC-07 e DEC-09 conforme o conteúdo incluído.
- IMP-516 depende de DEC-06 e DEC-08.
- IMP-347 e IMP-348 devem ser concluídas antes de IMP-411, IMP-412, IMP-627 e IMP-628.
- IMP-411 depende de IMP-007 e da conclusão de FR-03C.
- IMP-633 depende de IMP-007.
- Fase 3 deve ocorrer após a alteração de estrutura da Fase 2 para evitar retrabalho em `script.js`.
- Testes end-to-end devem acompanhar cada componente, não ser deixados somente para o final.
- `README.md` é editado por FR-01 (IMP-109) e reescrito por FR-07 (IMP-700); FR-07 preserva as instruções já documentadas.

## 9. Quadro de frentes colaborativas

| Frente | Escopo | Dependência | Arquivos principais | Responsável | Estado |
| --- | --- | --- | --- | --- | --- |
| FR-00 | Coordenação e decisões | Nenhuma | Este plano | Conversa principal | Em andamento |
| FR-01 | Build e organização de CSS | IMP-006, IMP-007 | `package.json`, Tailwind, CSS, `.gitignore` | Conversa de análise e revisão do plano | Concluída |
| FR-02 | WhatsApp e agenda | FR-01; IMP-201 e IMP-205 aguardam decisões | `site-config.js`, `contact.js`, `script.js` | Conversa de análise e revisão do plano | Bloqueada — restam IMP-201 (DEC-01) e IMP-205 (DEC-02, DEC-03, DEC-10) |
| FR-03A | Estrutura, conteúdo estático, navegação e menu | FR-02 | `index.html`, `script.js`, CSS | Conversa de análise e revisão do plano | Concluída |
| FR-03B | Abas, agenda acessível, carrosséis e movimento | FR-03A | `index.html`, `script.js`, CSS | Conversa de análise e revisão do plano | Concluída |
| FR-03C | Contraste, toque, foco, logotipo e responsividade | FR-03B | `index.html`, CSS | Conversa de análise e revisão do plano | Concluída |
| FR-04 | Imagens e desempenho | Preparação: nenhuma; integração: FR-03C | `assets/`, HTML | Não atribuído | Não iniciada |
| FR-05 | Conteúdo e SEO | Rascunho: nenhuma; integração: FR-03C e DEC-03 a DEC-09 | HTML, arquivos SEO | Não atribuído | Não iniciada — parcialmente bloqueada |
| FR-06 | Testes e CI | FR-01 para dependências; componentes | `tests/`, CI | Conversa de análise e revisão do plano | Em andamento — infraestrutura end-to-end antecipada na FR-03A |
| FR-07 | Documentação e release | Todas | README e deploy | Não atribuído | Não iniciada |

## 10. Regras para outras conversas

Toda conversa que trabalhar neste projeto deverá seguir estas regras.

### Antes de alterar qualquer arquivo

1. Ler este documento por completo.
2. Executar `git status --short --branch`.
3. Ler as últimas contribuições registradas no final do documento.
4. Escolher uma frente ainda não atribuída ou receber uma atribuição explícita.
5. Registrar na própria contribuição quais arquivos pretende alterar.
6. Verificar se outra conversa declarou atuação exclusiva nesses arquivos.

### Durante o trabalho

1. Trabalhar na branch da própria frente (§11.1); não trocar a branch de um diretório de trabalho usado por outra conversa.
2. Não executar reset, checkout destrutivo ou limpeza de arquivos alheios.
3. Não reformatar arquivos fora do escopo da frente.
4. Não modificar os relatórios de auditoria para esconder achados.
5. Não marcar tarefa como concluída sem executar a validação correspondente.
6. Se encontrar conflito de escopo, registrar o bloqueio em vez de escolher sozinho qual mudança prevalece.

### Ao finalizar uma contribuição

1. Atualizar somente as caixas das tarefas executadas pela conversa.
2. Atualizar somente a linha da frente que lhe foi atribuída.
3. Acrescentar um registro na seção “Contribuições das conversas”.
4. Informar arquivos alterados, testes executados, resultado e pendências.
5. Não remover nem reescrever registros anteriores.

## 11. Estratégia para evitar conflitos de arquivo

### 11.1 Branches, worktrees e integração

- Cada frente trabalha em uma branch própria criada a partir da `main` atualizada, no formato `fr-XX/descricao-curta` (exemplo: `fr-01/build-tailwind`).
- Quando duas conversas usarem a mesma máquina, cada uma usa seu próprio diretório via `git worktree`, nunca trocando a branch do diretório da outra.
- A entrega é integrada à `main` por pull request ou merge revisado pela FR-00, após as validações da fase.
- As atualizações deste plano (caixas, linha da frente no quadro e registro na §15) vão no mesmo PR da entrega.
- Em conflito na §15, manter as duas entradas em ordem cronológica; em conflito nas demais seções, prevalece a versão da `main` e a frente reaplica somente a sua alteração.
- Antes de abrir o PR, a frente atualiza sua branch com a `main` e repete as validações.

### 11.2 Arquivos com edição exclusiva temporária

Os arquivos abaixo não devem ser editados simultaneamente por duas frentes:

- `index.html`;
- `script.js`;
- `styles.css`;
- `styles.source.css`;
- `package.json` e lockfile;
- `site-config.js`;
- `README.md`.

Quem iniciar uma alteração nesses arquivos deve declarar a reserva em sua contribuição e liberar a reserva ao final.

### 11.3 Trabalhos que podem ocorrer em paralelo

O mapa completo está na §8.1. Em resumo:

- otimização de cópias de imagens em uma pasta separada, sem substituir arquivos ainda;
- elaboração de testes em arquivos novos;
- pesquisa e proposta de SEO sem alterar o HTML;
- revisão de conteúdo em um documento separado;
- documentação de cenários e critérios de aceite;
- validação manual read-only.

### 11.4 Regra para CSS gerado

Após a Fase 1, `styles.css` será tratado como artefato gerado. As edições manuais deverão ocorrer em `styles.source.css`; somente a frente responsável pelo build deverá regenerar o arquivo final.

## 12. Definição de pronto por tarefa

Uma tarefa só pode receber estado “Concluída” quando:

- o código ou documento previsto existe;
- os critérios de aceite foram verificados;
- testes relacionados foram executados;
- não houve regressão conhecida nos fluxos principais;
- `git diff --check` não apresenta erro;
- arquivos alheios não foram sobrescritos;
- a contribuição foi registrada no final deste documento;
- pendências e limitações foram explicitadas.

Estados permitidos:

- Não iniciada;
- Em andamento;
- Bloqueada;
- Pronta para QA;
- Concluída;
- Aceita com limitação.

Itens marcados como *Consolidada* não possuem caixa própria: são concluídos junto com a tarefa indicada e não entram na contagem de progresso.

## 13. Checklist de liberação

### Conversão

- [ ] Número real validado.
- [ ] Mensagem principal revisada.
- [ ] Mensagem de agenda contém data e horário.
- [ ] Disponibilidade não é simulada.
- [ ] Estado sem horário funciona.
- [ ] Nenhuma data demonstrativa ou vencida é exibida.
- [ ] Testes e homologação não geram contato real indevido.

### Usabilidade e acessibilidade

- [ ] Ordem visual e DOM equivalentes.
- [ ] Conteúdo essencial disponível sem JavaScript.
- [ ] Menu mobile acessível.
- [ ] Abas acessíveis por teclado.
- [ ] Agenda expõe o dia selecionado e a atualização do painel.
- [ ] Carrosséis possuem pausa e redução de movimento.
- [ ] Somente slides ativos são anunciados.
- [ ] Contraste AA validado.
- [ ] Alvos de toque adequados.
- [ ] Foco visível e ordem de foco aprovados.
- [ ] Cabeçalho aprovado em 320, 375, 390, 768, 1024, 1280 e 1440 px, sem compressão ou quebra indevida.
- [ ] Hero, textos e CTAs não são cortados em 320 px ou com zoom aumentado.
- [ ] Card do hero respeita a largura disponível em todos os breakpoints.
- [ ] Transições e carrosséis não bloqueiam a navegação e respeitam redução de movimento.
- [ ] Ritmo vertical aprovado, sem espaços vazios ou alturas mínimas desproporcionais.

### Desempenho e qualidade

- [ ] Tailwind CDN removido.
- [ ] Imagens otimizadas e responsivas.
- [ ] Lazy loading aplicado.
- [ ] Logotipo sem deformação.
- [ ] Favicon sem 404.
- [ ] CTA e agenda apresentam estado seguro quando a configuração ou o JavaScript falham.
- [ ] Recursos de terceiros foram inventariados e reduzidos ao necessário.
- [ ] Cabeçalhos de segurança e privacidade foram validados na hospedagem.
- [ ] Build reprodutível.
- [ ] Testes e CI aprovados.
- [ ] Suíte end-to-end aprovada em Chromium, Firefox e WebKit.
- [ ] Métricas finais comparadas ao baseline.

### Conteúdo e publicação

- [ ] Domínio e canonical definidos.
- [ ] SEO e compartilhamento revisados.
- [ ] Privacidade e conteúdo profissional aprovados.
- [ ] FAQ cobre as principais dúvidas operacionais com conteúdo confirmado.
- [ ] Rodapé oferece informações e destinos reais suficientes para reforçar confiança.
- [ ] Mockup do Instagram não apresenta controles sem ação ou destino incoerente.
- [ ] Ano do rodapé correto sem manutenção manual.
- [ ] Plano, relatórios e registros de homologação versionados.
- [ ] README completo.
- [ ] Homologação registrada.
- [ ] Rollback documentado.

## 14. Modelo de atribuição de uma frente

Copiar este bloco para a seção de contribuições antes de iniciar:

```md
### [AAAA-MM-DD HH:mm] Reserva de frente — FR-XX — Nome da conversa

- Responsável/conversa: identificador ou título da conversa
- Frente: FR-XX
- Tarefas: IMP-XXX, IMP-XXX
- Arquivos reservados: arquivo-a, arquivo-b
- Estado inicial: Em andamento
- Dependências: nenhuma ou IDs
- Observação: resumo curto
```

Ao finalizar, acrescentar outro registro usando o modelo da próxima seção. Não apagar o registro de reserva.

## 15. Contribuições das conversas — append-only

Esta seção é compartilhada. Cada conversa deve **acrescentar** sua entrada ao final, sem alterar entradas anteriores.

Antes de acrescentar:

1. reler as últimas entradas;
2. confirmar que o arquivo não mudou desde o início do trabalho;
3. usar um título único com data, hora, frente e nome da conversa;
4. aplicar a edição ancorada no marcador final;
5. se a edição falhar por mudança concorrente, reler e tentar novamente sem sobrescrever.

### Modelo de contribuição concluída

```md
### [AAAA-MM-DD HH:mm] Contribuição — FR-XX — Nome da conversa

- Responsável/conversa:
- Objetivo:
- Tarefas relacionadas:
- Arquivos alterados:
- Alterações realizadas:
- Validações executadas:
- Resultado das validações:
- Pendências ou riscos:
- Arquivos ainda reservados:
- Próxima ação recomendada:
- Estado final: Pronta para QA | Concluída | Bloqueada | Aceita com limitação
```

### [2026-11-06] Contribuição inicial — FR-00 — Conversa principal

- Responsável/conversa: conversa de auditoria e planejamento do projeto
- Objetivo: consolidar as auditorias em um plano executável e colaborativo
- Tarefas relacionadas: IMP-000, IMP-001, IMP-002
- Arquivos alterados: `PLANO_IMPLEMENTACAO_COLABORATIVO.md`
- Alterações realizadas: criação das fases, tarefas, dependências, critérios de aceite, quadro de frentes e protocolo para colaboração entre conversas
- Validações executadas: conferência dos achados dos dois relatórios e do estado atual do Git
- Resultado das validações: plano cobre QA-001 a QA-014 e os requisitos de preparação para produção
- Pendências ou riscos: DEC-01 a DEC-07 aguardam definição; nenhuma correção do site foi iniciada
- Arquivos ainda reservados: nenhum arquivo de implementação
- Próxima ação recomendada: confirmar decisões de produto e atribuir FR-01 e FR-02
- Estado final: Concluída

### [2026-11-06 19:51 -03] Contribuição — FR-00 — Auditoria complementar de frontend

- Responsável/conversa: conversa de auditoria de frontend e planejamento de implementação
- Objetivo: transformar os achados adicionais da validação renderizada em tarefas, critérios de aceite e proteções de regressão
- Tarefas relacionadas: IMP-210, IMP-211, IMP-305, IMP-306, IMP-324 a IMP-327, IMP-345, IMP-346, IMP-511, IMP-512 e IMP-624 a IMP-626
- Arquivos alterados: `PLANO_IMPLEMENTACAO_COLABORATIVO.md`
- Alterações realizadas: inclusão de degradação segura do contato, semântica da seleção da agenda, navegação interna e foco, correção responsiva do cabeçalho em 768 px, inventário de terceiros, cabeçalhos de segurança e testes complementares
- Validações executadas: revisão integral do plano; comparação com `index.html`, `styles.css` e `script.js`; QA renderizado em 320, 375, 768, 1024 e 1280 px; testes de menu, abas, agenda, ordem visual/DOM e console
- Resultado das validações: o plano passa a cobrir os achados complementares sem duplicar QA-001 a QA-014 e sem iniciar alterações nos arquivos da landing page
- Pendências ou riscos: DEC-01 a DEC-07 continuam pendentes; cabeçalhos de produção dependem da hospedagem; comportamento sem JavaScript precisa ser definido durante FR-01 e FR-02
- Arquivos ainda reservados: nenhum arquivo de implementação
- Próxima ação recomendada: confirmar DEC-01 a DEC-03, atribuir FR-01 e incorporar IMP-210/IMP-211 ao desenho da configuração central
- Estado final: Concluída

### [2026-11-06 22:09 -03] Contribuição — FR-00 — Auditoria especializada de telas

- Responsável/conversa: conversa de análise visual e nível profissional das telas
- Objetivo: incorporar ao plano todos os achados da inspeção visual, responsiva e de percepção profissional
- Tarefas relacionadas: IMP-336 a IMP-339, IMP-347 a IMP-350, IMP-410 a IMP-412, IMP-513 a IMP-516 e IMP-627 a IMP-630
- Arquivos alterados: `PLANO_IMPLEMENTACAO_COLABORATIVO.md`
- Alterações realizadas: registro do baseline visual a preservar; correção planejada do corte em 320 px; revisão de movimento, ritmo vertical e elementos decorativos; critérios para mídia do hero, FAQ, rodapé, CTAs e mockup do Instagram; ampliação das regressões visuais
- Validações executadas: revisão integral do plano; comparação com a auditoria renderizada em 1440 × 900, 390 × 844 e 320 × 720 px; conferência dos achados já cobertos para evitar duplicação
- Resultado das validações: todos os pontos da análise de nível profissional foram associados a decisão, tarefa, critério de aceite, dependência ou checklist de liberação
- Pendências ou riscos: DEC-01 a DEC-09 permanecem pendentes; FAQ, rodapé e Instagram dependem de informações e destinos confirmados; nenhuma alteração foi realizada na landing page
- Arquivos ainda reservados: nenhum arquivo de implementação
- Próxima ação recomendada: confirmar DEC-01 a DEC-03, DEC-08 e DEC-09; depois atribuir FR-01, FR-02 e FR-03
- Estado final: Concluída

### [2026-11-12 21:47 -03] Contribuição — FR-00 — Revisão de consistência do plano

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Objetivo: corrigir problemas de coordenação e lacunas identificados na análise do plano frente ao código do commit-base
- Tarefas relacionadas: IMP-004, IMP-005 (concluída), IMP-006, IMP-007, IMP-102, IMP-202, IMP-209, IMP-212, IMP-306, IMP-307, IMP-308, IMP-334, IMP-337, IMP-339, IMP-411, IMP-511, IMP-517, IMP-611, IMP-617, IMP-631 a IMP-633, IMP-707
- Arquivos alterados: `PLANO_IMPLEMENTACAO_COLABORATIVO.md`
- Alterações realizadas:
  - criadas IMP-006 (versionar plano e relatórios) e IMP-007 (baseline de Lighthouse, axe, peso e capturas), pois o plano não estava no Git e as metas não tinham medição inicial;
  - criada DEC-10 (responsável pela agenda manual) e a regra de bloqueio da §4.1: decisões pendentes bloqueiam somente as tarefas listadas na §8.2;
  - Fase 2 separada entre tarefas independentes e dependentes de decisão; criada IMP-212 para ativar `whatsapp-only`, pois a agenda demonstrativa (10 a 13/11/2026) estará integralmente vencida a partir de 2026-11-14;
  - criadas IMP-307 e IMP-308: o conteúdo das abas, passos do contato, card do Instagram e carrossel de fotos é hoje injetado por `script.js` e desaparece sem JavaScript;
  - Fase 3 dividida nas entregas sequenciais FR-03A, FR-03B e FR-03C;
  - criada a §11.1 com estratégia de branches, worktrees e integração por PR; `README.md` incluído entre os arquivos exclusivos;
  - consolidadas tarefas duplicadas sem renumerar: IMP-004 em DEC-02, IMP-209 em IMP-600 a IMP-604, IMP-337 em IMP-306; escopos de IMP-334 e IMP-339 separados (carrosséis × demais animações, incluindo o barco do scroll);
  - acrescentadas lacunas dos relatórios: ano fixo do rodapé (IMP-517), Google Fonts (IMP-511), Voltar/Avançar (IMP-611), zoom de 200% (IMP-617), testes cross-browser (IMP-631), teste sem JavaScript (IMP-632), comparação com baseline (IMP-633) e dispositivos físicos (IMP-707);
  - criado o mapa de paralelismo (§8.1), concluindo IMP-005; quadro de frentes, critérios de aceite e checklist de liberação atualizados;
  - registrado na §4.2 que menções anteriores a “DEC-01 a DEC-07” refletem o conjunto da época, sem alterar registros anteriores
- Validações executadas: conferência do plano contra `index.html`, `script.js`, `styles.css` e os dois relatórios; verificação de que nenhuma entrada anterior da §15 foi alterada; `git diff --check` no arquivo
- Resultado das validações: todos os problemas e lacunas da análise foram associados a tarefa, regra, dependência ou item de checklist; nenhuma alteração foi feita nos arquivos da landing page
- Pendências ou riscos: DEC-01 a DEC-10 continuam pendentes. IMP-006 foi concluída com autorização do responsável, no commit que versiona este plano e os dois relatórios
- Arquivos ainda reservados: nenhum
- Próxima ação recomendada: executar IMP-007; em seguida atribuir FR-01 e, na sequência, as tarefas independentes de decisão da FR-02
- Estado final: Concluída

### [2026-11-12 21:58 -03] Contribuição — FR-00 — Baseline do commit-base

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Objetivo: registrar a medição de referência antes de qualquer alteração de implementação
- Tarefas relacionadas: IMP-007 (concluída); ajustes de texto em IMP-101 e IMP-617; tabela de metas da Fase 6
- Branch: `fr-00/baseline`, em worktree separado, conforme §11.1
- Arquivos alterados: `PLANO_IMPLEMENTACAO_COLABORATIVO.md`; criados `tests/baseline/README.md`, `tests/baseline/scripts/capture.mjs`, relatórios JSON de Lighthouse, axe, requisições e resumo, e 50 capturas PNG em `tests/baseline/screenshots/`
- Alterações realizadas: Lighthouse mobile e desktop (3 execuções cada, mediana guardada); axe-core em 390 e 1280 px; inventário de requisições; capturas da página inteira e de 9 regiões em 320, 390, 768, 1280 e 1440 px; coluna de baseline na tabela de metas e regra de não regressão
- Validações executadas: conferência visual de capturas do hero em 320 px e do cabeçalho em 768 px; confirmação dos alvos das violações axe; comparação dos resultados com QA-004, QA-007, QA-010, QA-012 e QA-013
- Resultado das validações: Lighthouse mobile 73/90/96/100 (desempenho/acessibilidade/boas práticas/SEO), desktop 95/90/96/100; LCP mobile 7,2 s; 2,47 MB e 22 requisições, sendo 2,20 MB de 13 imagens; axe com `aria-required-children` crítico (`.instagram-dots`) e `color-contrast` sério (8 nós no mobile, 13 no desktop); capturas confirmam o corte do hero em 320 px e a quebra do CTA do cabeçalho em 768 px; CDN do Tailwind resolve para 3.4.17
- Pendências ou riscos: o servidor de medição não usa compressão nem cache, então essas auditorias devem ser refeitas na hospedagem (DEC-04); o desempenho varia com a rede porque Tailwind e fontes vêm da internet; as ferramentas de medição ficaram fora do `package.json` até a FR-01 existir
- Arquivos ainda reservados: nenhum
- Próxima ação recomendada: integrar `fr-00/baseline` à `main`; em seguida atribuir e iniciar a FR-01, usando Tailwind 3.4.17 e comparando com estas capturas
- Estado final: Concluída

### [2026-11-12 22:05 -03] Reserva de frente — FR-01 — Build e organização de CSS

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Frente: FR-01
- Tarefas: IMP-100 a IMP-109
- Branch: `fr-01/build-tailwind`, em worktree separado (§11.1)
- Arquivos reservados: `package.json`, `package-lock.json`, `tailwind.config.js`, `postcss.config.js`, `postcss.build.config.js`, `styles.source.css`, `styles.css`, `index.html` (somente `<head>`, remoção dos blocos `<style>` e ajustes de classes necessários para eliminar `!important`), `.gitignore`, configuração do Prettier, `README.md`
- Estado inicial: Em andamento
- Dependências: IMP-006 e IMP-007 concluídas
- Observação: migração validada por comparação automática do estilo computado de todos os elementos e pseudo-elementos contra o site original com CDN, em 320, 390, 768, 1280 e 1440 px, incluindo hover e menu mobile aberto

### [2026-11-12 23:03 -03] Contribuição — FR-01 — Build e organização de CSS

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Objetivo: substituir o Tailwind via CDN por build local reprodutível e consolidar o CSS sem alterar a aparência
- Tarefas relacionadas: IMP-100 a IMP-109 (concluídas); ajuste de texto em IMP-621
- Branch: `fr-01/build-tailwind`, em worktree separado (§11.1)
- Arquivos alterados: `index.html`, `styles.css` (agora gerado), `README.md`, `PLANO_IMPLEMENTACAO_COLABORATIVO.md`; criados `package.json`, `package-lock.json`, `tailwind.config.js`, `postcss.config.js`, `postcss.build.config.js`, `styles.source.css`, `.gitignore`, `.editorconfig`, `.prettierrc.json`, `.prettierignore`, `scripts/serve.mjs`, `scripts/dev.mjs`, `scripts/check-css.mjs`, `tests/tools/compare-computed-styles.mjs`
- Alterações realizadas:
  - Tailwind fixado em 3.4.17 (a versão que o CDN servia), com autoprefixer e `browserslist` explícito (`defaults`, Safari e iOS 15 ou superior);
  - o CDN injetava o Tailwind no fim do `<head>`; a ordem foi preservada como base → componentes → estilos próprios → utilitários;
  - os 14 blocos `<style>` e o `styles.css` original foram consolidados em `styles.source.css`, organizado por componente: de 45 para 0 `!important`, sem regras sobrescritas, duplicadas ou mortas (cinco versões dos gradientes das seções, pseudo-elementos ocultos do `#contato`, `.agenda-section`, `.brand-mark`, variáveis sem uso, `.font-display` duplicada);
  - no HTML, três ajustes substituem o que o `!important` forçava: `bg-sand/[.94]` e `border-ink/[.08]` no cabeçalho, `mt-10` nos cards e `hidden` na linha de ícones oculta dos cards;
  - minificação via cssnano com `colormin`, `minifyGradients`, `normalizePositions` e `convertValues` desligados: a minificação padrão da CLI arredondava cores (`rgba(245,183,156,.2)` virava `rgba(245,184,158,.2)`);
  - `styles.css` passou de 36,6 KB (passo fiel) para 30,5 KB e substitui os 127 KB de JavaScript do CDN;
  - scripts `dev` (com `--watch=always`, pois o watch padrão encerra sem terminal interativo), `build`, `serve`, `format`, `format:check`, `check:js`, `check:css` e `test`; `check:css` falha se `styles.css` estiver desatualizado ou se voltarem CDN, `<style>` ou `!important`;
  - Prettier aplicado a `index.html`, CSS, configurações e scripts; `script.js` ficou em `.prettierignore` para não sair do escopo, devendo ser formatado pela FR-02
- Validações executadas:
  - comparação automática do estilo computado de todos os elementos e pseudo-elementos renderizados contra o site original com CDN, em 320, 390, 768, 1280 e 1440 px, no estado padrão, em hover de 12 componentes e com o menu mobile aberto, após cada passo (`tests/tools/compare-computed-styles.mjs`);
  - texto renderizado comparado em 390 e 1280 px;
  - capturas comparadas pixel a pixel com o baseline de IMP-007;
  - `npm ci`, `npm run build` e `npm test` em clone limpo da branch;
  - servidor local testado (200, 404 e bloqueio de travessia de diretório); modo `dev` testado sem terminal interativo;
  - Lighthouse mobile com simulação padrão e com throttling real (`devtools`), 3 execuções cada
- Resultado das validações:
  - estilo computado: nenhuma diferença. Duas normalizações documentadas no script: `-webkit-text-decoration-color` na lista de transição (prefixo dispensável nos navegadores-alvo) e estilo/cor de bordas de largura zero (não renderizadas);
  - texto renderizado idêntico; páginas inteiras e capturas mobile idênticas pixel a pixel. Nas capturas de seção a partir de 768 px, as diferenças (no máximo 0,18% dos pixels) ficam na faixa da onda lateral, cuja posição do barco depende do scroll, e no link ativo do menu fixo, capturado no meio da transição de cor no baseline;
  - console sem o aviso do Tailwind CDN; nenhum recurso de `cdn.tailwindcss.com`; `node --check script.js` aprovado; clone limpo aprovado;
  - Lighthouse mobile com throttling real (mediana): desempenho 75 → 89, FCP 3,07 s → 1,65 s, LCP 5,14 s → 3,74 s, Speed Index 3,31 s → 1,89 s;
  - com a simulação padrão, desempenho 73 → 74, FCP 2,4 s → 1,7 s, mas LCP 7,2 s → 10,8 s. O elemento LCP é o mesmo `<h1>`; como o CSS agora chega antes, o navegador prioriza a imagem do Instagram, e a simulação passa a atribuir ao `<h1>` o download das imagens. A medição com throttling real mostra que não há regressão; o ponto foi registrado em IMP-621
- Pendências ou riscos: formatação de `script.js` fica para a FR-02; as ferramentas de comparação usam `playwright-core` e Chrome instalados fora do projeto até a FR-06 definir a infraestrutura de testes; o peso das imagens (2,2 MB) continua sendo o principal custo de carregamento (FR-04)
- Arquivos ainda reservados: nenhum; reserva da FR-01 liberada
- Próxima ação recomendada: integrar `fr-01/build-tailwind` à `main`; iniciar a FR-02 pelas tarefas independentes de decisão (IMP-200, IMP-202 a IMP-204, IMP-206 a IMP-208, IMP-210 a IMP-212)
- Estado final: Concluída

### [2026-11-12 23:08 -03] Reserva de frente — FR-02 — WhatsApp e agenda

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Frente: FR-02
- Tarefas: IMP-200, IMP-202 a IMP-204, IMP-206 a IMP-208, IMP-210 a IMP-212 e IMP-600 a IMP-604 (IMP-201 e IMP-205 aguardam decisões)
- Branch: `fr-02/whatsapp-agenda`, em worktree separado (§11.1)
- Arquivos reservados: `site-config.js`, `contact.js`, `script.js`, `index.html` (seções Contato e Agenda e carregamento de scripts), `styles.source.css`, `styles.css`, `package.json`, `tailwind.config.js`, `README.md`, `tests/unit/`
- Estado inicial: Em andamento
- Dependências: FR-01 concluída
- Observação: decisões pendentes tratadas com as alternativas provisórias da §4: número vazio, `whatsapp-only` e nenhuma modalidade afirmada

### [2026-11-12 23:18 -03] Contribuição — FR-02 — WhatsApp e agenda

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Objetivo: corrigir QA-001 a QA-003 no que não depende de decisão, deixando os pontos de configuração prontos para as respostas
- Tarefas relacionadas: IMP-200, IMP-202, IMP-203, IMP-204, IMP-206, IMP-207, IMP-208, IMP-210, IMP-211, IMP-212 e IMP-600 a IMP-604 (concluídas); IMP-201 e IMP-205 continuam bloqueadas
- Branch: `fr-02/whatsapp-agenda`, em worktree separado (§11.1)
- Arquivos alterados: `index.html`, `script.js`, `styles.source.css`, `styles.css`, `package.json`, `tailwind.config.js`, `.prettierignore`, `README.md`, `tests/tools/compare-computed-styles.mjs`, `PLANO_IMPLEMENTACAO_COLABORATIVO.md`; criados `site-config.js`, `contact.js`, `scripts/check-release.mjs`, `tests/unit/contact.test.js`
- Alterações realizadas:
  - estrutura: além de `site-config.js` (§6.2), foi criado `contact.js` com as funções puras e a inicialização do contato. Ambos são scripts clássicos que também exportam para o Node, o que permite testes unitários sem dependências e mantém a página funcionando aberta direto do disco;
  - `site-config.js` concentra número, domínios de produção (`site.productionHosts`), modalidades e agenda; o número fictício `5500000000000` foi removido e o campo fica vazio até DEC-01;
  - validação de número brasileiro (DDI 55, DDD sem zero, celular com 9 dígitos ou fixo com 8; rejeita dígitos repetidos); URLs com `encodeURIComponent`; mensagem de horário com dia da semana, data completa, ano, horário, modalidade quando configurada e aviso de que a vaga depende de confirmação;
  - agenda `manual-schedule` com datas ISO, remoção de datas e horários vencidos no fuso `America/Bahia`, ordenação e remoção de repetidos; sem horários futuros, a página mostra a consulta pelo WhatsApp com texto de estado vazio;
  - modo `whatsapp-only` ativo: a agenda demonstrativa de 10 a 13/11/2026 saiu da página e foi substituída por um painel estático “Consulte a disponibilidade”, com aviso de que enviar a mensagem não reserva horário; o título e a nota da seção mudam conforme o modo;
  - estados do botão: sem número válido, “temporariamente indisponível”; número válido fora de `productionHosts`, “ambiente de teste”, com a URL em `data-whatsapp-preview` para QA; em produção, link com `noopener noreferrer`. O HTML nasce desativado (`aria-disabled`, sem `href`) e tem `<noscript>`; não há mais `href="#"`;
  - `npm run check:release` falha enquanto faltarem número válido ou domínio de produção e alerta se não houver modalidade; não faz parte de `npm test`, para não bloquear o desenvolvimento. Ligá-lo ao processo de publicação fica para a FR-07;
  - `script.js` formatado com Prettier em commit separado, sem mudança de comportamento, e removido do `.prettierignore`;
  - na grade da agenda manual, `align-content: start` impede que os botões de dia estiquem até a altura do painel quando há menos de quatro dias;
  - `tests/tools/compare-computed-styles.mjs` passou a ignorar, em vez de travar, alvos de hover que não recebem ponteiro, como os botões desativados
- Validações executadas:
  - `npm run test:unit`: 20 testes em 5 grupos (IMP-600 a IMP-604);
  - `npm test` (sintaxe, formatação, CSS atualizado e testes unitários);
  - `npm run check:release` com a configuração versionada: falha esperada por DEC-01 e DEC-04;
  - navegador, com `site-config.js` substituído por interceptação de rede e relógio fixo em 2026-11-20 09:00 (Bahia): configuração atual, número em ambiente de teste, produção, agenda manual com datas passadas e futuras, agenda manual só com datas vencidas, `site-config.js` ausente (404) e JavaScript desativado;
  - capturas de Contato e Agenda em 390 e 1280 px nos estados acima;
  - comparação de estilo computado com a `main` (após a FR-01) em 320, 390, 768, 1280 e 1440 px
- Resultado das validações:
  - todos os testes passaram; `check:release` falhou como esperado;
  - em nenhum estado sem número, fora de produção ou sem JavaScript há link para `wa.me` ou `href="#"`; em produção, os dois botões geram as URLs esperadas;
  - na agenda manual, o dia vencido (18/11) e o horário já encerrado (08:00 de 20/11) foram removidos, os dias foram ordenados, e a mensagem de cada horário trouxe a data completa e a modalidade; a troca de dia atualizou as mensagens;
  - fora de Contato e Agenda, as únicas diferenças de estilo computado são a altura total da página e variações de até 0,11 px na largura de textos, que mudaram de viewport entre execuções; é a instabilidade de carregamento das fontes do Google Fonts já observada no teste de controle da FR-01
- Pendências ou riscos:
  - IMP-201 aguarda DEC-01; com o número, também é preciso preencher `site.productionHosts` (DEC-04) para o link funcionar;
  - IMP-205 aguarda DEC-02, DEC-03 e, se manual, DEC-10; o código dos dois modos está pronto e testado;
  - semântica acessível dos botões de dia e preservação de foco ao trocar de dia continuam em IMP-324 a IMP-327 (FR-03B), assim como a revisão do botão desativado (`<a>` sem `href` com `aria-disabled`);
  - a ferramenta de comparação precisa esperar o carregamento das fontes específicas para eliminar o ruído de subpixel (FR-06);
  - testes end-to-end equivalentes às verificações no navegador ficam para IMP-615 e IMP-626 (FR-06)
- Arquivos ainda reservados: nenhum; reserva da FR-02 liberada até as decisões
- Próxima ação recomendada: integrar `fr-02/whatsapp-agenda` à `main`; iniciar a FR-03A (IMP-307, IMP-308, IMP-300 a IMP-313); obter DEC-01 a DEC-04
- Estado final: Bloqueada (restam IMP-201 e IMP-205, dependentes de decisão); demais tarefas concluídas

### [2026-11-13 10:45 -03] Contribuição — FR-03A — Estrutura, conteúdo estático, navegação e menu

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Objetivo: alinhar HTML, ordem visual e foco, tornar a página utilizável sem JavaScript e corrigir navegação e menu
- Tarefas relacionadas: IMP-300 a IMP-308 e IMP-310 a IMP-313 (concluídas); testes IMP-610, IMP-611, IMP-612, IMP-618 e IMP-632 entregues
- Branch: `fr-03a/estrutura-navegacao`, em worktree separado (§11.1); reserva e conclusão no mesmo ciclo, sem outras frentes ativas
- Arquivos alterados: `index.html`, `script.js`, `styles.source.css`, `styles.css`, `package.json`, `package-lock.json`, `.gitignore`, `.prettierignore`, `tests/tools/compare-computed-styles.mjs`; criados `playwright.config.js`, `tests/e2e/helpers.js`, `tests/e2e/estrutura-navegacao.spec.js`
- Alterações realizadas:
  - IMP-307: passos do contato, abas do "Sobre", card do Instagram e carrossel de fotos passaram para o HTML; o `script.js` não insere mais conteúdo. O fallback antigo do hero, o placeholder do retrato e o topo do Instagram (que o script removia logo após criar) foram excluídos com seu CSS;
  - IMP-308: sem JavaScript, os três painéis das abas ficam visíveis em sequência, e lista de abas, indicadores do carrossel e botão do menu ficam ocultos pelo atributo `hidden`; regras específicas garantem que `hidden` vença o `display` dos componentes;
  - IMP-300/IMP-301: Agenda antes de Contato no HTML; removidos `order: 99` e o `flex` do `<main>`;
  - IMP-302: link "Pular para o conteúdo", primeiro elemento focável, levando o foco ao `<main tabindex="-1">`;
  - IMP-303: seções nomeadas por `aria-labelledby` (seis regiões e o hero), menu mobile como `<nav aria-label="Menu">`, um único `h1`;
  - IMP-304/IMP-306: a navegação interna deixou de usar `preventDefault` e `pushState`; a rolagem, o foco, o histórico e Voltar/Avançar ficam com o navegador, e `scroll-padding-top: 5.5rem` compensa o cabeçalho. A transição decorativa continua, mas não atrasa a rolagem; sua revisão é IMP-336 (FR-03B);
  - IMP-305: `aria-current="true"` no link da seção visível, no menu principal e no mobile;
  - IMP-310 a IMP-313: botão do menu com `aria-controls`, `aria-expanded` e rótulo "Abrir menu"/"Fechar menu"; Escape fecha e devolve o foco ao botão; clique fora ou escolha de seção fecham o menu;
  - infraestrutura end-to-end da FR-06 antecipada: `@playwright/test` 1.65.0 e `@axe-core/playwright` 4.14.0 fixados, `npm run test:e2e`, servidor automático em 127.0.0.1:4173 e utilitários para substituir `site-config.js` e fixar o relógio. `npm test` continua sem os testes end-to-end, que exigem navegador (`npx playwright install chromium`);
  - a ferramenta de comparação de estilo passou a ancorar caminhos no `id` mais próximo e a carregar explicitamente os pesos das fontes
- Validações executadas: `npm test`; 13 testes end-to-end (ordem das seções, landmarks, ordem de foco com contato ativo, link de pular, âncoras abaixo do cabeçalho, histórico, `aria-current`, menu mobile por teclado e clique, abas e carrosséis com JavaScript, conteúdo sem JavaScript); comparação de pixels da página inteira com a `main` em 390 e 1280 px; capturas sem JavaScript e do link de pular; axe em 390 e 1280 px
- Resultado das validações:
  - todos os testes passaram;
  - página inteira idêntica à `main` em 1280 px; em 390 px, mesma altura e 0,02% dos pixels com diferença de suavização de texto (2 pixels com limiar 0,3);
  - axe: a violação crítica `aria-required-children` da referência (indicadores com `role="tablist"`) deixou de existir; restam só `color-contrast` (8 nós em 390 px, 13 em 1280 px), tratada em IMP-340 (FR-03C)
- Pendências ou riscos: teclado das abas e semântica dos carrosséis (IMP-320 a IMP-335) e revisão da transição (IMP-336) seguem na FR-03B; o rótulo `aria-label` sem papel no carrossel de fotos permanece para IMP-330; os botões do WhatsApp desativados não recebem foco, o que é coerente com o estado, mas a mensagem de status deve ser revista na FR-03C (IMP-342)
- Arquivos ainda reservados: nenhum
- Próxima ação recomendada: FR-03B (IMP-320 a IMP-339)
- Estado final: Concluída

### [2026-11-13 10:51 -03] Contribuição — FR-03B — Abas, agenda acessível, carrosséis e movimento

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Objetivo: tornar abas, seleção de dia e carrosséis operáveis por teclado e leitor de tela e conter o movimento
- Tarefas relacionadas: IMP-320 a IMP-327, IMP-330 a IMP-336, IMP-338 e IMP-339 (concluídas; IMP-337 consolidada em IMP-306); testes IMP-614, IMP-615, IMP-616, IMP-624, IMP-629 e IMP-630 entregues
- Branch: `fr-03b/componentes-movimento`, em worktree separado (§11.1)
- Arquivos alterados: `index.html`, `script.js`, `contact.js`, `styles.source.css`, `styles.css`, `package.json`, `README.md`, `tests/e2e/estrutura-navegacao.spec.js`; criados `tabs.js` e `tests/e2e/componentes-movimento.spec.js`
- Alterações realizadas:
  - `tabs.js`: abas no padrão WAI-ARIA com ativação automática, setas, Home, End e `tabindex` gerenciado; carregado antes de `contact.js` e `script.js`;
  - abas do "Sobre": `aria-controls`, `role="tabpanel"` e `aria-labelledby` nos painéis; um painel visível por vez (IMP-320 a IMP-323);
  - agenda manual: padrão de abas escolhido para os dias (IMP-324); cada dia tem nome acessível com a data completa, `aria-selected` expõe a seleção (IMP-325), o painel `#schedule-panel` é rotulado pelo dia ativo (IMP-326) e só o conteúdo do painel é refeito na troca, mantendo o foco no dia (IMP-327);
  - carrosséis: contêiner `role="group"` com `aria-roledescription="carrossel"` e nome; cada post é um slide com nome "N de 9"; slides inativos com `aria-hidden` desde o HTML (IMP-330, IMP-331); botões Anterior, Próximo e Pausar/Retomar com 44 × 44 px; usar Anterior/Próximo interrompe a rotação (IMP-332); pausa com ponteiro ou foco dentro do carrossel (IMP-333); `aria-live` "off" durante a rotação e "polite" quando pausado; os indicadores viraram elementos apenas visuais (`aria-hidden`), removendo o padrão de abas parcial e os alvos de 5 px (IMP-335). O carrossel de fotos ganhou botão de pausa no canto superior direito, pois o inferior fica sob o selo do CRP;
  - IMP-336: a sobreposição de tela cheia foi removida (HTML, CSS e JS); a navegação usa apenas a rolagem nativa;
  - IMP-338: os ícones flutuantes do hero deixaram de ter animação contínua; o zoom de 6 s das fotos foi removido; a transição de fundo das seções, que nunca mudava, saiu;
  - IMP-339 e IMP-334: tokens `--motion-fast` (0,2 s), `--motion-base` (0,35 s), `--motion-slow` (0,6 s) e `--ease-standard` em todas as transições próprias; com `prefers-reduced-motion`, tokens zerados, sem animação de entrada nem do barco do contato, `scroll-behavior: auto`, `motion-reduce:transition-none` nos utilitários do HTML, carrosséis iniciando pausados e barco lateral sem animação de acompanhamento
- Validações executadas: `npm test`; 22 testes end-to-end (9 novos: teclado das abas, dias da agenda como abas com foco preservado e mensagens com data, slides expostos, botões e pausa, pausa por ponteiro e por foco, carrossel de fotos, movimento reduzido, navegação sem sobreposição, ícones sem animação contínua); capturas do card do Instagram e do carrossel de fotos em 390 e 1280 px; axe em 390 e 1280 px
- Resultado das validações: todos os testes passaram; axe sem violações além de `color-contrast` (8 nós em 390 px, 13 em 1280 px), que é IMP-340 (FR-03C)
- Pendências ou riscos:
  - o card do Instagram ficou cerca de 40 px mais alto por causa da linha de controles; os indicadores continuam parcialmente sob o selo "cada história", como antes;
  - os ícones de curtir, comentar, compartilhar e salvar continuam cenográficos (IMP-516, DEC-08);
  - as duas fotos têm o mesmo texto alternativo "Guilherme Teixeira em atendimento clínico"; confirmar com o responsável quem aparece em cada foto e descrevê-las com precisão (IMP-344, IMP-509)
- Arquivos ainda reservados: nenhum
- Próxima ação recomendada: FR-03C (IMP-340 a IMP-350)
- Estado final: Concluída

### [2026-11-13 11:01 -03] Contribuição — FR-03C — Contraste, toque, foco, logotipo e responsividade

- Responsável/conversa: conversa de análise e revisão do plano de implementação
- Objetivo: concluir a acessibilidade visual e a responsividade preservando o baseline visual
- Tarefas relacionadas: IMP-340 a IMP-350 (concluídas); testes IMP-617, IMP-625, IMP-627 e IMP-628 entregues
- Branch: `fr-03c/visual-responsivo`, em worktree separado (§11.1)
- Arquivos alterados: `index.html`, `styles.source.css`, `styles.css`, `assets/guilherme-teixeira-logo.png`, `playwright.config.js`, `package.json`, `package-lock.json`; criados `tests/e2e/contraste.spec.js`, `tests/e2e/layout.spec.js` e as capturas de referência em `tests/e2e/layout.spec.js-snapshots/`
- Alterações realizadas:
  - IMP-340: opacidade mínima do azul calculada por fundo (0,67 na areia, 0,73 no topo do card infantil e do painel de contato, 0,78 no topo do card de adultos). Textos secundários passaram para 75%, e 80% dentro dos cards de atendimento; links do menu de `#617486` para `#4f6275`; "+" do FAQ para 70% (componente, 3:1); números dos passos do contato de `#d99174` (2,3:1) para `#9c4f2e`; fundo do rótulo da foto de 75% para 90%. Brancos translúcidos sobre o azul escuro já atendiam (≥ 5,1:1);
  - IMP-341: botão de menu, link do logotipo, "Quero saber mais", links dos cards de conteúdo, links do menu principal e abas com 44 px; perguntas do FAQ com área clicável maior sem mudar o espaçamento visual; os indicadores do carrossel já eram só visuais (FR-03B);
  - IMP-342: `:focus-visible` com contorno de 2 px em `#17324d`, deslocado 3 px; em `#conteudos`, no painel da agenda e no link de pular, contorno pêssego;
  - IMP-343: o PNG do logotipo tinha a arte em 265 × 85 de 316 × 158 px, com fundo branco opaco; foi recortado para 273 × 93 e passou a ser dimensionado só pela altura (44 px; 38 px no mobile). Mais legível e sem deformação;
  - IMP-344: textos alternativos dos 9 posts transcrevem o texto de cada imagem; as fotos ganharam descrição da cena mantendo a identificação dada pelo autor; a arte das abas ficou com `alt=""`; os ícones cenográficos de curtir, comentar, compartilhar e salvar passaram a `aria-hidden`, sem anunciar ações inexistentes;
  - IMP-345: menu completo só a partir de 1024 px (`lg`); entre 768 e 1023 px ficam logotipo, "Vamos conversar" em uma linha (`whitespace-nowrap`) e botão de menu; os estilos do menu recolhido saíram da media query mobile para valerem nessa faixa;
  - IMP-347/IMP-348: colunas do hero com `min-w-0`, card com `w-full` e padding menor no mobile, título com `clamp(2.25rem, 11vw, 3rem)` abaixo de 640 px, indicadores do carrossel com `min-width: 0`;
  - IMP-349: removidas as alturas mínimas dos cards de atendimento (490/410 px) e do contato (78vh/72vh); o carrossel de fotos perdeu a altura mínima, que, com `aspect-ratio`, virava largura mínima de 320 px e estourava a seção "Sobre" em 320 px;
  - IMP-350: barquinho do card infantil reduzido e com faixa reservada (`mt-24`), sem sobrepor o título; círculos do card de adultos deslocados para cima; ícones flutuantes do hero ocultos abaixo de 480 px; o link de pular passou a ser ocultado por `clip-path`, sem deslocamento para fora da tela;
  - o atributo `hidden` do botão de menu foi reforçado, pois a nova classe `grid` o vencia e o botão voltava a aparecer sem JavaScript (detectado pelo teste da FR-03A);
  - `playwright.config.js` aceita `E2E_BASE_URL` para rodar a suíte contra outro endereço (por exemplo, homologação)
- Validações executadas:
  - novo teste de contraste por pixel: a página é renderizada com o texto transparente e a cor de cada texto é combinada com os pixels reais do fundo sob as linhas, cobrindo gradientes e imagens que o axe não avalia; executado em 320, 390, 768 e 1280 px. Contra a versão anterior, o teste reprova mais de 25 textos em 390 px (o axe apontava 8), o que confirma a sensibilidade;
  - testes de layout em 320, 375, 390, 640 (200% de zoom em 1280), 768, 1024, 1280 e 1440 px: sem rolagem horizontal e sem texto, link, botão ou imagem recortado ou fora da tela; proporção do logotipo; cabeçalho sem colisões e botão em uma linha em 768, 1024 e 1280 px; card do hero dentro do contêiner, inclusive com a rotação; alvos de 44 × 44 px no mobile; foco visível em fundo claro e escuro;
  - capturas de referência do hero (320, 390 e 1440 px) e do cabeçalho (768 e 1024 px), estáveis em duas execuções seguidas;
  - suíte completa (48 testes end-to-end), `npm test` e axe em 390 e 1280 px
- Resultado das validações: todos os testes passaram; axe sem nenhuma violação em 390 e 1280 px (a referência tinha 2 regras, uma crítica)
- Pendências ou riscos:
  - os 9 posts do Instagram formam uma série numerada que o carrossel exibe na ordem inversa (o primeiro slide é o 9/9 e o segundo o 8/9); reordenar é decisão de conteúdo ligada a DEC-08;
  - confirmar com o responsável quem aparece nas fotos `guilherme-photo-01/02.jpeg` e se as descrições estão corretas (IMP-509);
  - as capturas de referência dependem de renderização Linux/Chromium; em outra plataforma devem ser regeneradas com `npx playwright test --update-snapshots`
- Arquivos ainda reservados: nenhum
- Próxima ação recomendada: FR-04 (imagens e desempenho)
- Estado final: Concluída

<!-- CONTRIBUICOES: ACRESCENTAR NOVAS ENTRADAS IMEDIATAMENTE ANTES DESTE MARCADOR. NAO REMOVER. -->
