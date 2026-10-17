(() => {
  const main = document.querySelector('main');
  const sections = [...(main?.children || [])].filter(element => element.tagName === 'SECTION');
  const nav = document.getElementById('site-nav');
  const menuButton = document.querySelector('.menu-toggle');
  if (!main) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const overlay = document.createElement('div');
  overlay.className = 'section-overlay';
  overlay.hidden = true;
  overlay.setAttribute('aria-hidden', 'true');
  document.body.append(overlay);

  let activePanel = null;
  let activeParentSection = null;
  let parentWasClosed = false;
  let hiddenPanelSiblings = [];
  let lastTrigger = null;
  let closeButton = null;

  document.body.classList.add('velocitrak-shell-ready');
  sections.forEach(section => {
    if (!section.classList.contains('hero') && !section.classList.contains('intro') && !section.classList.contains('home-visible')) section.classList.add('shell-section-closed');
  });

  function owningSection(target) {
    return sections.find(section => section.contains(target)) || null;
  }

  function panelFor(target) {
    return target.closest('.tool-card, .own-card') || owningSection(target);
  }

  function isolatePanel(panel, parentSection) {
    let node = panel;
    while (node && node !== parentSection) {
      const parent = node.parentElement;
      if (!parent) break;
      [...parent.children].forEach(sibling => {
        if (sibling === node || sibling.classList.contains('section-modal-close')) return;
        sibling.classList.add('panel-sibling-hidden');
        hiddenPanelSiblings.push(sibling);
      });
      node = parent;
    }
  }

  function scrollToShowroom(target) {
    if (reducedMotion) {
      target.scrollIntoView({ block: 'center', behavior: 'auto' });
      return Promise.resolve();
    }
    const startY = (document.scrollingElement || document.documentElement).scrollTop;
    const offset = Math.min(88, Math.round(window.innerHeight * 0.09));
    const endY = Math.max(0, target.getBoundingClientRect().top + startY - offset);
    const distance = endY - startY;
    const duration = 430;
    const startTime = performance.now();
    return new Promise(resolve => {
      function step(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        (document.scrollingElement || document.documentElement).scrollTop = startY + distance * eased;
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  function closeMenu() {
    nav?.classList.remove('open');
    nav?.setAttribute('aria-hidden', 'true');
    nav?.setAttribute('inert', '');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Explore all sections');
  }

  function closePanel(restoreFocus = true) {
    if (!activePanel) return;
    const closing = activePanel;
    closing.classList.remove('section-modal-active');
    closing.classList.add('shell-section-closed');
    closing.removeAttribute('role');
    closing.removeAttribute('aria-modal');
    closing.removeAttribute('aria-label');
    closing.removeAttribute('tabindex');
    if (closeButton) closeButton.remove();
    closeButton = null;
    hiddenPanelSiblings.forEach(element => element.classList.remove('panel-sibling-hidden'));
    hiddenPanelSiblings = [];
    if (activeParentSection) {
      activeParentSection.classList.remove('section-panel-context');
      if (parentWasClosed) activeParentSection.classList.add('shell-section-closed');
      else activeParentSection.classList.remove('shell-section-closed');
    }
    activePanel = null;
    activeParentSection = null;
    const returnFocus = lastTrigger && !closing.contains(lastTrigger) ? lastTrigger : (menuButton || nav?.querySelector('a') || document.querySelector('.brand'));
    document.body.classList.remove('section-panel-open');
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function openPanel(target, trigger) {
    const panel = panelFor(target);
    const parentSection = owningSection(panel);
    if (!panel || !parentSection) return false;
    closeMenu();
    if (activePanel && activePanel !== panel) closePanel(false);
    lastTrigger = trigger || document.activeElement;

    if (activePanel === panel) {
      if (target !== panel) target.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
      else panel.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      return true;
    }

    activePanel = panel;
    activeParentSection = parentSection;
    parentWasClosed = parentSection.classList.contains('shell-section-closed');
    parentSection.classList.remove('shell-section-closed');
    if (panel !== parentSection) {
      parentSection.classList.add('section-panel-context');
      isolatePanel(panel, parentSection);
    }
    panel.classList.remove('shell-section-closed');
    panel.classList.add('section-modal-active');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('tabindex', '-1');
    const heading = panel.querySelector('h1, h2, h3');
    panel.setAttribute('aria-label', heading?.textContent.trim() || 'Autonexus feature');

    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'section-modal-close';
    closeButton.setAttribute('aria-label', 'Close feature panel');
    closeButton.innerHTML = '<span aria-hidden="true">×</span><span>Close</span>';
    closeButton.addEventListener('click', () => closePanel());
    panel.prepend(closeButton);

    document.body.classList.add('section-panel-open');
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    panel.scrollTop = 0;
    requestAnimationFrame(() => {
      if (activePanel !== panel) return;
      if (target !== panel) target.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
      else panel.scrollTo({ top: 0, behavior: 'auto' });
      closeButton?.focus({ preventScroll: true });
    });
    return true;
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = decodeURIComponent(link.getAttribute('href').slice(1));
    if (id === 'top') {
      event.preventDefault();
      closePanel(false);
      closeMenu();
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      document.querySelector('.hero')?.focus({ preventScroll: true });
      return;
    }
    const target = document.getElementById(id);
    if (link.hasAttribute('data-scroll-to-about') && target) {
      event.preventDefault();
      closePanel(false);
      closeMenu();
      target.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
      return;
    }
    if (!target || !owningSection(target)) return;
    if (link.hasAttribute('data-scroll-to-showroom')) {
      event.preventDefault();
      closePanel(false);
      closeMenu();
      scrollToShowroom(target).then(() => target.querySelector('.showroom-feature-tile')?.focus({ preventScroll: true }));
      return;
    }
    event.preventDefault();
    openPanel(target, link);
  });

  overlay.addEventListener('click', () => closePanel());
  window.addEventListener('autonexus:close-feature-panel', () => {
    closePanel(false);
    closeMenu();
  });
  if (menuButton) {
    menuButton.addEventListener('click', () => {
      queueMicrotask(() => {
        const isOpen = nav?.classList.contains('open') || false;
        menuButton.setAttribute('aria-label', isOpen ? 'Close section menu' : 'Explore all sections');
      });
    });
    document.addEventListener('click', event => {
      if (nav?.classList.contains('open') && !nav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (activePanel) {
        event.preventDefault();
        closePanel();
      } else if (nav?.classList.contains('open')) {
        event.preventDefault();
        closeMenu();
        menuButton?.focus({ preventScroll: true });
      }
      return;
    }
    if (!activePanel) return;
    if (event.key !== 'Tab') return;
    const focusable = [...activePanel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(element => element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      activePanel.focus();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  const revealItems = [...document.querySelectorAll('.scroll-reveal, .home-feature-card')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  if (location.hash.length > 1) {
    const initialTarget = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (initialTarget && owningSection(initialTarget)) openPanel(initialTarget, null);
  }
})();
