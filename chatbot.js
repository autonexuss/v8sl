(() => {
  'use strict';
  const toggle = document.getElementById('chatbot-toggle');
  const panel = document.getElementById('autonexus-chatbot');
  const closeButton = document.getElementById('chatbot-close');
  const dragHandle = document.getElementById('chatbot-drag-handle');
  const form = document.getElementById('chatbot-form');
  const input = document.getElementById('chatbot-input');
  const historyNode = document.getElementById('chatbot-history');
  const statusNode = document.getElementById('chatbot-status');
  const progressWrap = document.getElementById('chatbot-progress-wrap');
  const progressBar = document.getElementById('chatbot-progress');
  const progressText = document.getElementById('chatbot-progress-text');
  const sendButton = document.getElementById('chatbot-send');
  const stopButton = document.getElementById('chatbot-stop');
  const retryButton = document.getElementById('chatbot-retry');
  if (!toggle || !panel || !form || !input || !historyNode) return;

  const transcript = [];
  let worker = null;
  let modelReady = false;
  let modelLoading = false;
  let generating = false;
  let requestCounter = 0;
  let activeRequest = null;
  let activeReply = null;
  let drag = null;

  function setStatus(message) { if (statusNode) statusNode.textContent = message; }
  function setExpanded(value) {
    panel.hidden = !value;
    toggle.setAttribute('aria-expanded', String(value));
    if (value) {
      if (!panel.style.left && !panel.style.top) {
        panel.style.right = '24px';
        panel.style.bottom = '24px';
      }
      window.setTimeout(() => input.focus(), 60);
    } else {
      stopGeneration(true);
      toggle.focus();
    }
  }

  function appendMessage(role, text = '', extraClass = '') {
    const row = document.createElement('div');
    row.className = `chatbot-message ${role === 'user' ? 'chatbot-message-user' : 'chatbot-message-assistant'} ${extraClass}`.trim();
    const badge = document.createElement('span');
    badge.textContent = role === 'user' ? 'YOU' : 'AI';
    const body = document.createElement('p');
    body.textContent = text;
    row.append(badge, body);
    historyNode.append(row);
    historyNode.scrollTop = historyNode.scrollHeight;
    return body;
  }

  function setProgressVisible(visible) {
    if (progressWrap) progressWrap.hidden = !visible;
  }

  function startWorker() {
    if (worker || modelLoading || modelReady) return;
    modelLoading = true;
    retryButton.hidden = true;
    setProgressVisible(true);
    progressBar.value = 0;
    progressText.textContent = 'Starting…';
    setStatus('Starting the browser AI. The first download is about 272 MB.');
    try {
      worker = new Worker(new URL('chatbot-worker.js', document.baseURI), { type: 'module', name: 'autonexus-local-ai' });
    } catch (error) {
      modelLoading = false;
      worker = null;
      setProgressVisible(false);
      setStatus('This browser could not start the local AI worker.');
      retryButton.hidden = false;
      return;
    }
    worker.addEventListener('message', event => {
      const message = event.data || {};
      if (message.type === 'status') setStatus(message.message || 'Loading the AI model…');
      if (message.type === 'progress') {
        const total = Number(message.total) || 0;
        const loaded = Number(message.loaded) || 0;
        const supplied = Number(message.progress);
        if (Number.isFinite(supplied)) progressBar.value = supplied;
        if (total > 0 && loaded > 0) progressText.textContent = `${Math.min(100, Math.round(loaded / total * 100))}%`;
        else if (message.status === 'progress') progressText.textContent = 'Preparing…';
        else progressText.textContent = 'Downloading…';
        setStatus('Downloading a small open model to this browser. It is cached for later visits.');
      }
      if (message.type === 'ready') {
        modelReady = true;
        modelLoading = false;
        retryButton.hidden = true;
        setProgressVisible(false);
        setStatus('Ready · replies run locally on this device.');
      }
      if (message.type === 'token' && message.requestId === activeRequest && activeReply) {
        activeReply.textContent += String(message.token || '');
        historyNode.scrollTop = historyNode.scrollHeight;
      }
      if (message.type === 'complete' && message.requestId === activeRequest) {
        generating = false;
        activeRequest = null;
        const finishedText = activeReply?.textContent || '';
        activeReply = null;
        stopButton.hidden = true;
        sendButton.disabled = false;
        if (transcript.length && transcript[transcript.length - 1].role === 'assistant') transcript[transcript.length - 1].content = finishedText;
        setStatus('Ready · replies run locally on this device.');
      }
      if (message.type === 'error') {
        modelLoading = false;
        modelReady = false;
        generating = false;
        activeRequest = null;
        setProgressVisible(false);
        stopButton.hidden = true;
        sendButton.disabled = false;
        if (activeReply) {
          activeReply.textContent ||= 'I could not finish that response.';
          activeReply.closest('.chatbot-message')?.classList.add('chatbot-message-error');
          if (transcript.length && transcript[transcript.length - 1].role === 'assistant') transcript[transcript.length - 1].content = activeReply.textContent;
        }
        activeReply = null;
        retryButton.hidden = false;
        setStatus('The model failed to load or respond. Check your connection, then retry.');
      }
    });
    worker.addEventListener('error', () => {
      modelLoading = false;
      modelReady = false;
      generating = false;
      setProgressVisible(false);
      sendButton.disabled = false;
      stopButton.hidden = true;
      retryButton.hidden = false;
      setStatus('The local AI could not start. Check your browser and internet connection, then retry.');
      worker?.terminate();
      worker = null;
    });
    worker.postMessage({ type: 'load' });
  }

  function normalized(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  function retrieveVehicleContext(question) {
    const query = normalized(question);
    if (!query) return '';
    const profiles = typeof curatedIndiaSpecProfiles !== 'undefined' && Array.isArray(curatedIndiaSpecProfiles) ? curatedIndiaSpecProfiles : [];
    const matches = profiles.filter(profile => {
      const make = normalized(profile.make), model = normalized(profile.model);
      const excludedVariant = (profile.excludes || []).some(name => normalized(name) && query.includes(normalized(name)));
      return model && query.includes(model) && !excludedVariant && (!make || query.includes(make) || model.length >= 3);
    }).sort((a, b) => normalized(b.make + ' ' + b.model).length - normalized(a.make + ' ' + a.model).length).slice(0, 3);
    if (matches.length) {
      return matches.map(profile => {
        const years = `${profile.fromYear || '?'}–${profile.toYear || '?'}`;
        const engines = (profile.engines || []).slice(0, 6).map(engine => {
          const fields = [engine.name, engine.fuel && `fuel ${engine.fuel}`, engine.displacement, engine.powerKW && `${engine.powerKW} kW`, engine.powerPS && `${engine.powerPS} PS`, engine.powerRpm && `power at ${engine.powerRpm}`, engine.torque && `torque ${engine.torque}`, engine.torqueRpm && `torque at ${engine.torqueRpm}`, engine.transmission].filter(Boolean);
          return `- ${fields.join(' · ')}`;
        });
        const rows = (profile.rows || []).slice(0, 9).map(row => `- ${row.name}: ${row.value}${row.source ? ` (source: ${row.source})` : ''}`);
        return [
          `Vehicle: ${profile.make} ${profile.model}; curated profile years ${years}.`,
          profile.provenance ? `Scope: ${profile.provenance}` : '',
          engines.length ? `Published engine variants:\n${engines.join('\n')}` : 'Engine variants: not available in this profile.',
          rows.length ? `Other published specifications:\n${rows.join('\n')}` : '',
          profile.brochure ? `Official manufacturer brochure: ${profile.brochure}` : '',
          profile.performance ? `Official performance page: ${profile.performance}` : ''
        ].filter(Boolean).join('\n');
      }).join('\n\n');
    }

    const directory = Array.isArray(window.CHASSIS_INDIA_DIRECTORY) ? window.CHASSIS_INDIA_DIRECTORY : [];
    const entries = [];
    for (const make of directory) {
      const makeName = normalized(make.make);
      for (const model of make.models || []) {
        const modelName = normalized(model.name);
        if (modelName && query.includes(modelName) && (!makeName || query.includes(makeName) || modelName.length >= 3)) {
          entries.push(`Directory match: ${make.make} ${model.name}; listed India-market years ${model.from}–${model.to}. Official manufacturer page: ${make.url || 'not supplied'}. Exact specifications are not in the locally curated profile.`);
        }
      }
    }
    return entries.slice(0, 3).join('\n');
  }

  function stopGeneration(silent = false) {
    if (!generating) return;
    const partialReply = activeReply?.textContent || '';
    if (transcript.length && transcript[transcript.length - 1].role === 'assistant') {
      transcript[transcript.length - 1].content = partialReply || (silent ? '' : 'Response stopped.');
    }
    // Terminating the module worker interrupts ONNX inference immediately. Model files remain browser-cached.
    worker?.terminate();
    worker = null;
    modelReady = false;
    modelLoading = false;
    generating = false;
    activeRequest = null;
    activeReply = null;
    sendButton.disabled = false;
    stopButton.hidden = true;
    setProgressVisible(false);
    if (!silent) setStatus('Response stopped. The downloaded model remains cached.');
  }

  toggle.addEventListener('click', () => {
    const opening = panel.hidden;
    setExpanded(opening);
    if (opening) startWorker();
  });
  closeButton.addEventListener('click', () => setExpanded(false));
  retryButton.addEventListener('click', () => {
    if (worker) worker.terminate();
    worker = null;
    modelReady = false;
    modelLoading = false;
    startWorker();
  });
  stopButton.addEventListener('click', () => stopGeneration(false));

  document.getElementById('chatbot-clear')?.addEventListener('click', () => {
    stopGeneration(true);
    transcript.length = 0;
    historyNode.replaceChildren();
    appendMessage('assistant', 'Conversation cleared. What would you like to know about Autonexus?');
    setStatus(modelReady ? 'Ready · replies run locally on this device.' : 'AI model loads the first time you open the chat.');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || generating) return;
    if (!worker || (!modelReady && !modelLoading)) startWorker();
    if (!worker) {
      setStatus('The local AI worker could not start. Please retry in a modern browser.');
      retryButton.hidden = false;
      return;
    }
    transcript.push({ role: 'user', content: question });
    appendMessage('user', question);
    const reply = appendMessage('assistant', '');
    transcript.push({ role: 'assistant', content: '' });
    activeReply = reply;
    activeRequest = ++requestCounter;
    generating = true;
    stopButton.hidden = false;
    sendButton.disabled = true;
    input.value = '';
    setStatus(modelReady ? 'Thinking on this device…' : 'Preparing the local model…');
    const vehicleContext = retrieveVehicleContext(question);
    if (modelReady && worker) worker.postMessage({ type: 'generate', messages: transcript.slice(0, -1).slice(-8), requestId: activeRequest, vehicleContext });
    else {
      const waitForReady = event => {
        if (event.data?.type === 'ready' && worker && generating && activeRequest !== null) {
          worker.removeEventListener('message', waitForReady);
          worker.postMessage({ type: 'generate', messages: transcript.slice(0, -1).slice(-8), requestId: activeRequest, vehicleContext });
        }
      };
      worker?.addEventListener('message', waitForReady);
    }
  });

  input.addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden && !document.querySelector('.section-modal-active')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setExpanded(false);
    }
  }, true);

  // Drag from the header to reposition; keep the entire window reachable.
  dragHandle?.addEventListener('pointerdown', event => {
    if (event.target.closest('button') || event.button !== 0) return;
    const rect = panel.getBoundingClientRect();
    drag = { id: event.pointerId, dx: event.clientX - rect.left, dy: event.clientY - rect.top };
    dragHandle.setPointerCapture?.(event.pointerId);
    panel.style.left = `${rect.left}px`;
    panel.style.top = `${rect.top}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });
  dragHandle?.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const left = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, event.clientX - drag.dx));
    const top = Math.max(8, Math.min(window.innerHeight - panel.offsetHeight - 8, event.clientY - drag.dy));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  });
  const finishDrag = event => { if (drag && drag.id === event.pointerId) drag = null; };
  dragHandle?.addEventListener('pointerup', finishDrag);
  dragHandle?.addEventListener('pointercancel', finishDrag);
  window.addEventListener('resize', () => {
    if (panel.hidden || !panel.style.left || !panel.style.top) return;
    const left = Math.max(8, Math.min(window.innerWidth - panel.offsetWidth - 8, parseFloat(panel.style.left) || 8));
    const top = Math.max(8, Math.min(window.innerHeight - panel.offsetHeight - 8, parseFloat(panel.style.top) || 8));
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  });
})();
