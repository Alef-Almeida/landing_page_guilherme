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
      // Domínios em que o link do WhatsApp fica ativo, por exemplo ['www.dominio.com.br', 'dominio.com.br'].
      // Em qualquer outro endereço (localhost, homologação, testes) o link fica desativado para não enviar
      // mensagens reais. Pendente: DEC-04 (domínio e hospedagem).
      productionHosts: [],
    },

    whatsapp: {
      // Número profissional com DDI 55 e DDD, por exemplo '5571912345678'. Pontuação é ignorada.
      // Vazio = contato indisponível. Pendente: DEC-01.
      number: '',
      initialMessage: 'Olá, Guilherme. Gostaria de saber mais sobre o acompanhamento psicológico.',
      scheduleMessage: 'Olá, Guilherme. Gostaria de consultar os horários disponíveis para atendimento.',
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
