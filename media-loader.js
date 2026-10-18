(() => {
  'use strict';

  const viewers = [...document.querySelectorAll('model-viewer')];
  let runtimeRequested = false;
  let runtimeReady = false;
  let activeModelLoads = 0;
  const modelLoadLimit = 2;
  const modelQueue = [];
  const queuedModels = new WeakSet();

  function pumpModelQueue() {
    if (!runtimeReady) return;
    while (activeModelLoads < modelLoadLimit && modelQueue.length) {
      const viewer = modelQueue.shift();
      if (!viewer?.isConnected || viewer.dataset.autonexusModelRequested === 'true') continue;
      const modelUrl = viewer.dataset.src;
      if (!modelUrl) continue;
      viewer.dataset.autonexusModelRequested = 'true';
      activeModelLoads += 1;
      let settled = false;
      const settle = () => {
        if (settled) return;
        settled = true;
        activeModelLoads = Math.max(0, activeModelLoads - 1);
        pumpModelQueue();
      };
      viewer.addEventListener('load', settle, { once: true });
      viewer.addEventListener('error', settle, { once: true });
      window.setTimeout(settle, 30000);
      viewer.setAttribute('src', new URL(modelUrl, document.baseURI).href);
    }
  }

  function enqueueModel(viewer) {
    if (!viewer.dataset.src || queuedModels.has(viewer) || viewer.dataset.autonexusModelRequested === 'true') return;
    queuedModels.add(viewer);
    modelQueue.push(viewer);
    pumpModelQueue();
  }

  function loadModelViewerRuntime() {
    if (runtimeRequested) return;
    runtimeRequested = true;
    const runtime = document.createElement('script');
    runtime.type = 'module';
    runtime.src = new URL('assets/vendor/model-viewer.min.js', document.baseURI).href;
    runtime.onload = () => { runtimeReady = true; pumpModelQueue(); };
    runtime.onerror = () => { runtimeRequested = false; };
    document.head.append(runtime);
  }

  if (viewers.length) {
    viewers.forEach(viewer => {
      viewer.setAttribute('loading', 'lazy');
      if (viewer.hasAttribute('src')) {
        viewer.dataset.src = viewer.getAttribute('src');
        viewer.removeAttribute('src');
      }
      if (viewer.hasAttribute('auto-rotate')) {
        viewer.dataset.autonexusAutoRotate = 'true';
        viewer.removeAttribute('auto-rotate');
      }
    });

    if ('IntersectionObserver' in window) {
      const modelObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          loadModelViewerRuntime();
          enqueueModel(entry.target);
          modelObserver.unobserve(entry.target);
        });
      }, { rootMargin: '160px 0px', threshold: 0.01 });
      viewers.forEach(viewer => modelObserver.observe(viewer));

      const rotationObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const viewer = entry.target;
          if (viewer.dataset.autonexusAutoRotate !== 'true') return;
          if (entry.isIntersecting) viewer.setAttribute('auto-rotate', '');
          else viewer.removeAttribute('auto-rotate');
        });
      }, { rootMargin: '40px 0px' });
      viewers.forEach(viewer => rotationObserver.observe(viewer));
    } else {
      loadModelViewerRuntime();
      viewers.forEach(enqueueModel);
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