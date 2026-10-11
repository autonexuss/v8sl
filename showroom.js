(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loader = document.getElementById('model-viewer-runtime');

  loader?.addEventListener('error', () => {
    document.body.classList.add('model-viewer-unavailable');
  }, { once: true });

  document.querySelectorAll('.showroom-feature-tile').forEach(tile => {
    const viewer = tile.querySelector('model-viewer');
    if (!viewer) return;

    viewer.addEventListener('load', () => tile.classList.add('is-model-ready'), { once: true });
    viewer.addEventListener('error', () => {
      tile.classList.add('has-model-error');
      const fallback = tile.querySelector('.showroom-model-fallback');
      if (fallback) fallback.textContent = '3D preview unavailable · open feature';
    });

    const turn = enabled => {
      if (reduceMotion.matches || tile.classList.contains('has-model-error')) {
        viewer.removeAttribute('auto-rotate');
        return;
      }
      viewer.toggleAttribute('auto-rotate', enabled);
    };

    tile.addEventListener('pointerenter', () => turn(true));
    tile.addEventListener('pointerleave', () => turn(false));
    tile.addEventListener('focusin', () => turn(true));
    tile.addEventListener('focusout', event => {
      if (!tile.contains(event.relatedTarget)) turn(false);
    });
  });
})();
