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

  let activeSection = null;
  let lastTrigger = null;
  let closeButton = null;

  document.body.classList.add('velocitrak-shell-ready');
  sections.forEach(section => {
    if (!section.classList.contains('hero') && !section.classList.contains('intro') && !section.classList.contains('home-visible')) section.classList.add('shell-section-closed');
  });

  function owningSection(target) {
    return sections.find(section => section.contains(target)) || null;
  }

  function closeMenu() {
    nav?.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Explore all sections');
  }

  function closePanel(restoreFocus = true) {
    if (!activeSection) return;
    const closing = activeSection;
    closing.classList.remove('section-modal-active');
    closing.classList.add('shell-section-closed');
    closing.removeAttribute('role');
    closing.removeAttribute('aria-modal');
    closing.removeAttribute('aria-label');
    closing.removeAttribute('tabindex');
    if (closeButton) closeButton.remove();
    closeButton = null;
    activeSection = null;
    const returnFocus = lastTrigger && !closing.contains(lastTrigger) ? lastTrigger : (menuButton || nav?.querySelector('a') || document.querySelector('.brand'));
    document.body.classList.remove('section-panel-open');
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  }

  function openPanel(target, trigger) {
    const section = owningSection(target);
    if (!section) return false;
    closeMenu();
    if (activeSection && activeSection !== section) closePanel(false);
    lastTrigger = trigger || document.activeElement;

    if (activeSection === section) {
      if (target !== section) target.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
      else section.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      return true;
    }

    activeSection = section;
    section.classList.remove('shell-section-closed');
    section.classList.add('section-modal-active');
    section.setAttribute('role', 'dialog');
    section.setAttribute('aria-modal', 'true');
    section.setAttribute('tabindex', '-1');
    const heading = section.querySelector('h1, h2, h3');
    section.setAttribute('aria-label', heading?.textContent.trim() || 'Velocitrak feature');

    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'section-modal-close';
    closeButton.setAttribute('aria-label', 'Close feature panel');
    closeButton.innerHTML = '<span aria-hidden="true">×</span><span>Close</span>';
    closeButton.addEventListener('click', () => closePanel());
    section.prepend(closeButton);

    document.body.classList.add('section-panel-open');
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    section.scrollTop = 0;
    requestAnimationFrame(() => {
      if (activeSection !== section) return;
      if (target !== section) target.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
      else section.scrollTo({ top: 0, behavior: 'auto' });
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
    if (!target || !owningSection(target)) return;
    event.preventDefault();
    openPanel(target, link);
  });

  overlay.addEventListener('click', () => closePanel());
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
    if (!activeSection) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closePanel();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...activeSection.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter(element => element.getClientRects().length > 0);
    if (!focusable.length) {
      event.preventDefault();
      activeSection.focus();
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
