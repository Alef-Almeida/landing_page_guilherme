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
  tabs.forEach((tab, index) => {
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
  });
  window.Tabs.setupTabs({
    tablist: aboutTabList,
    tabs,
    onSelect: (selected) => panels.forEach((panel, index) => (panel.hidden = index !== selected)),
  });
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

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const updateBoatPosition = () => {
  const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  targetProgress = Math.min(window.scrollY / maxScroll, 1);
  // Com movimento reduzido, o barco vai direto à posição, sem animação de acompanhamento.
  if (reducedMotion.matches) {
    currentProgress = targetProgress;
    renderBoat(currentProgress);
    return;
  }
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
// Navegação interna: âncoras nativas (rolagem, foco, histórico e Voltar/Avançar ficam com o
// navegador; scroll-padding-top compensa o cabeçalho). Não há transição de tela cheia (IMP-336).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Carrosséis (IMP-330 a IMP-335)
// - só o slide ativo fica exposto à tecnologia assistiva (aria-hidden nos demais);
// - Anterior, Próximo e Pausar/Retomar; usar Anterior/Próximo interrompe a rotação;
// - a rotação pausa com o ponteiro sobre o carrossel ou com o foco dentro dele;
// - com prefers-reduced-motion, a rotação começa pausada;
// - aria-live fica "off" durante a rotação e "polite" quando pausado, como no padrão WAI-ARIA.
// ---------------------------------------------------------------------------
const setupCarousel = (root) => {
  const track = root.querySelector('[data-carousel-track]');
  const slides = [...track.children];
  const indicators = [...root.querySelectorAll('.instagram-dots > span')];
  const toggle = root.querySelector('[data-carousel-toggle]');
  const controls = root.querySelector('[data-carousel-controls]');
  const interval = Number(root.dataset.carouselInterval) || 5000;
  const pauseLabel = toggle.getAttribute('aria-label');
  const playLabel = pauseLabel.replace('Pausar', 'Retomar');
  let active = Math.max(
    slides.findIndex((slide) => slide.classList.contains('is-active')),
    0,
  );
  let timer = null;
  let userPaused = reducedMotion.matches;
  let hovered = false;
  let focused = false;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === active);
      if (i === active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
    });
    indicators.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
  };

  const update = () => {
    const running = !userPaused && !hovered && !focused;
    clearInterval(timer);
    timer = running ? window.setInterval(() => show(active + 1), interval) : null;
    track.setAttribute('aria-live', running ? 'off' : 'polite');
    toggle.setAttribute('aria-label', userPaused ? playLabel : pauseLabel);
    toggle.classList.toggle('is-paused', userPaused);
  };

  const step = (delta) => {
    userPaused = true;
    show(active + delta);
    update();
  };

  root.querySelector('[data-carousel-prev]')?.addEventListener('click', () => step(-1));
  root.querySelector('[data-carousel-next]')?.addEventListener('click', () => step(1));
  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    update();
  });
  root.addEventListener('mouseenter', () => {
    hovered = true;
    update();
  });
  root.addEventListener('mouseleave', () => {
    hovered = false;
    update();
  });
  root.addEventListener('focusin', () => {
    focused = true;
    update();
  });
  root.addEventListener('focusout', (event) => {
    if (root.contains(event.relatedTarget)) return;
    focused = false;
    update();
  });
  reducedMotion.addEventListener('change', (event) => {
    if (event.matches) userPaused = true;
    update();
  });

  show(active);
  if (controls) controls.hidden = false;
  toggle.hidden = false;
  update();
};

document.querySelectorAll('[data-carousel]').forEach(setupCarousel);
