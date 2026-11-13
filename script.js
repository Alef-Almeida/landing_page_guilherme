// Comportamentos da página. Todo o conteúdo já existe no HTML: este arquivo só acrescenta interação
// (melhoria progressiva). Sem JavaScript, os controles que dependem dele ficam ocultos.

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

// ---------------------------------------------------------------------------
// Abas da seção "Sobre"
// ---------------------------------------------------------------------------
const aboutTabList = document.querySelector('[data-about-tablist]');
if (aboutTabList) {
  const tabs = [...aboutTabList.querySelectorAll('[data-about-tab]')];
  const panels = tabs.map((tab) => document.querySelector(`[data-about-panel="${tab.dataset.aboutTab}"]`));
  aboutTabList.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
  });
  const selectTab = (selected) => {
    tabs.forEach((tab, index) => {
      const isSelected = tab === selected;
      tab.classList.toggle('is-active', isSelected);
      tab.setAttribute('aria-selected', String(isSelected));
      panels[index].hidden = !isSelected;
    });
  };
  tabs.forEach((tab) => tab.addEventListener('click', () => selectTab(tab)));
  selectTab(tabs[0]);
  aboutTabList.hidden = false;
}

// ---------------------------------------------------------------------------
// Barco que acompanha a rolagem (decorativo)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Menu mobile (padrão disclosure)
// ---------------------------------------------------------------------------
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const setMenuOpen = (open, { returnFocus = false } = {}) => {
  mobileMenu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  if (!open && returnFocus) menuToggle.focus();
};
menuToggle.addEventListener('click', () => setMenuOpen(mobileMenu.hidden));
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenuOpen(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !mobileMenu.hidden) setMenuOpen(false, { returnFocus: true });
});
document.addEventListener('click', (event) => {
  if (!mobileMenu.hidden && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target))
    setMenuOpen(false);
});
menuToggle.hidden = false;

// ---------------------------------------------------------------------------
// Seção ativa na navegação (classe visual + aria-current)
// ---------------------------------------------------------------------------
const sections = document.querySelectorAll('main section[id]');
const sectionLinks = document.querySelectorAll('.nav-link, #mobile-menu a');
const markCurrentSection = (id) =>
  sectionLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('active', isCurrent && link.classList.contains('nav-link'));
    if (isCurrent) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
const observer = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) markCurrentSection(entry.target.id);
    }),
  { rootMargin: '-35% 0px -55% 0px' },
);
sections.forEach((section) => observer.observe(section));

// ---------------------------------------------------------------------------
// Navegação interna
// O navegador cuida da rolagem, do foco, do histórico e de Voltar/Avançar (âncoras nativas,
// com compensação do cabeçalho via scroll-padding-top). A transição é só decorativa e não
// bloqueia nem atrasa a navegação.
// ---------------------------------------------------------------------------
const pageTransition = document.querySelector('.page-transition');
let transitionTimer;
document.querySelectorAll('a[href^="#"]').forEach((link) =>
  link.addEventListener('click', () => {
    const selector = link.getAttribute('href');
    if (selector.length < 2 || !document.querySelector(selector) || link.hasAttribute('data-no-transition')) return;
    clearTimeout(transitionTimer);
    pageTransition.classList.add('is-visible');
    transitionTimer = window.setTimeout(() => pageTransition.classList.remove('is-visible'), 620);
  }),
);

// ---------------------------------------------------------------------------
// Carrossel de posts do Instagram
// ---------------------------------------------------------------------------
const instagramCard = document.querySelector('.instagram-card');
if (instagramCard) {
  const slides = [...instagramCard.querySelectorAll('[data-instagram-slide]')];
  const dotsContainer = instagramCard.querySelector('[data-instagram-dots]');
  const dots = [...instagramCard.querySelectorAll('[data-instagram-dot]')];
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
  instagramCard.addEventListener('mouseenter', () => clearInterval(postTimer));
  instagramCard.addEventListener('mouseleave', restartPostTimer);
  if (dotsContainer) dotsContainer.hidden = false;
  restartPostTimer();
}

// ---------------------------------------------------------------------------
// Carrossel de fotos
// ---------------------------------------------------------------------------
const portraitSlides = [...document.querySelectorAll('[data-portrait-slide]')];
if (portraitSlides.length > 1) {
  let portraitIndex = 0;
  window.setInterval(() => {
    portraitIndex = (portraitIndex + 1) % portraitSlides.length;
    portraitSlides.forEach((slide, index) => slide.classList.toggle('is-active', index === portraitIndex));
  }, 5600);
}
