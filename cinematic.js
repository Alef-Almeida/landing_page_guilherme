/* Motion is an enhancement: native navigation, content and contact work without it. */
(() => {
  'use strict';
  const root = document.documentElement;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const header = document.querySelector('.site-header');
  const compactNav = document.querySelector('.scroll-nav');
  let previousY = scrollY;
  let directionDistance = 0;
  let headerPinnedUntil = 0;
  function setCompact(compact) {
    root.classList.toggle('nav-condensed', compact);
    if (header) header.inert = compact;
    if (compactNav) compactNav.inert = !compact;
  }
  function showHeader() {
    setCompact(false);
    directionDistance = 0;
    headerPinnedUntil = performance.now() + 900;
  }
  function updateNavigation() {
    if (!compactNav || !header) return;
    const delta = scrollY - previousY;
    previousY = scrollY;
    const protectedState = header.querySelector(':focus-visible, [aria-expanded="true"]');
    if (scrollY < 160 || protectedState || performance.now() < headerPinnedUntil) {
      setCompact(false);
      directionDistance = 0;
      return;
    }
    if (Math.sign(delta) !== Math.sign(directionDistance)) directionDistance = 0;
    directionDistance += delta;
    if (directionDistance > 36) setCompact(true);
    else if (directionDistance < -18) setCompact(false);
  }
  const hero = document.querySelector('.hero-vessel');
  const path = document.getElementById('journey-path');
  const progressPath = document.getElementById('journey-progress');
  const boat = document.getElementById('journey-boat');
  const journey = document.querySelector('.journey-section');
  const manifesto = document.querySelector('[data-manifesto]');
  const words = manifesto ? [...manifesto.querySelectorAll('[data-word]')] : [];
  const abort = new AbortController();
  const signal = abort.signal;
  // One shared sun sits above the shift cards; links keep their native behavior.
  const sunScene = document.querySelector('.schedule-sun-scene');
  if (sunScene) {
    let pointerPhase = null;
    let focusPhase = null;
    const orbit = sunScene.querySelector('.schedule-sun-orbit');
    let sunProgress = 0.08;
    let sunAnimation = null;
    let sunFrom = sunProgress;
    let sunTo = sunProgress;
    const sunTransform = (progress) => {
      const x = 110 + 260 * progress;
      const y = 124 - 86 * Math.sin(Math.PI * progress);
      return `translate3d(${x - 240}px, ${y - 54}px, 0)`;
    };
    const stopSun = () => {
      if (!sunAnimation) return;
      const progress = sunAnimation.effect.getComputedTiming().progress ?? 0;
      sunProgress = sunFrom + (sunTo - sunFrom) * progress;
      orbit.style.transform = sunTransform(sunProgress);
      sunAnimation.cancel();
      sunAnimation = null;
    };
    const moveSun = (target) => {
      if (!orbit || (target === sunTo && (sunAnimation || Math.abs(sunProgress - target) < 0.0001))) return;
      stopSun();
      sunFrom = sunProgress;
      sunTo = target;
      if (preference.matches || root.classList.contains('a11y-pausar')) {
        sunProgress = target;
        orbit.style.transform = sunTransform(target);
        return;
      }
      const frames = Array.from({ length: 33 }, (_, index) => ({
        transform: sunTransform(sunFrom + ((target - sunFrom) * index) / 32),
      }));
      sunAnimation = orbit.animate(frames, {
        duration: 1600,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'both',
      });
      sunAnimation.onfinish = () => {
        sunProgress = target;
        orbit.style.transform = sunTransform(target);
        sunAnimation?.cancel();
        sunAnimation = null;
      };
    };
    if (orbit) orbit.style.transform = sunTransform(sunProgress);
    const renderSun = () => {
      const phase = pointerPhase ?? focusPhase ?? 'idle';
      sunScene.dataset.sunPhase = phase;
      // Leaving a button keeps the last position instead of throwing the sun back down.
      if (phase === 'morning') moveSun(0.5);
      else if (phase === 'afternoon') moveSun(1);
    };
    const pauseSun = () => {
      if (!preference.matches && !root.classList.contains('a11y-pausar')) return;
      stopSun();
      sunProgress = sunTo;
      if (orbit) orbit.style.transform = sunTransform(sunProgress);
    };
    preference.addEventListener('change', pauseSun, { signal });
    const sunPreferences = new MutationObserver(pauseSun);
    sunPreferences.observe(root, { attributes: true, attributeFilter: ['class'] });
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.hidden) stopSun();
      },
      { signal },
    );
    window.addEventListener('pagehide', stopSun, { signal });
    document.querySelectorAll('#agenda [data-whatsapp-shift]').forEach((button) => {
      const phase = button.dataset.whatsappShift;
      button.addEventListener(
        'pointerenter',
        (event) => {
          if (event.pointerType === 'touch') return;
          pointerPhase = phase;
          renderSun();
        },
        { passive: true, signal },
      );
      button.addEventListener(
        'pointerleave',
        () => {
          pointerPhase = null;
          renderSun();
        },
        { passive: true, signal },
      );
      button.addEventListener(
        'focus',
        () => {
          focusPhase = phase;
          renderSun();
        },
        { signal },
      );
      button.addEventListener(
        'blur',
        () => {
          focusPhase = null;
          renderSun();
        },
        { signal },
      );
    });
  }
  let frame = 0;
  let scrollTarget = null;
  let inertiaPosition = 0;
  let lastTime = 0;
  let geometry = {};
  let maxScroll = 1;
  let pathLength = path?.getTotalLength() || 0;
  const clamp = (value) => Math.max(0, Math.min(1, value));
  const paused = () => preference.matches || root.classList.contains('a11y-pausar');

  function measure() {
    maxScroll = Math.max(1, root.scrollHeight - innerHeight);
    geometry = {};
    for (const [name, element] of [
      ['journey', journey],
      ['manifesto', manifesto],
    ]) {
      if (!element) continue;
      const rect = element.getBoundingClientRect();
      geometry[name] = { top: rect.top + scrollY, height: rect.height };
    }
    pathLength = path?.getTotalLength() || 0;
    if (progressPath) {
      progressPath.style.strokeDasharray = String(pathLength);
    }
    schedule();
  }

  function paint(time) {
    frame = 0;
    if (scrollTarget !== null && !paused()) {
      const dt = Math.min(time - (lastTime || time - 16), 48);
      const next = inertiaPosition + (scrollTarget - inertiaPosition) * (1 - Math.exp(-dt / 115));
      inertiaPosition = next;
      if (Math.abs(scrollTarget - next) < 0.5) {
        window.scrollTo({ top: scrollTarget, behavior: 'instant' });
        scrollTarget = null;
      } else {
        window.scrollTo({ top: next, behavior: 'instant' });
      }
    }
    lastTime = time;
    updateNavigation();
    header?.classList.toggle('is-scrolled', scrollY > 40);
    header?.style.setProperty('--reading-progress', String(clamp(scrollY / maxScroll)));
    hero?.style.setProperty('--scroll-depth', paused() ? '0px' : `${Math.min(scrollY, innerHeight) * -0.06}px`);
    if (geometry.journey && path && boat) {
      const g = geometry.journey;
      const p = paused() ? 1 : clamp((scrollY + innerHeight * 0.7 - g.top) / (g.height * 0.85));
      const point = path.getPointAtLength(p * pathLength);
      const ahead = path.getPointAtLength(Math.min(pathLength, p * pathLength + 1));
      const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
      boat.setAttribute('transform', `translate(${point.x} ${point.y}) rotate(${Math.max(-12, Math.min(12, angle))})`);
      if (progressPath) progressPath.style.strokeDashoffset = String(pathLength * (1 - p));
    }
    if (geometry.manifesto && words.length) {
      const g = geometry.manifesto;
      const p = paused() ? 1 : clamp((scrollY + innerHeight * 0.85 - g.top) / (innerHeight * 0.65 + g.height * 0.4));
      words.forEach((word, i) => {
        word.style.opacity = p * (words.length + 3) >= i ? '1' : '0.65';
      });
    }
    if (scrollTarget !== null) schedule();
  }

  function schedule() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(paint);
  }

  function cancelInertia() {
    scrollTarget = null;
  }

  function syncPreference() {
    cancelInertia();
    root.classList.toggle('cinema-motion', !paused());
    if (paused()) {
      document.querySelectorAll('.cinema-reveal').forEach((el) => el.classList.add('is-visible'));
      hero?.style.removeProperty('--pointer-x');
      hero?.style.removeProperty('--pointer-y');
      document.querySelectorAll('[data-magnetic]').forEach((el) => el.style.removeProperty('transform'));
    }
    schedule();
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add('is-visible');
        observer.unobserve(target);
      });
    },
    { threshold: 0.08 },
  );
  document
    .querySelectorAll(
      '.cinema-reveal, .service-card, .journey-step, main > section > div > .section-title, .content-card, .about-interactive',
    )
    .forEach((el, i) => {
      el.classList.add('cinema-reveal');
      el.style.setProperty('--reveal-delay', `${(i % 3) * 90}ms`);
      observer.observe(el);
    });

  window.addEventListener('scroll', schedule, { passive: true, signal });
  if (compactNav) {
    compactNav.hidden = false;
    compactNav.querySelector('button')?.addEventListener(
      'click',
      () => {
        showHeader();
        // Visibility can still be transitioning when this button hides itself.
        const restoreFocus = () => {
          if (!root.classList.contains('nav-condensed') && document.activeElement === document.body) {
            header?.querySelector('a')?.focus({ preventScroll: true });
          }
        };
        requestAnimationFrame(restoreFocus);
        setTimeout(restoreFocus, paused() ? 0 : 550);
      },
      { signal },
    );
    compactNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', showHeader, { signal }));
  }
  header?.addEventListener('focusin', showHeader, { signal });
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Tab' && !compactNav?.contains(document.activeElement)) showHeader();
    },
    { capture: true, signal },
  );
  window.addEventListener('resize', measure, { passive: true, signal });
  window.addEventListener(
    'wheel',
    (event) => {
      if (
        paused() ||
        !finePointer.matches ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      )
        return;
      // Let independently scrollable regions and browser zoom keep their native behavior.
      let element = event.target instanceof Element ? event.target : null;
      while (element && element !== document.body) {
        if (
          element.matches('input, textarea, select, [role="dialog"], .a11y-panel') ||
          (element.scrollHeight > element.clientHeight + 1 && /auto|scroll/.test(getComputedStyle(element).overflowY))
        )
          return;
        element = element.parentElement;
      }
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
      if (!delta) return;
      const target = Math.max(0, Math.min(maxScroll, (scrollTarget ?? scrollY) + delta));
      if (target === scrollY && scrollTarget === null) return;
      event.preventDefault();
      if (scrollTarget === null) inertiaPosition = scrollY;
      scrollTarget = target;
      schedule();
    },
    { passive: false, signal },
  );
  window.addEventListener('keydown', cancelInertia, { signal });
  window.addEventListener('pointerdown', cancelInertia, { passive: true, signal });
  window.addEventListener('hashchange', cancelInertia, { signal });
  document.addEventListener(
    'visibilitychange',
    () => {
      cancelInertia();
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else measure();
    },
    { signal },
  );

  document.querySelectorAll('.service-card, [data-magnetic], .hero-section').forEach((el) => {
    let rect;
    el.addEventListener(
      'pointerenter',
      () => {
        rect = el.getBoundingClientRect();
      },
      { passive: true, signal },
    );
    el.addEventListener(
      'pointermove',
      (event) => {
        if (paused() || !finePointer.matches || !rect) return;
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (el.matches('.service-card')) {
          el.style.setProperty('--spot-x', `${x}px`);
          el.style.setProperty('--spot-y', `${y}px`);
        } else if (el.hasAttribute('data-magnetic')) {
          el.style.transform = `translate(${(x / rect.width - 0.5) * 8}px, ${(y / rect.height - 0.5) * 8}px)`;
        } else {
          hero?.style.setProperty('--pointer-x', `${(x / rect.width - 0.5) * 16}px`);
          hero?.style.setProperty('--pointer-y', `${(y / rect.height - 0.5) * 12}px`);
        }
      },
      { passive: true, signal },
    );
    el.addEventListener(
      'pointerleave',
      () => {
        rect = null;
        if (el.hasAttribute('data-magnetic')) el.style.removeProperty('transform');
        hero?.style.setProperty('--pointer-x', '0px');
        hero?.style.setProperty('--pointer-y', '0px');
      },
      { passive: true, signal },
    );
  });

  let wasPaused = paused();
  const pauseObserver = new MutationObserver(() => {
    if (wasPaused === paused()) return;
    wasPaused = paused();
    syncPreference();
  });
  pauseObserver.observe(root, { attributes: true, attributeFilter: ['class'] });
  preference.addEventListener('change', syncPreference, { signal });
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(document.body);
  syncPreference();
  measure();
  document.fonts.ready.then(measure);
  // pagehide also runs for the back-forward cache: pageshow restores a fresh setup by reload-free measurements.
  window.addEventListener(
    'pagehide',
    () => {
      cancelInertia();
      cancelAnimationFrame(frame);
      frame = 0;
    },
    { signal },
  );
  window.addEventListener('pageshow', measure, { signal });
})();
