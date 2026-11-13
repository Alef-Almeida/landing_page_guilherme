// Contato pelo WhatsApp e agenda: configuração em site-config.js, lógica em contact.js.
// Em caso de falha, a página mantém o estado seguro do HTML (botões desativados, sem link externo).
try {
  window.ContactFlow.initContactFlow({
    document,
    config: window.SITE_CONFIG,
    hostname: window.location.hostname,
  });
} catch (error) {
  console.error('[contato] Não foi possível inicializar o contato pelo WhatsApp.', error);
}

const contactSection = document.getElementById('contato');
if (contactSection)
  contactSection.insertAdjacentHTML(
    'beforeend',
    `<div class="contact-steps mx-auto mt-8 grid max-w-6xl gap-3 sm:grid-cols-3"><div><span>01</span><strong>Conte o que você busca</strong><p>Uma mensagem simples já é um começo.</p></div><div><span>02</span><strong>Tire suas dúvidas</strong><p>Converse sobre o processo com tranquilidade.</p></div><div><span>03</span><strong>Encontre um horário</strong><p>A agenda é combinada pelo WhatsApp.</p></div></div>`,
  );

const aboutSection = document.getElementById('sobre');
if (aboutSection) {
  aboutSection.insertAdjacentHTML(
    'beforeend',
    `<div class="about-interactive mx-auto mt-14 max-w-6xl"><div class="about-tab-list" role="tablist" aria-label="Conheça o jeito de trabalhar"><button class="about-tab is-active" data-about-tab="escuta" role="tab" aria-selected="true">Escuta que considera</button><button class="about-tab" data-about-tab="processo" role="tab" aria-selected="false">Como acontece</button><button class="about-tab" data-about-tab="rede" role="tab" aria-selected="false">Cuidado em rede</button></div><div class="about-tab-content"><div class="about-tab-art"><img src="./assets/paper-boat-line.png" alt="Barquinho de papel em uma linha de ondas" /></div><div><span class="eyebrow">Um olhar para cada história</span><h3 id="about-tab-title">A escuta começa antes das respostas.</h3><p id="about-tab-text">Acolher é observar o que cada pessoa traz, sem reduzir sua experiência a um diagnóstico ou a uma única explicação.</p></div></div></div>`,
  );
  const aboutCopy = {
    escuta: {
      title: 'A escuta começa antes das respostas.',
      text: 'Acolher é observar o que cada pessoa traz, sem reduzir sua experiência a um diagnóstico ou a uma única explicação.',
    },
    processo: {
      title: 'O processo é construído em conjunto.',
      text: 'O acompanhamento respeita o tempo, os objetivos e os recursos de cada pessoa, com clareza sobre os próximos passos.',
    },
    rede: {
      title: 'Ninguém precisa cuidar sozinho.',
      text: 'Quando necessário, o trabalho conversa com família, escola e outros profissionais para ampliar as possibilidades de cuidado.',
    },
  };
  aboutSection.querySelectorAll('[data-about-tab]').forEach((tab) =>
    tab.addEventListener('click', () => {
      aboutSection.querySelectorAll('[data-about-tab]').forEach((item) => {
        item.classList.toggle('is-active', item === tab);
        item.setAttribute('aria-selected', item === tab ? 'true' : 'false');
      });
      document.getElementById('about-tab-title').textContent = aboutCopy[tab.dataset.aboutTab].title;
      document.getElementById('about-tab-text').textContent = aboutCopy[tab.dataset.aboutTab].text;
    }),
  );
}

const scrollBoat = document.getElementById('scroll-boat');
const wavePath = document.getElementById('brand-wave-path');
let targetProgress = 0;
let currentProgress = 0;
let boatFrame = null;

const renderBoat = (progress) => {
  const point = wavePath.getPointAtLength(progress * wavePath.getTotalLength());
  scrollBoat.setAttribute('transform', `translate(${point.x - 14} ${point.y - 10})`);
  scrollBoat.classList.toggle('boat-orange', progress <= 0.5);
  scrollBoat.classList.toggle('boat-blue', progress > 0.5);
};

const animateBoat = () => {
  currentProgress += (targetProgress - currentProgress) * 0.12;
  renderBoat(currentProgress);
  if (Math.abs(targetProgress - currentProgress) > 0.001) boatFrame = requestAnimationFrame(animateBoat);
  else boatFrame = null;
};

const updateBoatPosition = () => {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  targetProgress = Math.min(window.scrollY / maxScroll, 1);
  if (!boatFrame) boatFrame = requestAnimationFrame(animateBoat);
};
window.addEventListener('scroll', updateBoatPosition, { passive: true });
window.addEventListener('resize', updateBoatPosition);
renderBoat(0);

const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
menuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
mobileMenu
  .querySelectorAll('a')
  .forEach((link) => link.addEventListener('click', () => mobileMenu.classList.add('hidden')));

const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link');
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting)
        navLinks.forEach((link) =>
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`),
        );
    }),
  { rootMargin: '-35% 0px -55% 0px' },
);
sections.forEach((section) => observer.observe(section));

const pageTransition = document.querySelector('.page-transition');
const anchorLinks = document.querySelectorAll('a[href^="#"]');
let transitionTimer;
anchorLinks.forEach((link) =>
  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href');
    const target = selector && document.querySelector(selector);
    if (!target || link.hasAttribute('data-no-transition')) return;
    event.preventDefault();
    clearTimeout(transitionTimer);
    pageTransition.classList.add('is-visible');
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', selector);
    }, 180);
    transitionTimer = window.setTimeout(() => pageTransition.classList.remove('is-visible'), 620);
  }),
);

const heroCard = document.querySelector('.hero-card');
if (heroCard) {
  const instagramPosts = [
    './assets/instagram-01.jpeg',
    './assets/instagram-02.jpeg',
    './assets/instagram-03.jpeg',
    './assets/instagram-04.jpeg',
    './assets/instagram-05.jpeg',
    './assets/instagram-06.jpeg',
    './assets/instagram-07.jpeg',
    './assets/instagram-08.jpeg',
    './assets/instagram-09.jpeg',
  ];
  heroCard.classList.add('instagram-card');
  heroCard.innerHTML = `<div class="instagram-shell"><div class="instagram-post"><div class="instagram-top"><span class="instagram-user"><span class="instagram-avatar">GT</span>guilhermes_tx</span><svg class="instagram-mark" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"></circle></svg></div>${instagramPosts.map((src, index) => `<img src="${src}" alt="Post do Instagram de Guilherme Teixeira ${index + 1}" class="${index === 0 ? 'is-active' : ''}" data-instagram-slide="${index}">`).join('')}</div><div class="instagram-actions"><div class="instagram-actions-left"><svg class="instagram-action" viewBox="0 0 24 24" aria-label="Curtir"><path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"></path></svg><svg class="instagram-action" viewBox="0 0 24 24" aria-label="Comentar"><path d="M20 11.2a7.8 7.8 0 0 1-8 7.5 8.8 8.8 0 0 1-3.1-.6L4 20l1.4-4.1A7.4 7.4 0 0 1 4 11.2a7.8 7.8 0 0 1 8-7.5 7.8 7.8 0 0 1 8 7.5Z"></path></svg><svg class="instagram-action" viewBox="0 0 24 24" aria-label="Compartilhar"><path d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Z"></path><path d="m10.5 13.5 4.2-4.2"></path></svg></div><svg class="instagram-action" viewBox="0 0 24 24" aria-label="Salvar"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21l-7-4-7 4V4.5Z"></path></svg></div><div class="instagram-dots" role="tablist" aria-label="Posts do Instagram">${instagramPosts.map((_, index) => `<button type="button" class="${index === 0 ? 'is-active' : ''}" data-instagram-dot="${index}" aria-label="Ver post ${index + 1}"></button>`).join('')}</div><span class="ig-float ig-float-one" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"></circle></svg></span><span class="ig-float ig-float-two" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M20.8 8.8c0 5.4-8.8 10.2-8.8 10.2S3.2 14.2 3.2 8.8A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"></path></svg></span><span class="ig-float ig-float-three" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m21 3-7.2 18-3.3-7.5L3 10.2 21 3Z"></path></svg></span></div>`;
  heroCard.querySelector('.instagram-top')?.remove();
  const slides = [...heroCard.querySelectorAll('[data-instagram-slide]')];
  const dots = [...heroCard.querySelectorAll('[data-instagram-dot]')];
  let activePost = 0;
  let postTimer;
  const showPost = (index) => {
    activePost = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activePost));
    dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === activePost));
  };
  const restartPostTimer = () => {
    clearInterval(postTimer);
    postTimer = window.setInterval(() => showPost(activePost + 1), 4800);
  };
  dots.forEach((dot) =>
    dot.addEventListener('click', () => {
      showPost(Number(dot.dataset.instagramDot));
      restartPostTimer();
    }),
  );
  heroCard.addEventListener('mouseenter', () => clearInterval(postTimer));
  heroCard.addEventListener('mouseleave', restartPostTimer);
  restartPostTimer();
}

const portraitPlaceholder = document.querySelector('.portrait-placeholder');
if (portraitPlaceholder) {
  const guilhermePhotos = ['./assets/guilherme-photo-01.jpeg', './assets/guilherme-photo-02.jpeg'];
  portraitPlaceholder.outerHTML = `<div class="portrait-carousel" aria-label="Fotos de Guilherme Teixeira">${guilhermePhotos.map((src, index) => `<img src="${src}" alt="Guilherme Teixeira em atendimento clínico" class="${index === 0 ? 'is-active' : ''}" data-portrait-slide="${index}">`).join('')}<span class="portrait-carousel-label">Guilherme Teixeira</span></div>`;
  const portraitSlides = [...document.querySelectorAll('[data-portrait-slide]')];
  let portraitIndex = 0;
  window.setInterval(() => {
    portraitIndex = (portraitIndex + 1) % portraitSlides.length;
    portraitSlides.forEach((slide, index) => slide.classList.toggle('is-active', index === portraitIndex));
  }, 5600);
}
