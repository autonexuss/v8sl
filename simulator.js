(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const board = $('env-shift-board');
  const knob = $('env-shifter');
  const feature = $('environment-feature');
  const dataPanel = $('env-engine-data');
  const offPanel = $('env-engine-off');
  if (!board || !knob || !feature) return;

  const idle = 780;
  const redline = 4500;
  const lanes = [38, 63, 88];
  const speedCaps = { '-1': 12, 1: 34, 2: 58, 3: 88, 4: 125, 5: 165, 6: 205 };
  const gearPull = { '-1': .3, 1: 1, 2: .76, 3: .56, 4: .43, 5: .34, 6: .28 };
  const sim = { engine: false, gear: 0, lane: 1, speed: 0, rpm: idle, fuel: 0, brakeWear: 0, throttle: 0, brake: 0, paused: false, pointer: null, dragMoved: false, shifting: false, lastFrame: 0, raf: 0 };
  const startSfx = $('env-engine-start-audio');
  const loopAudio = $('env-engine-loop-audio');
  const stopSfx = $('env-engine-stop-audio');
  let startSfxTimer = 0;

  const position = gear => gear === -1 ? { x: 12, y: 22 } : gear === 0 ? { x: 50, y: 50 } : { x: lanes[Math.floor((gear - 1) / 2)], y: gear % 2 ? 22 : 78 };
  function setLever(point, animate = true) {
    knob.style.transition = animate ? '' : 'none';
    knob.style.left = `${point.x}%`;
    knob.style.top = `${point.y}%`;
    if (!animate) requestAnimationFrame(() => { knob.style.transition = ''; });
  }
  function setStatus(text) {
    const node = $('env-shift-status');
    if (node) node.textContent = text;
    const simStatus = $('env-drive-status');
    if (simStatus && sim.engine) simStatus.textContent = text;
  }
  function renderGear() {
    const label = sim.gear === -1 ? 'R' : sim.gear === 0 ? 'N' : String(sim.gear);
    if ($('env-gear-readout')) $('env-gear-readout').textContent = label;
    if ($('env-drive-direction')) $('env-drive-direction').textContent = sim.gear === -1 ? (sim.speed < -.2 ? 'Reverse' : 'Stopped · reverse') : Math.abs(sim.speed) > .2 ? 'Moving' : 'Stationary';
    knob.setAttribute('aria-label', `Gear lever, ${label === 'N' ? 'neutral' : label === 'R' ? 'reverse' : `gear ${label}`}. A and D select a lane, up and down select its gear, R selects reverse and N returns to neutral.`);
    setLever(position(sim.gear));
  }
  function snapNeutral(message = 'The lever returned to centered neutral.') {
    sim.gear = 0;
    sim.lane = 1;
    renderGear();
    setStatus(message);
  }
  function slotAt(x, y) {
    const ratio = board.clientWidth / Math.max(1, board.clientHeight);
    const slots = [
      { gear: 0, x: 50, y: 50 }, { gear: -1, x: 12, y: 22 },
      ...[1, 2, 3, 4, 5, 6].map(gear => ({ gear, ...position(gear) }))
    ];
    return slots.map(slot => ({ ...slot, distance: Math.hypot((slot.x - x) * ratio, slot.y - y) })).sort((a, b) => a.distance - b.distance)[0];
  }
  function projectToGate(x, y) {
    const ratio = board.clientWidth / Math.max(1, board.clientHeight);
    const lines = [
      [[12, 22], [12, 50]], [[12, 22], [38, 22]], [[38, 22], [38, 78]],
      [[63, 22], [63, 78]], [[88, 22], [88, 78]], [[38, 50], [88, 50]]
    ];
    let nearest = { x: 50, y: 50, distance: Infinity };
    for (const [[x1, y1], [x2, y2]] of lines) {
      const dx = (x2 - x1) * ratio, dy = y2 - y1;
      const t = clamp((((x - x1) * ratio) * dx + (y - y1) * dy) / (dx * dx + dy * dy || 1), 0, 1);
      const px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t;
      const distance = Math.hypot((x - px) * ratio, y - py);
      if (distance < nearest.distance) nearest = { x: px, y: py, distance };
    }
    return nearest;
  }
  async function selectGear(target) {
    if (!sim.engine || sim.shifting || target === sim.gear) return;
    if (target === -1 && Math.abs(sim.speed) > .2) { setStatus('Stop fully before selecting reverse.'); return; }
    if (target > 0 && Math.abs(sim.speed) > (speedCaps[target] || 0) + 10) { setStatus('Slow down before selecting that lower gear.'); return; }
    const from = sim.gear;
    const fromLane = from > 0 ? Math.floor((from - 1) / 2) : sim.lane;
    const targetLane = target > 0 ? Math.floor((target - 1) / 2) : target === -1 ? 0 : sim.lane;
    const path = [];
    const add = point => { const last = path[path.length - 1]; if (!last || last.x !== point.x || last.y !== point.y) path.push(point); };
    if (from > 0) add({ x: lanes[fromLane], y: 50 });
    else if (from === -1) add({ x: 12, y: 50 });
    else add({ x: 50, y: 50 });
    sim.gear = 0;
    renderGear();
    if (target === -1) { add({ x: 38, y: 50 }); add({ x: 38, y: 22 }); add({ x: 12, y: 22 }); }
    else if (target > 0) { if (fromLane !== targetLane || from <= 0) add({ x: lanes[targetLane], y: 50 }); add(position(target)); }
    else add({ x: 50, y: 50 });
    sim.shifting = true;
    try {
      for (const point of path) {
        setLever(point);
        await new Promise(resolve => setTimeout(resolve, 90));
      }
      sim.gear = target;
      if (target > 0) sim.lane = targetLane;
      renderGear();
      setStatus(target === 0 ? 'Neutral selected · move into a gear detent.' : `${target === -1 ? 'Reverse' : `Gear ${target}`} engaged.`);
    } finally { sim.shifting = false; }
  }
  function setPedal(name, value) {
    const amount = clamp(Number(value) || 0, 0, 100);
    if (name === 'accelerator') sim.throttle = amount;
    if (name === 'brake') sim.brake = amount;
    const output = $(`env-${name}-output`);
    if (output) output.textContent = `${Math.round(amount)}%`;
    const button = document.querySelector(`.env-pedal[data-pedal="${name}"]`);
    if (button) {
      button.classList.toggle('is-pressed', amount > 0);
      button.setAttribute('aria-pressed', String(amount > 0));
      const fill = button.querySelector('i');
      if (fill) fill.style.height = `${amount * .72}%`;
    }
    const range = document.querySelector(`[data-pedal-range="${name}"]`);
    if (range && Number(range.value) !== Math.round(amount)) range.value = String(Math.round(amount));
  }
  document.querySelectorAll('.env-pedal[data-pedal]').forEach(button => {
    const key = button.dataset.pedal;
    button.addEventListener('pointerdown', event => { event.preventDefault(); if (sim.engine) setPedal(key, 100); button.setPointerCapture?.(event.pointerId); });
    ['pointerup', 'pointercancel', 'lostpointercapture', 'blur'].forEach(type => button.addEventListener(type, () => setPedal(key, 0)));
    button.addEventListener('keydown', event => { if ([' ', 'Enter'].includes(event.key)) { event.preventDefault(); if (sim.engine) setPedal(key, 100); } });
    button.addEventListener('keyup', event => { if ([' ', 'Enter'].includes(event.key)) setPedal(key, 0); });
  });
  document.querySelectorAll('[data-pedal-range]').forEach(input => input.addEventListener('input', () => { if (sim.engine) setPedal(input.dataset.pedalRange, input.value); }));

  knob.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    if (!sim.engine) { setStatus('Start the engine before shifting.'); return; }
    event.preventDefault();
    sim.pointer = event.pointerId;
    sim.dragMoved = false;
    sim.lane = sim.gear > 0 ? Math.floor((sim.gear - 1) / 2) : 1;
    sim.gear = 0;
    if ($('env-gear-readout')) $('env-gear-readout').textContent = 'N';
    if ($('env-drive-direction')) $('env-drive-direction').textContent = 'Stationary';
    setLever({ x: 50, y: 50 });
    setStatus('Neutral · hold the lever and move to a gear detent.');
    knob.setPointerCapture?.(event.pointerId);
  });
  knob.addEventListener('pointermove', event => {
    if (sim.pointer !== event.pointerId) return;
    sim.dragMoved = true;
    const rect = board.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width * 100, 0, 100);
    const y = clamp((event.clientY - rect.top) / rect.height * 100, 0, 100);
    const point = projectToGate(x, y);
    setLever(point, false);
    if (Math.abs(point.y - 50) < 9) {
      sim.gear = 0;
      if (point.x < 50) sim.lane = 0;
      else if (point.x > 50) sim.lane = 2;
      else sim.lane = 1;
      if ($('env-gear-readout')) $('env-gear-readout').textContent = 'N';
      setStatus('Neutral · hold and move to another gate, then release at its gear detent.');
    }
  });
  const finishDrag = event => {
    if (sim.pointer !== event.pointerId) return;
    sim.pointer = null;
    if (!sim.dragMoved) { snapNeutral(); return; }
    const rect = board.getBoundingClientRect();
    const x = clamp((event.clientX - rect.left) / rect.width * 100, 0, 100);
    const y = clamp((event.clientY - rect.top) / rect.height * 100, 0, 100);
    const slot = slotAt(x, y);
    if (slot.distance > 8) { snapNeutral(); return; }
    if (slot.gear > 0) sim.lane = Math.floor((slot.gear - 1) / 2);
    selectGear(slot.gear);
  };
  knob.addEventListener('pointerup', finishDrag);
  knob.addEventListener('pointercancel', () => { sim.pointer = null; snapNeutral(); });
  knob.addEventListener('lostpointercapture', () => { if (sim.pointer !== null) { sim.pointer = null; snapNeutral(); } });

  function engineStart() {
    if (sim.engine) return;
    sim.engine = true;
    sim.paused = false;
    sim.gear = 0; sim.lane = 1; sim.speed = 0; sim.rpm = idle; sim.lastFrame = 0;
    if (offPanel) offPanel.hidden = true;
    if (dataPanel) dataPanel.hidden = false;
    $('env-engine-toggle')?.setAttribute('aria-pressed', 'true');
    renderGear();
    setStatus('Engine running · neutral. Use the gear gate to begin.');
    knob.focus({ preventScroll: true });
    if (stopSfx) { stopSfx.pause(); stopSfx.currentTime = 0; }
    if (startSfx) {
      startSfx.pause(); startSfx.currentTime = 0;
      startSfx.play().catch(() => {});
      clearTimeout(startSfxTimer);
      startSfxTimer = setTimeout(() => { startSfx.pause(); if (sim.engine && loopAudio) { loopAudio.currentTime = 0; loopAudio.play().catch(() => {}); } }, 2600);
    } else loopAudio?.play().catch(() => {});
    $('env-drive-status') && ($('env-drive-status').textContent = 'Engine running · neutral.');
    startLoop();
  }
  function engineStop() {
    if (!sim.engine) return;
    sim.engine = false;
    sim.speed = 0; sim.rpm = idle; sim.gear = 0; sim.lane = 1; sim.fuel = 0; sim.brakeWear = 0;
    setPedal('accelerator', 0); setPedal('brake', 0);
    clearTimeout(startSfxTimer);
    startSfx?.pause();
    if (loopAudio) { loopAudio.pause(); loopAudio.currentTime = 0; }
    if (offPanel) offPanel.hidden = false;
    if (dataPanel) dataPanel.hidden = true;
    $('env-engine-toggle')?.setAttribute('aria-pressed', 'false');
    renderGear();
    $('env-drive-status') && ($('env-drive-status').textContent = 'Engine off.');
    if (stopSfx) { stopSfx.currentTime = 0; stopSfx.play().catch(() => {}); }
    stopLoop();
  }
  $('env-engine-toggle')?.addEventListener('click', engineStart);
  $('env-engine-stop')?.addEventListener('click', engineStop);
  $('env-sim-reset')?.addEventListener('click', () => {
    sim.speed = 0; sim.fuel = 0; sim.brakeWear = 0; sim.paused = false;
    setPedal('accelerator', 0); setPedal('brake', 0); snapNeutral('Drive reset · centered neutral.');
    const pause = $('env-sim-pause'); if (pause) pause.textContent = 'Pause simulation';
  });
  $('env-sim-pause')?.addEventListener('click', event => {
    sim.paused = !sim.paused;
    event.currentTarget.textContent = sim.paused ? 'Resume simulation' : 'Pause simulation';
    sim.lastFrame = 0;
    setStatus(sim.paused ? 'Simulation paused.' : 'Simulation resumed.');
  });

  function updateScreen() {
    const absSpeed = Math.abs(sim.speed);
    const throttle = sim.throttle / 100;
    const brake = sim.brake / 100;
    const cap = speedCaps[sim.gear] || 0;
    const wheelRpm = cap ? idle + absSpeed / cap * (redline - idle) : idle;
    sim.rpm = clamp(cap ? Math.max(idle, wheelRpm + throttle * 460) : idle + throttle * (redline - idle - 350), idle, redline);
    const torque = Math.round((25 + 225 * throttle) * clamp(1 - Math.max(0, sim.rpm - 2800) / 3300, .45, 1));
    const kw = torque * sim.rpm / 9549;
    const set = (id, value) => { if ($(id)) $(id).textContent = value; };
    set('env-speed', String(Math.round(absSpeed)));
    set('env-rpm', String(Math.round(sim.rpm / 10) * 10));
    set('env-power', `${kw.toFixed(1)} kW`);
    set('env-torque', `${torque} Nm`);
    set('env-fuel', `${sim.fuel.toFixed(2)} L`);
    set('env-co2', `${(sim.fuel * 2.69).toFixed(2)} kg`);
    set('env-brake-wear', `${Math.round(sim.brakeWear)} / 100`);
    const dust = brake * (.45 + Math.min(1, absSpeed / 120) * .55);
    set('env-brake-dust', brake === 0 ? 'None' : dust >= .65 ? 'High · relative' : dust >= .25 ? 'Moderate · relative' : 'Low · relative');
    const speedArc = $('env-speed-arc'); if (speedArc) speedArc.style.width = `${clamp(absSpeed / 205 * 100, 0, 100)}%`;
    const rpmArc = $('env-rpm-arc'); if (rpmArc) rpmArc.style.width = `${clamp(sim.rpm / redline * 100, 0, 100)}%`;
    if ($('env-drive-status') && !sim.paused) $('env-drive-status').textContent = sim.gear === 0 && throttle > .03 ? 'In neutral · engine speed rises while the wheels remain still.' : 'Illustrative simulation · no live vehicle data.';
    if (loopAudio && sim.engine && !loopAudio.paused) {
      loopAudio.playbackRate = clamp(.88 + throttle * .42 + Math.min(.12, absSpeed / 500), .82, 1.42);
      loopAudio.volume = clamp(.2 + throttle * .2, .18, .42);
    }
  }
  function frame(now) {
    if (sim.lastFrame && !sim.paused && sim.engine) {
      const dt = Math.min(.05, (now - sim.lastFrame) / 1000);
      const throttle = sim.throttle / 100, brake = sim.brake / 100, speed = Math.abs(sim.speed);
      if (sim.gear === -1) {
        if (throttle) sim.speed -= throttle * gearPull[-1] * 9 * dt * clamp(1 - speed / 12, 0, 1);
        if (brake) sim.speed = Math.min(0, sim.speed + brake * (7 + speed * .03) * dt);
        sim.speed = Math.max(-12, sim.speed);
      } else {
        if (sim.speed < 0) sim.speed = Math.min(0, sim.speed + (brake ? 8 : 1.4) * dt);
        else {
          if (sim.gear > 0 && throttle) sim.speed += throttle * gearPull[sim.gear] * 9 * dt;
          if (brake) sim.speed = Math.max(0, sim.speed - brake * (8 + speed * .035) * dt);
          if (sim.gear > 0) sim.speed = Math.min(speedCaps[sim.gear], sim.speed);
          else sim.speed = Math.max(0, sim.speed - .3 * dt);
        }
      }
      sim.brakeWear = brake ? clamp(brake * (24 + speed * .62), 0, 100) : Math.max(0, sim.brakeWear - 12 * dt);
      sim.fuel += (.55 + throttle * (1.8 + sim.rpm / redline * 6.2)) * dt / 3600;
    }
    sim.lastFrame = now;
    if (sim.engine && !sim.paused) updateScreen();
    sim.raf = requestAnimationFrame(frame);
  }
  function startLoop() { if (sim.raf || !feature.classList.contains('section-modal-active')) return; sim.lastFrame = 0; sim.raf = requestAnimationFrame(frame); }
  function stopLoop() { if (sim.raf) cancelAnimationFrame(sim.raf); sim.raf = 0; sim.lastFrame = 0; }
  new MutationObserver(() => {
    if (feature.classList.contains('section-modal-active')) startLoop();
    else { if (sim.engine) engineStop(); stopLoop(); setPedal('accelerator', 0); setPedal('brake', 0); }
  }).observe(feature, { attributes: true, attributeFilter: ['class'] });
  if (feature.classList.contains('section-modal-active')) startLoop();

  const isTyping = target => target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
  document.addEventListener('keydown', event => {
    if (!feature.classList.contains('section-modal-active') || !sim.engine || isTyping(event.target) || event.target.closest?.('.section-modal-close') || event.target.closest?.('button:not(#env-shifter)')) return;
    const key = event.key.toLowerCase();
    if (['w', 's', ' ', 'a', 'd', 'r', 'n', 'arrowup', 'arrowdown'].includes(key)) event.preventDefault();
    if (key === 'w') setPedal('accelerator', 100);
    else if (key === 's' || key === ' ') setPedal('brake', 100);
    else if (key === 'n') snapNeutral('Centered neutral selected.');
    else if (key === 'r') selectGear(-1);
    else if (key === 'a' || key === 'd') {
      const currentLane = sim.gear > 0 ? Math.floor((sim.gear - 1) / 2) : sim.lane;
      sim.lane = clamp(currentLane + (key === 'a' ? -1 : 1), 0, 2);
      if (sim.gear > 0) { sim.gear = 0; renderGear(); }
      setLever({ x: lanes[sim.lane], y: 50 });
      setStatus('Neutral gate · choose an upper or lower gear.');
    }
    else if (key === 'arrowup') selectGear(sim.lane * 2 + 1);
    else if (key === 'arrowdown') selectGear(sim.lane * 2 + 2);
  });
  document.addEventListener('keyup', event => {
    if (!feature.classList.contains('section-modal-active')) return;
    if (event.key.toLowerCase() === 'w') setPedal('accelerator', 0);
    if (event.key.toLowerCase() === 's' || event.key === ' ') setPedal('brake', 0);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { setPedal('accelerator', 0); setPedal('brake', 0); } });
  renderGear();
})();
