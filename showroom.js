(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const loader = document.getElementById('model-viewer-runtime');
  const openedAsFile = window.location.protocol === 'file:';
  const earthViewer = document.querySelector('.ev-earth-model');
  const earthStage = document.querySelector('.ev-map-earth');
  const earthFallback = earthStage?.querySelector('.ev-earth-fallback');

  if (openedAsFile) {
    document.body.classList.add('model-viewer-unavailable');
    document.querySelectorAll('.showroom-model-fallback').forEach(fallback => {
      fallback.textContent = '3D needs the local server · run Start Autonexus.cmd';
    });
  }

  loader?.addEventListener('error', () => {
    document.body.classList.add('model-viewer-unavailable');
    if (!openedAsFile) {
      document.querySelectorAll('.showroom-model-fallback').forEach(fallback => {
        fallback.textContent = '3D preview unavailable · open feature';
      });
    }
    if (earthStage) {
      earthStage.classList.add('is-earth-error');
      if (earthFallback) earthFallback.textContent = openedAsFile
        ? 'Run Start Autonexus.cmd to view the 3D Earth.'
        : 'The Earth preview could not load. The charging search is still available.';
    }
  }, { once: true });

  if (earthViewer && earthStage) {
    earthViewer.addEventListener('load', () => earthStage.classList.add('is-earth-ready'), { once: true });
    earthViewer.addEventListener('error', () => {
      earthStage.classList.add('is-earth-error');
      if (earthFallback) earthFallback.textContent = 'The Earth preview could not load. The charging search is still available.';
    }, { once: true });
    if (openedAsFile && earthFallback) earthFallback.textContent = 'Run Start Autonexus.cmd to view the 3D Earth.';

    const syncEarthMotion = () => {
      if (reduceMotion.matches) earthViewer.removeAttribute('auto-rotate');
      else earthViewer.setAttribute('auto-rotate', '');
    };
    syncEarthMotion();
    reduceMotion.addEventListener?.('change', syncEarthMotion);
  }

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
