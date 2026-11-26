# Travessia — direção e implementação

Branch: `refacto-refaz-desingne`.

## Auditoria

HTML semântico, JavaScript nativo, Tailwind 3.4 e PostCSS. Gerenciador npm, versões fixadas em package-lock.json. Fontes locais: DM Sans e Inter; fontes alternativas de acessibilidade preservadas. Sem dependência adicional de animação.

Paleta do projeto: marinho `#17324D`, azul `#DDECF5`, pêssego `#F5B79C`, areia `#F8F5F1`, névoa `#EEF6F8`. Transparências e sombras derivadas dessas cores. A tipografia editorial de destaque usa a fonte de sistema Georgia.

Assinaturas existentes: `assets/paper-boat-line.png`; SVGs `#scroll-boat`, `#brand-wave-path`, `.mini-boat-one`, `.mini-boat-two` em index.html. Fotografias e nove posts permanecem locais em assets/img; originais em assets/source.

## Storyboard aprovado

1. Header flutuante, superfície translúcida e progresso discreto de leitura.
2. Hero assimétrico: título com revelação em máscaras, composição do Instagram preservada e barco em camadas com reação sutil ao ponteiro.
3. Manifesto: pausa editorial, texto real com destaque progressivo conforme a rolagem.
4. Serviços: duas superfícies táteis, azul e pêssego, entrada em sequência e luz localizada no hover.
5. Sobre: retrato, formação e registro reais; carrossel e abas acessíveis preservados.
6. Jornada: curva SVG desenhada com progresso do scroll; barco acompanha a travessia e três etapas explicam o começo do cuidado.
7. Conteúdos, dúvidas, turnos e contato preservados; encerramento com horizonte e barco.

Não são acrescentados depoimentos, resultados clínicos, qualificações, modalidades ou disponibilidade não confirmados.

## Movimento e manutenção

`cinematic.js` concentra o aprimoramento progressivo. Anima transform/opacity e o traço SVG. Geometria é medida fora do loop de scroll, atualizada com ResizeObserver. O frame de animação só permanece ativo durante a rolagem inercial. Não substitui teclado, toque, links nativos nem a rolagem de regiões internas.

`prefers-reduced-motion` e a opção local de pausar desabilitam inércia e efeitos, mantendo conteúdo visível. Abas, carrosséis, WhatsApp e turnos continuam sob os módulos originais. `styles.source.css` é a fonte; `styles.css` deve ser regenerado por npm run build. O pacote dist inclui cinematic.js.

## Roteiro sugerido de gravação

Comece com o hero parado para registrar a entrada do título. Role lentamente pelo manifesto; pause brevemente nos cartões de atendimento. Acompanhe o barco na curva da jornada e termine no convite para conversar. Mantenha o ponteiro longe dos controles dos carrosséis durante a captura. A fluidez real depende do navegador, hardware e captura; a implementação não garante 60 fps em todos os dispositivos.

## Validação realizada

- `check:js`, `check:html`, `check:css`, formatação dos arquivos alterados, build e pacote dist aprovados. Projeto JavaScript sem etapa de tipagem TypeScript.
- 33 testes unitários aprovados.
- 14 testes novos de movimento/integração aprovados no Chromium, incluindo repouso sem rAF ocioso, delta de 1 px, rolagem interna, preferências de movimento, jornada e WhatsApp por turno.
- 34 verificações de layout, axe, navegação e FAQ aprovadas; larguras de 320 a 1440 px.
- Verificações adicionais de carrosséis, foco, leitura e preferências aprovadas. O botão de pausa do retrato foi centralizado para não ser recortado pelo arco.
- Capturas de desktop, celular, manifesto e jornada inspecionadas. Não foram atualizados snapshots da composição antiga; o novo design foi revisado diretamente.

Pendência operacional anterior ao redesign: `check:release` exige o domínio público em `site.url`. O preview local funciona, mas não foi feita implantação de produção. Testes de navegador nesta entrega usam Chromium; não há alegação de auditoria nos demais motores ou medição de 60 fps em todos os equipamentos.
