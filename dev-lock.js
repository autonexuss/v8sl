/*
 * Temporary preview gate. Remove the marked gate block, dev-lock.css link,
 * and this script include from index.html to restore direct public access.
 * This client-side gate is for a temporary preview, not security.
 */
(() => {
  const gate = document.getElementById('dev-gate');
  const form = document.getElementById('dev-gate-form');
  const input = document.getElementById('dev-gate-code');
  const status = document.getElementById('dev-gate-status');

  if (!gate || !form || !input || !status) return;

  const allowedCodes = new Set([
    'crucialmemberdaddy',
    'crucialmembergupta',
    'crucialmembergoel',
    'crucialmembertanisha',
    'crucialmemberarnav'
  ]);
  const sessionKey = 'velocitrak-developer-preview-unlocked';
  const protectedElements = [...document.body.children].filter(element => element !== gate);
  const originalStates = protectedElements.map(element => ({
    element,
    inert: element.inert,
    ariaHidden: element.getAttribute('aria-hidden')
  }));
  const originalOverflow = document.body.style.overflow;

  function lockPage() {
    document.body.style.overflow = 'hidden';
    originalStates.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute('aria-hidden', 'true');
    });
    gate.hidden = false;
    input.focus({ preventScroll: true });
  }

  function unlockPage() {
    gate.hidden = true;
    document.body.style.overflow = originalOverflow;
    originalStates.forEach(({ element, inert, ariaHidden }) => {
      element.inert = inert;
      if (ariaHidden === null) element.removeAttribute('aria-hidden');
      else element.setAttribute('aria-hidden', ariaHidden);
    });
  }

  try {
    if (sessionStorage.getItem(sessionKey) === 'yes') {
      unlockPage();
      return;
    }
  } catch {
    // If browser storage is disabled, the visitor can still unlock this page.
  }

  lockPage();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const code = input.value.trim();

    if (!allowedCodes.has(code)) {
      input.setAttribute('aria-invalid', 'true');
      status.textContent = 'That code did not match. Please try again.';
      input.select();
      return;
    }

    input.removeAttribute('aria-invalid');
    status.textContent = '';
    try {
      sessionStorage.setItem(sessionKey, 'yes');
    } catch {
      // Continue for this page view even when browser storage is unavailable.
    }
    unlockPage();
  });

  gate.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...gate.querySelectorAll('input:not(:disabled), button:not(:disabled)')];
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
})();
