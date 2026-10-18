(() => {
  const dialog = document.getElementById('pro-access-dialog');
  const form = document.getElementById('pro-access-form');
  const input = document.getElementById('pro-access-code');
  const status = document.getElementById('pro-access-status');
  const checkoutButton = document.getElementById('pro-checkout-button');
  const checkoutStatus = document.getElementById('pro-checkout-status');
  if (!dialog || !form || !input || !status || !checkoutButton || !checkoutStatus) return;

  let pendingLink = null;

  function isPreviewUnlocked() {
    try { return sessionStorage.getItem('autonexus-pro-preview-unlocked') === '1'; }
    catch { return false; }
  }

  function openAccess(link) {
    pendingLink = link;
    input.value = '';
    status.textContent = '';
    checkoutStatus.textContent = 'Secure checkout is not connected yet. No payment will be taken.';
    if (!dialog.open) dialog.showModal();
    requestAnimationFrame(() => checkoutButton.focus({ preventScroll: true }));
  }

  document.addEventListener('click', event => {
    const target = event.target;
    const link = target instanceof Element ? target.closest('.premium-feature-grid a[href^="#"], .glass-nav-group--pro a[href^="#"]') : null;
    if (!link || isPreviewUnlocked()) return;
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
    try { sessionStorage.setItem('autonexus-pro-preview-unlocked', '1'); }
    catch { status.textContent = 'This browser could not save preview access. Allow session storage and try again.'; return; }
    const linkToOpen = pendingLink;
    status.textContent = 'Developer preview unlocked for this tab.';
    dialog.close('unlocked');
    if (linkToOpen?.isConnected) requestAnimationFrame(() => linkToOpen.click());
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close('backdrop');
  });
})();
