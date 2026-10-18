(() => {
  'use strict';

  const viewers = [...document.querySelectorAll('model-viewer')];
  let runtimeRequested = false;

  function loadModelViewerRuntime() {
    if (runtimeRequested) return;
    runtimeRequested = true;
    const runtime = document.createElement('script');
    runtime.type = 'module';
    runtime.src = new URL('assets/vendor/model-viewer.min.js', document.baseURI).href;
    document.head.append(runtime);
  }

  if (viewers.length) {
    viewers.forEach(viewer => {
      viewer.setAttribute('loading', 'lazy');
      if (viewer.hasAttribute('auto-rotate')) {
        viewer.dataset.autonexusAutoRotate = 'true';
        viewer.removeAttribute('auto-rotate');
      }
    });

    if ('IntersectionObserver' in window) {
      const modelObserver = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          loadModelViewerRuntime();
          modelObserver.disconnect();
        }
      }, { rootMargin: '420px 0px' });
      viewers.forEach(viewer => modelObserver.observe(viewer));

      const rotationObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const viewer = entry.target;
          if (viewer.dataset.autonexusAutoRotate !== 'true') return;
          if (entry.isIntersecting) viewer.setAttribute('auto-rotate', '');
          else viewer.removeAttribute('auto-rotate');
        });
      }, { rootMargin: '80px 0px' });
      viewers.forEach(viewer => rotationObserver.observe(viewer));
    } else {
      loadModelViewerRuntime();
      viewers.forEach(viewer => {
        if (viewer.dataset.autonexusAutoRotate === 'true') viewer.setAttribute('auto-rotate', '');
      });
    }
  }

  const videos = [...document.querySelectorAll('video[data-autonexus-lazy-video]')];
  function activateVideo(video) {
    const deferredSources = video.querySelectorAll('source[data-src]');
    if (deferredSources.length) {
      deferredSources.forEach(source => {
        source.src = new URL(source.dataset.src, document.baseURI).href;
        delete source.dataset.src;
      });
      video.load();
      video.dataset.autonexusLoaded = 'true';
    }
    if (video.autoplay) {
      const resume = () => {
        if (video.dataset.autonexusVisible === 'true') video.play().catch(() => {});
      };
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) resume();
      else video.addEventListener('canplay', resume, { once: true });
    }
  }

  if (videos.length) {
    if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.target.dataset.autonexusVisible = String(entry.isIntersecting);
          if (entry.isIntersecting) activateVideo(entry.target);
          else if (entry.target.dataset.autonexusLoaded === 'true') entry.target.pause();
        });
      }, { rootMargin: '320px 0px' });
      videos.forEach(video => videoObserver.observe(video));
    } else {
      videos.forEach(video => {
        video.dataset.autonexusVisible = 'true';
        activateVideo(video);
      });
    }
  }
})();