# Relatório de estado do projeto — Landing Page Guilherme

## 1. Identificação da análise

| Item | Valor |
| --- | --- |
| Projeto | `landing_page_guilherme` |
| Data da análise | 05/11/2026 |
| Branch analisada | `main` |
| Commit analisado | `0720985` — `Add Guilherme psychology landing page` |
| Estado inicial do Git | Limpo e sincronizado com a referência local `origin/main` |
| Tipo de projeto | Landing page estática |
| Tecnologias | HTML5, CSS3, JavaScript puro, Tailwind CSS via CDN e Google Fonts |

Este relatório descreve o conteúdo presente no checkout local no momento da análise. Não foram feitas correções no código da landing page; o único arquivo acrescentado foi este documento.

## 2. Resumo executivo

O projeto já possui uma landing page visualmente estruturada e com conteúdo coerente para divulgação de serviços de psicologia. Há navegação responsiva, seções de atendimento, apresentação profissional, conteúdos, FAQ, agenda demonstrativa, contato por WhatsApp, carrosséis e animações.

Apesar disso, o estado atual deve ser classificado como **protótipo funcional / pré-publicação**, e não como versão pronta para produção. Os principais bloqueadores são:

1. o número do WhatsApp ainda é fictício (`5500000000000`);
2. a agenda é fixa, demonstrativa e ficará desatualizada rapidamente;
3. a mensagem de solicitação de horário não informa o dia/data selecionado;
4. a maior parte do layout depende do Tailwind carregado em tempo de execução por uma CDN;
5. não há processo de build, testes automatizados, CI/CD ou documentação de publicação;
6. existem lacunas de acessibilidade, desempenho, SEO e manutenção do CSS.

**Conclusão:** a base de conteúdo e identidade visual está bem encaminhada, mas ainda requer uma etapa de preparação técnica antes de ser publicada para captar contatos reais.

## 3. Inventário do repositório

O repositório possui 19 arquivos versionados:

- `index.html`: estrutura e conteúdo da página, além de 14 blocos de estilo inline;
- `styles.css`: estilos personalizados, agenda e componentes interativos;
- `script.js`: WhatsApp, agenda, menu mobile, navegação ativa, transições, abas e carrosséis;
- `README.md`: contém somente o título do repositório;
- 15 arquivos em `assets/`:
  - 2 fotografias profissionais;
  - 9 imagens de posts do Instagram;
  - 1 logotipo;
  - 3 elementos gráficos decorativos.

Os assets somam aproximadamente **2,21 MB**. O histórico contém dois commits e não possui tags de versão.

Não foram encontrados:

- `package.json` ou gerenciador de dependências;
- `.gitignore`;
- licença de uso;
- testes automatizados;
- configuração de lint ou formatação;
- pipeline de integração/deploy;
- `robots.txt`, `sitemap.xml`, favicon ou manifesto;
- configuração de domínio ou hospedagem;
- exemplo de variáveis de ambiente.

## 4. Arquitetura atual

### 4.1 Frontend

A aplicação é uma página única estática. O HTML é entregue diretamente e o JavaScript manipula o DOM após o carregamento. Não existe framework de aplicação, empacotador ou etapa de compilação.

O Tailwind CSS é carregado por `https://cdn.tailwindcss.com`, e sua configuração está declarada dentro do próprio `index.html`. O CSS personalizado está dividido entre `styles.css` e vários blocos `<style>` no HTML.

### 4.2 Backend e dados

Não existe backend, banco de dados ou API própria. A agenda está declarada diretamente em `script.js`, e o contato é redirecionado para `wa.me`.

Consequentemente:

- os horários não são consultados nem reservados em tempo real;
- não há prevenção de conflito de agenda;
- nenhuma solicitação é persistida pela aplicação;
- alterações de datas, horários e telefone exigem edição e nova publicação do código.

### 4.3 Dependências externas

- Tailwind CSS por CDN;
- Google Fonts (`DM Sans` e `Inter`);
- WhatsApp (`wa.me`) para conversão dos CTAs.

Se Tailwind ou Google Fonts ficarem indisponíveis ou forem bloqueados, a apresentação visual será afetada. Não há estratégia local de fallback para as classes utilitárias do Tailwind.

## 5. Funcionalidades existentes

### Conteúdo e navegação

- cabeçalho fixo com logotipo;
- menu desktop e menu mobile;
- navegação por âncoras;
- destaque do item de menu conforme a seção visível;
- transição animada entre seções;
- rodapé com nome, CRP e ano.

### Seções

- apresentação principal com proposta de valor;
- atendimentos para infância/adolescência e adultos;
- apresentação do profissional e formação;
- cards de conteúdos;
- FAQ com elementos `details`/`summary`;
- agenda demonstrativa com quatro dias e horários;
- contato via WhatsApp.

### Interações

- agenda renderizada dinamicamente;
- abas sobre a forma de trabalho;
- carrossel automático com nove posts do Instagram;
- carrossel automático com duas fotografias;
- animação lateral vinculada ao scroll;
- menu mobile recolhível;
- animações de entrada, hover e transição de página.

## 6. Pontos positivos

- Estrutura semântica básica adequada, com `lang="pt-BR"`, `main`, `nav`, `section`, títulos e apenas um `h1`.
- Título e descrição da página já configurados.
- Identidade visual consistente em cores, tipografia e elementos gráficos.
- Conteúdo direcionado aos públicos atendidos e com linguagem acolhedora.
- CRP aparece no logotipo, na apresentação e no rodapé.
- FAQ usa elementos nativos, que continuam úteis mesmo sem JavaScript.
- Links externos abrem com `rel="noreferrer"`.
- Não foram encontrados segredos, tokens ou credenciais reais no código.
- Todos os arquivos locais referenciados existem.
- O JavaScript passa na checagem de sintaxe do Node.js.
- A árvore de objetos Git e o diff do commit não apresentam erros de integridade ou espaços finais.

## 7. Achados e riscos

### 7.1 Bloqueadores de publicação

#### B1 — WhatsApp fictício

**Evidência:** `script.js` define `whatsappNumber = '5500000000000'` e contém um comentário orientando a troca antes da publicação.

**Impacto:** todos os CTAs principais e horários da agenda geram links para um número inválido. A principal conversão da página não funciona em produção.

**Ação recomendada:** substituir pelo número profissional validado, testar os links em desktop e celular e centralizar esse dado em uma configuração claramente documentada.

#### B2 — Agenda demonstrativa e estática

**Evidência:** as datas de 10 a 13 de novembro de 2026 e todos os horários estão escritos diretamente em `scheduleData`.

**Impacto:** a agenda ficará obsoleta, poderá apresentar horários que não existem e não bloqueia vagas já solicitadas.

**Ação recomendada:** escolher uma das alternativas antes da publicação:

1. remover a grade e manter apenas o CTA “Consultar horários pelo WhatsApp”;
2. atualizar manualmente a agenda com um processo operacional definido;
3. integrar uma solução real de agendamento.

#### B3 — Solicitação não informa a data escolhida

**Evidência:** `createWhatsAppUrl` recebe somente `time`; a mensagem enviada informa apenas o horário.

**Impacto:** o profissional não recebe o dia selecionado, tornando a solicitação ambígua e sujeita a erro.

**Ação recomendada:** incluir dia da semana, dia, mês, ano, horário e modalidade na mensagem gerada.

### 7.2 Prioridade alta

#### A1 — Tailwind via CDN em tempo de execução

O HTML depende de `cdn.tailwindcss.com` para interpretar grande parte das classes de layout. Essa abordagem simplifica o protótipo, mas cria dependência externa não versionada, aumenta o trabalho no navegador e não fornece um artefato CSS otimizado para produção.

**Recomendação:** adicionar uma etapa mínima de build para compilar e minificar o Tailwind, gerando CSS estático versionado.

#### A2 — Ordem visual diferente da ordem do DOM

No HTML, `#contato` aparece antes de `#agenda`, mas o CSS aplica `main > #contato { order: 99 }`, movendo o contato visualmente para depois da agenda.

**Impacto:** a ordem de leitura e foco pode divergir da ordem visual, especialmente para leitores de tela e navegação por teclado.

**Recomendação:** colocar as seções na ordem final diretamente no HTML e remover a reordenação por Flexbox.

#### A3 — Acessibilidade de controles e animações

- o botão do menu mobile não expõe `aria-expanded` nem `aria-controls`;
- as abas não implementam associação com painel, foco ou navegação pelas setas;
- os indicadores do carrossel usam `role="tablist"`, mas não completam o padrão de abas;
- os carrosséis automáticos não oferecem controle de pausa acessível;
- não há tratamento para `prefers-reduced-motion`;
- a transição em tela cheia pode causar desconforto e adiciona atraso a toda navegação interna;
- não foi encontrada regra de `scroll-margin-top` para compensar o cabeçalho fixo.

**Recomendação:** realizar uma rodada de acessibilidade por teclado e leitor de tela, corrigindo os padrões ARIA e respeitando redução de movimento.

#### A4 — Todas as imagens dos carrosséis são carregadas imediatamente

O JavaScript insere nove posts e duas fotografias sem `loading="lazy"`, `decoding="async"`, `srcset` ou dimensões explícitas.

**Impacto:** transferência inicial desnecessária de aproximadamente 2,21 MB em imagens, maior tempo de carregamento e possibilidade de deslocamentos de layout.

**Recomendação:** gerar versões WebP/AVIF responsivas, declarar dimensões, priorizar somente a primeira imagem e aplicar carregamento tardio às demais.

#### A5 — Ausência de fluxo de qualidade e publicação

Não existe comando documentado para servir, validar, testar ou publicar o projeto. Também não há CI, ambiente de homologação ou verificação automatizada de links e acessibilidade.

**Recomendação:** criar scripts reprodutíveis para desenvolvimento, build e validação, além de documentar a hospedagem escolhida.

### 7.3 Prioridade média

#### M1 — CSS fragmentado e difícil de manter

O `index.html` possui 14 blocos `<style>`, 44 usos de `!important` e várias redefinições sucessivas para `#contato`, `#conteudos`, `#faq` e `#agenda`. O `styles.css` está condensado em apenas três linhas físicas muito extensas.

**Impacto:** aumenta o risco de regressões, dificulta identificar qual regra prevalece e torna revisão e manutenção mais lentas.

**Recomendação:** consolidar o CSS em arquivos organizados, remover regras sobrescritas e aplicar formatação automática.

#### M2 — README insuficiente

O README contém apenas `# landing_page_guilherme`, sem objetivo, instruções de execução, configuração do WhatsApp, atualização da agenda, estrutura, deploy ou responsáveis.

#### M3 — SEO e compartilhamento incompletos

Há `title` e `meta description`, mas faltam, conforme a estratégia de publicação:

- URL canônica;
- Open Graph e Twitter Cards;
- favicon;
- `robots.txt` e `sitemap.xml`;
- dados estruturados apropriados e revisados;
- domínio e estratégia de indexação.

#### M4 — Conteúdo e links ainda demonstrativos

- dois cards de conteúdo exibem “Em breve”, mas direcionam para contato;
- os ícones que imitam ações do Instagram não executam ações reais;
- o carrossel não possui link explícito para o perfil do Instagram;
- “online ou presencial” é apresentado como status geral, enquanto o FAQ orienta consultar os formatos disponíveis.

É necessário decidir quais elementos são meramente decorativos e quais devem levar a uma ação real.

#### M5 — Privacidade e revisão profissional

A página não coleta dados diretamente, mas envia o visitante ao WhatsApp e carrega recursos de terceiros. Por se tratar de serviço de psicologia, convém revisar com o responsável profissional:

- textos e afirmações de divulgação;
- uso de imagens e autorização de publicação;
- política de privacidade e informação sobre serviços externos;
- requisitos aplicáveis do conselho profissional e da legislação de proteção de dados.

Este relatório não substitui avaliação jurídica ou regulatória.

### 7.4 Prioridade baixa

- Ano do rodapé fixado em 2026 e sujeito a manutenção manual.
- Arquivos `pastel-blue.png` e `pastel-orange.png` estão versionados, mas não foram encontrados nas referências do HTML, CSS ou JavaScript.
- Não existe `.gitignore`, licença ou convenção de versionamento.
- O README não termina com quebra de linha.

## 8. Segurança

Não há autenticação, armazenamento local de dados, backend ou formulário próprio. A superfície de ataque é pequena, porém há pontos de endurecimento para produção:

- reduzir scripts externos e fixar o processo de build;
- definir Content Security Policy e demais cabeçalhos HTTP na hospedagem;
- revisar dependências externas e política de referrer;
- garantir HTTPS e redirecionamento para um único domínio canônico;
- não inserir dados sensíveis, credenciais ou tokens diretamente no frontend.

Nenhuma vulnerabilidade explorável foi confirmada nesta análise estática. Também não houve teste dinâmico de segurança em ambiente publicado.

## 9. Validações executadas

| Verificação | Resultado |
| --- | --- |
| `node --check script.js` | Aprovado; sem erro de sintaxe |
| Existência dos assets referenciados | Aprovado; nenhuma referência local ausente |
| Formatos e dimensões dos assets | Aprovado; JPEG e PNG legíveis |
| Inspeção visual individual de amostras | Aprovado para logotipo, fotografia e post do Instagram |
| `git fsck --full` | Aprovado; repositório íntegro |
| `git diff --check HEAD^` | Aprovado; sem erros de whitespace no commit |
| Busca por segredos e placeholders | Nenhum segredo encontrado; WhatsApp fictício e agenda demonstrativa confirmados |
| Testes automatizados | Não executados; o projeto não possui testes |
| Build de produção | Não executado; não existe processo de build |
| Lighthouse/axe e teste visual responsivo | Não concluídos; a execução renderizada foi bloqueada pelas restrições do ambiente de análise |

A aprovação de sintaxe e integridade **não equivale** a um teste completo no navegador. Antes da publicação ainda é necessário validar a página renderizada em tamanhos mobile e desktop, nos navegadores-alvo e em conexão real.

## 10. Plano recomendado

### Etapa 1 — Tornar a conversão real

1. confirmar e configurar o número profissional do WhatsApp;
2. corrigir a mensagem da agenda para incluir a data completa;
3. decidir se a agenda será removida, mantida manualmente ou integrada;
4. testar todos os CTAs sem efetuar contato indevido durante a homologação.

### Etapa 2 — Preparar a base para produção

1. configurar build local do Tailwind;
2. consolidar e formatar HTML, CSS e JavaScript;
3. criar `.gitignore`, scripts e documentação de desenvolvimento;
4. definir hospedagem, domínio, HTTPS e cabeçalhos de segurança;
5. criar ambiente de homologação.

### Etapa 3 — Qualidade da experiência

1. corrigir ordem do DOM e navegação por teclado;
2. implementar redução de movimento e controles de carrossel;
3. otimizar e carregar imagens de forma responsiva;
4. validar contraste, foco visível e leitores de tela;
5. executar Lighthouse e testes em mobile/desktop.

### Etapa 4 — Conteúdo, SEO e operação

1. completar README e instruções de manutenção;
2. configurar metadados sociais, favicon, sitemap e indexação;
3. decidir o destino dos cards “Em breve” e do Instagram;
4. revisar conteúdo, autorizações de imagem, privacidade e conformidade profissional;
5. definir responsável por atualizar agenda, textos, imagens e ano do rodapé.

## 11. Critérios mínimos para considerar o projeto pronto

- WhatsApp real configurado e testado;
- agenda removida ou alimentada por uma fonte confiável;
- data completa presente em toda solicitação de horário;
- CSS de produção gerado sem dependência do compilador Tailwind no navegador;
- navegação por teclado e redução de movimento funcionando;
- imagens otimizadas e carregadas de forma adequada;
- validação responsiva e cross-browser concluída;
- metadados e arquivos básicos de SEO configurados;
- deploy HTTPS documentado e reproduzível;
- README com execução, configuração, manutenção e publicação;
- revisão final do conteúdo e dos requisitos profissionais.

## 12. Parecer final

A landing page possui uma direção visual consistente, conteúdo substancial e boas bases para apresentação do profissional. O trabalho restante não é uma reconstrução total: trata-se principalmente de transformar um protótipo estático em uma entrega operacional, acessível, otimizada e sustentável.

No estado analisado, **não é recomendável publicar como página oficial de captação** sem corrigir os três bloqueadores de conversão e realizar a validação renderizada. Após essas correções e a preparação de produção, o projeto pode evoluir com baixo nível de complexidade, pois sua arquitetura permanece simples e não depende de backend próprio.
