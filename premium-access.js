(() => {
  const dialog = document.getElementById('pro-access-dialog');
  const form = document.getElementById('pro-access-form');
  const input = document.getElementById('pro-access-code');
  const status = document.getElementById('pro-access-status');
  const checkoutButton = document.getElementById('pro-checkout-button');
  const checkoutStatus = document.getElementById('pro-checkout-status');
  if (!dialog || !form || !input || !status || !checkoutButton || !checkoutStatus) return;

  const sessionKey = 'autonexus-pro-session-unlocked-v1';
  let unlockedForThisPage = false;
  let pendingLink = null;

  function hasSessionAccess() {
    if (unlockedForThisPage) return true;
    try { return sessionStorage.getItem(sessionKey) === '1'; }
    catch { return false; }
  }

  function openAccess(link) {
    pendingLink = link;
    input.value = '';
    status.textContent = '';
    checkoutStatus.textContent = 'Secure checkout is not connected yet. No payment will be taken.';
    try {
      if (dialog.open && !dialog.matches(':modal')) dialog.close();
      if (!dialog.open) dialog.showModal();
    } catch {
      dialog.setAttribute('open', '');
    }
    window.AutonexusAccount?.prepare();
    requestAnimationFrame(() => checkoutButton.focus({ preventScroll: true }));
  }

  document.addEventListener('click', event => {
    const target = event.target;
    const link = target instanceof Element
      ? target.closest('#premium-features a[href^="#"], .premium-feature-grid a[href^="#"], .glass-nav-group--pro a[href^="#"]')
      : null;
    if (!link || link.hash === '#service-report' || hasSessionAccess()) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    openAccess(link);
  }, true);

  checkoutButton.addEventListener('click', () => {
    checkoutStatus.textContent = 'Secure payment is not configured yet. No charge was made; contact the site owner to activate checkout.';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (input.value.trim().toLowerCase() !== 'innotech') {
      status.textContent = 'That code was not recognized. Check it and try again.';
      input.focus();
      return;
    }
    try { sessionStorage.setItem(sessionKey, '1'); }
    catch { unlockedForThisPage = true; }
    const linkToOpen = pendingLink;
    pendingLink = null;
    dialog.close('unlocked');
    status.textContent = '';
    if (linkToOpen?.isConnected) requestAnimationFrame(() => linkToOpen.click());
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close('backdrop');
  });
})();

