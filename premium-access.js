(() => {
  const dialog = document.getElementById('pro-access-dialog');
  const form = document.getElementById('pro-access-form');
  const input = document.getElementById('pro-access-code');
  const status = document.getElementById('pro-access-status');
  const checkoutButton = document.getElementById('pro-checkout-button');
  const checkoutStatus = document.getElementById('pro-checkout-status');
  if (!dialog || !form || !input || !status || !checkoutButton || !checkoutStatus) return;

  let pendingLink = null;
  let replayLink = null;

  function openAccess(link) {
    pendingLink = link;
    input.value = '';
    status.textContent = '';
    checkoutStatus.textContent = 'Secure checkout is not connected yet. No payment will be taken.';
    if (!dialog.open) {
      try { dialog.showModal(); }
      catch { dialog.setAttribute('open', ''); }
    }
    requestAnimationFrame(() => checkoutButton.focus({ preventScroll: true }));
  }

  document.addEventListener('click', event => {
    const target = event.target;
    const link = target instanceof Element
      ? target.closest('.premium-feature-grid a[href^="#"], .glass-nav-group--pro a[href^="#"]')
      : null;
    if (!link) return;

    // Replaying the selected link after a valid developer code should continue
    // to that feature once; the next Pro entry always opens the access page.
    if (link === replayLink) {
      replayLink = null;
      return;
    }

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
    const linkToOpen = pendingLink;
    pendingLink = null;
    dialog.close('unlocked');
    status.textContent = '';
    if (linkToOpen?.isConnected) {
      replayLink = linkToOpen;
      requestAnimationFrame(() => {
        if (linkToOpen.isConnected && replayLink === linkToOpen) linkToOpen.click();
        else if (replayLink === linkToOpen) replayLink = null;
      });
    }
  });

  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close('backdrop');
  });
})();