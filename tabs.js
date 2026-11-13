/*
 * Abas acessíveis no padrão WAI-ARIA (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
 *
 * - role="tablist"/"tab", aria-selected e tabindex gerenciado (só a aba selecionada entra no Tab);
 * - Seta esquerda/direita, Home e End movem o foco e selecionam (ativação automática);
 * - quem chama decide o que mostrar em `onSelect(index)`.
 *
 * Carregado como script clássico (window.Tabs).
 */
(function (root) {
  'use strict';

  function setupTabs({ tablist, tabs, label, onSelect, initial = 0 }) {
    tablist.setAttribute('role', 'tablist');
    if (label) tablist.setAttribute('aria-label', label);
    let current = -1;

    const select = (index, { focus = false } = {}) => {
      const next = (index + tabs.length) % tabs.length;
      tabs.forEach((tab, i) => {
        const selected = i === next;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        tab.classList.toggle('is-active', selected);
      });
      if (focus) tabs[next].focus();
      if (next !== current) {
        current = next;
        onSelect(next);
      }
    };

    tabs.forEach((tab, index) => {
      tab.setAttribute('role', 'tab');
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', (event) => {
        const targets = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
        if (!(event.key in targets)) return;
        event.preventDefault();
        select(targets[event.key], { focus: true });
      });
    });

    select(initial);
    return {
      select,
      get current() {
        return current;
      },
    };
  }

  const api = { setupTabs };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Tabs = api;
})(typeof self !== 'undefined' ? self : this);
