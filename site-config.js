/*
 * Configuração operacional da landing page — ponto único para contato e agenda.
 *
 * Antes de publicar, rode `npm run check:release`: ele falha enquanto algum dado
 * obrigatório estiver pendente. Veja também a seção “Configuração” do README.
 */
(function (root) {
  const SITE_CONFIG = {
    professionalName: 'Guilherme',

    site: {
      // Endereço público da página, com https e barra final, por exemplo 'https://www.dominio.com.br/'.
      // Depois de preencher, rode `npm run seo` para gerar canonical, Open Graph, robots.txt e sitemap.xml.
      // Pendente: DEC-04.
      url: '',
      // Domínios em que o link do WhatsApp fica ativo, por exemplo ['www.dominio.com.br', 'dominio.com.br'].
      // Inclui localhost e 127.0.0.1 para funcionamento imediato no ambiente local.
      productionHosts: ['localhost', '127.0.0.1'],
    },

    whatsapp: {
      // Número profissional com DDI 55 e DDD (+55 74 9954-2056). Pontuação é ignorada.
      number: '557499542056',
      initialMessage: 'Olá, Guilherme. Gostaria de saber mais sobre o acompanhamento psicológico.',
      scheduleMessage: 'Olá, Guilherme. Gostaria de consultar os horários disponíveis para atendimento.',
      morningScheduleMessage:
        'Olá, Guilherme. Gostaria de consultar a disponibilidade de horários para atendimento no turno da manhã.',
      afternoonScheduleMessage:
        'Olá, Guilherme. Gostaria de consultar a disponibilidade de horários para atendimento no turno da tarde.',
    },

    // Modalidades confirmadas, por exemplo ['online'] ou ['online', 'presencial'].
    // Vazio = a página não afirma modalidade. Pendente: DEC-03.
    modalities: [],

    schedule: {
      // 'whatsapp-only': mostra somente a consulta de disponibilidade pelo WhatsApp.
      // 'manual-schedule': mostra os horários de `days`; exige responsável e rotina de atualização.
      // Pendente: DEC-02 e DEC-10.
      mode: 'whatsapp-only',
      // Fuso usado para esconder datas e horários que já passaram.
      timeZone: 'America/Bahia',
      // Usado somente em 'manual-schedule'. Datas no formato AAAA-MM-DD e horários no formato HH:MM.
      // Exemplo: [{ date: '2026-12-01', times: ['09:00', '14:30'] }]
      days: [],
    },
  };

  if (typeof module === 'object' && module.exports) module.exports = SITE_CONFIG;
  else root.SITE_CONFIG = SITE_CONFIG;
})(typeof self !== 'undefined' ? self : this);
