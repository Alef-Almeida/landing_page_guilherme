# Conteúdo para aprovação do responsável

Este documento reúne o que a página precisa do responsável pelo projeto antes da publicação. Nada daqui foi publicado: os rascunhos só entram no site depois de aprovados (§4 do plano, DEC-01 a DEC-10).

## 1. Decisões e onde cada resposta entra

| Decisão | O que responder                                                               | Onde entra                                                                   | Efeito na página                                                                        |
| ------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| DEC-01  | Número profissional do WhatsApp, com DDD                                      | `site-config.js` → `whatsapp.number`                                         | Botões do WhatsApp passam a funcionar no domínio oficial                                |
| DEC-02  | A agenda mostra horários publicados ou só a consulta pelo WhatsApp?           | `site-config.js` → `schedule.mode`                                           | `'manual-schedule'` exibe dias e horários; `'whatsapp-only'` mantém o painel atual      |
| DEC-03  | Modalidades realmente oferecidas (online, presencial ou ambas)                | `site-config.js` → `modalities`                                              | Aparecem na agenda e nas mensagens; liberam a resposta do FAQ                           |
| DEC-04  | Domínio e hospedagem                                                          | `site-config.js` → `site.url` e `site.productionHosts`; depois `npm run seo` | Canonical, compartilhamento, `robots.txt`, `sitemap.xml` e ativação do link do WhatsApp |
| DEC-05  | Os cards "Em breve" saem, ficam como aviso ou levam a outro conteúdo?         | `index.html`, seção "Conteúdos"                                              | Hoje: aviso "Em breve", sem link (alternativa provisória)                               |
| DEC-06  | Perfil oficial do Instagram                                                   | `index.html`, card do hero e rodapé                                          | Permite um link real para o perfil                                                      |
| DEC-07  | Texto de privacidade e de divulgação profissional                             | Rodapé ou página própria                                                     | Ver rascunho na seção 2                                                                 |
| DEC-08  | O mockup do Instagram é editorial ou leva ao perfil?                          | `index.html`, card do hero                                                   | Hoje: peça editorial, sem ícones de ação (alternativa provisória)                       |
| DEC-09  | Informações operacionais: local, duração, frequência, pagamento, cancelamento | FAQ e rodapé                                                                 | Ver rascunhos nas seções 3 e 4                                                          |
| DEC-10  | Se a agenda for manual: quem atualiza, com que frequência e como              | `site-config.js` → `schedule.days`                                           | Necessária antes de ativar `'manual-schedule'`                                          |

## 2. Rascunho: aviso de privacidade (DEC-07, IMP-508)

Os fatos abaixo foram verificados no código atual; o texto precisa de revisão do responsável e, se necessário, de orientação jurídica.

> **Privacidade.** Esta página não usa cookies, ferramentas de análise de visitas, anúncios nem formulários, e não coleta dados pessoais. Fontes e imagens são servidas pelo próprio site. As escolhas do painel de acessibilidade (tamanho do texto, contraste, fonte e outras) ficam guardadas só no seu navegador. Se você ativar a tradução em Libras, a página carrega o VLibras, serviço do Governo Federal, e envia a ele o texto a ser traduzido. Ao tocar em um botão do WhatsApp, você é levado ao aplicativo do WhatsApp, que tem política de privacidade própria; a mensagem só é enviada se você confirmar o envio. As informações compartilhadas na conversa são tratadas com sigilo profissional, conforme o Código de Ética Profissional do Psicólogo.

Fatos que precisam continuar verdadeiros para o texto valer: nenhuma ferramenta de análise ou outro script de terceiros for adicionado (o VLibras é a única exceção e só carrega quando a pessoa pede); o contato continuar sendo só pelo WhatsApp.

## 3. Rascunhos para o FAQ (DEC-03, DEC-07, DEC-09, IMP-513)

Os trechos entre colchetes dependem de informação que só o responsável pode fornecer.

- **Como é a primeira sessão?** A primeira sessão é um espaço para conhecer sua demanda, explicar como o acompanhamento funciona e combinar os próximos passos. [Duração da sessão: ___ minutos.]
- **O atendimento é online ou presencial?** [Resposta conforme DEC-03. Se presencial: endereço ou região de atendimento.]
- **Qual é a frequência das sessões?** [Por exemplo: em geral semanal, definida em conjunto conforme cada caso.]
- **Como funciona o atendimento de crianças e adolescentes?** Texto atual mantido; avaliar acrescentar como os responsáveis participam [ex.: sessões de orientação aos responsáveis].
- **Quais são os valores e as formas de pagamento?** [Informar ou indicar que são passados pelo WhatsApp.]
- **Como funcionam remarcações e cancelamentos?** [Política de antecedência.]

## 4. Rodapé (DEC-06, DEC-09, IMP-514)

Hoje o rodapé tem nome, CRP e ano (atualizado automaticamente). Itens que podem entrar após confirmação:

- [ ] Link para o perfil oficial do Instagram (DEC-06)
- [ ] Modalidades de atendimento (DEC-03)
- [ ] Cidade ou região de atendimento presencial (DEC-09)
- [ ] Link para o aviso de privacidade (DEC-07)

## 5. Autorização de uso das imagens (IMP-509)

| Imagem                                               | O que confirmar                                                                                                                                              |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `assets/source/guilherme-photo-01.jpeg` e `-02.jpeg` | Quem aparece em cada foto, se os textos alternativos estão corretos e se há autorização de uso de imagem para publicação                                     |
| `assets/source/instagram-02` a `-09.jpeg`            | Os posts usam fotografias de crianças e adultos: confirmar a licença dos bancos de imagem ou a autorização das pessoas retratadas, especialmente de crianças |
| `assets/guilherme-teixeira-logo.png`                 | Titularidade da marca                                                                                                                                        |

## 6. Revisão profissional e regulatória (IMP-510)

Itens para o responsável conferir; este documento não substitui avaliação jurídica ou do conselho profissional.

- [ ] Textos da página conferidos frente ao Código de Ética Profissional do Psicólogo e às resoluções do Conselho Federal de Psicologia sobre divulgação de serviços e atendimento on-line, se houver.
- [ ] O número de registro (CRP 03/36532) aparece no cabeçalho (logotipo), na seção "Sobre" e no rodapé.
- [ ] A página não promete resultados, prazos ou curas ("sem promessas prontas" no hero).
- [ ] A formação citada ("pós-graduando em Desenvolvimento Infantil e Análise do Comportamento Aplicada") está atual.
- [ ] Os posts do carrossel podem ser exibidos fora do Instagram.

## 7. Pontos de conteúdo encontrados na implementação

- **Ordem dos posts do carrossel:** os 9 posts formam uma série numerada que o carrossel exibe na ordem inversa (o primeiro slide é o 9/9; o segundo, o 8/9; o último, o 1/9, "Quando uma criança pode precisar de psicoterapia?"). Para seguir a série, a ordem seria 1, 2, 3, …, 9. Decidir junto com DEC-08.
- **Cards "Em breve":** dois dos três cards de conteúdos anunciam materiais que ainda não existem (DEC-05).
