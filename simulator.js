(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const board = $('env-shift-board');
  const knob = $('env-shifter');
  const feature = $('environment-feature');
  if (!board || !knob || !feature) return;

  const idle = 780; // estimated warm-idle reference; not supplied by Toyota for this profile
  const redline = 4500; // illustrative ceiling, not a verified Fortuner rev limiter
  const lanes = [38, 63, 88];
  const speedCaps = { '-1': 8, 1: 32, 2: 52, 3: 78, 4: 112, 5: 148, 6: 176 }; // estimated display caps, not Toyota gearing data
  const gearPull = { '-1': .3, 1: 1, 2: .76, 3: .56, 4: .43, 5: .34, 6: .28 }; // illustrative relative ratios
  const sim = { engine: false, gear: 0, lane: 1, speed: 0, rpm: 0, fuel: 0, brakeWear: 0, throttle: 0, brake: 0, clutch: 0, paused: false, pointer: null, dragOrigin: null, dragStart: null, dragMoved: false, shifting: false, lastFrame: 0, raf: 0, masterVolume: .65, muted: false };
  const startSfx = $('env-engine-start-audio');
  const idleAudio = $('env-engine-idle-audio');
  const revAudio = $('env-engine-rev-audio');
  const stopSfx = $('env-engine-stop-audio');
  const audioVolume = $('env-audio-volume');
  const audioMute = $('env-audio-mute');
  let startSfxTimer = 0;
  let idleLoopStarted = false;
  let idleLoopGain = .42;
  const idleLoopStart = 0;
  const revLoopStart = 0;
  function effectiveVolume() { return sim.muted ? 0 : sim.masterVolume; }
  function applyAudioVolume() {
    const volume = effectiveVolume();
    if (idleAudio) idleAudio.volume = Math.min(1, idleLoopGain * volume);
    if (revAudio) revAudio.volume = Math.min(1, Number(revAudio.dataset.targetVolume || 0) * volume);
    if (startSfx) startSfx.volume = volume;
    if (stopSfx) stopSfx.volume = volume;
    if (audioMute) {
      audioMute.setAttribute('aria-pressed', String(sim.muted));
      audioMute.textContent = sim.muted ? 'Unmute' : 'Mute';
    }
  }
  function beginIdleLoop() {
    if (!sim.engine || !idleAudio || idleLoopStarted) return;
    idleLoopStarted = true;
    idleAudio.loop = true;
    idleAudio.currentTime = idleLoopStart;
    idleAudio.playbackRate = 1;
    applyAudioVolume();
    idleAudio.play().catch(() => { idleLoopStarted = false; });
  }
  const releaseIdleLoop = () => { if (sim.engine && idleLoopStarted) idleLoopGain = .42; };
  function setRevAudio(rpm, engineLoad) {
    if (!revAudio) return;
    const running = sim.engine && !sim.paused;
    const rpmRatio = clamp((rpm - idle) / (redline - idle), 0, 1);
    const load = running ? clamp(engineLoad, 0, 1) : 0;
    const throttle = sim.throttle / 100;
    const revving = running && throttle > .01;
    const target = revving ? clamp(.08 + rpmRatio * .2 + load * .36, .08, .56) : 0;
    revAudio.dataset.targetVolume = String(target);
    revAudio.loop = true;
    // This layer is the matching rev crop of a generic CC0 diesel recording.
    // Pitch follows the simulated RPM and load continuously; sparse samples mean this remains illustrative.
    revAudio.playbackRate = clamp(.82 + rpmRatio * .36 + load * .06, .82, 1.24);
    if (revving && revAudio.paused) {
      revAudio.currentTime = revLoopStart;
      revAudio.play().catch(() => {});
    } else if (!revving && !revAudio.paused) {
      revAudio.pause();
      revAudio.currentTime = revLoopStart;
    }
    applyAudioVolume();
  }

  const position = gear => gear === -1 ? { x: 12, y: 22 } : gear === 0 ? { x: lanes[1], y: 50 } : { x: lanes[Math.floor((gear - 1) / 2)], y: gear % 2 ? 22 : 78 };
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
    const engineStatus = $('env-sim-status');
    if (engineStatus) engineStatus.textContent = text;
  }
  function renderGear() {
    const label = sim.gear === -1 ? 'R' : sim.gear === 0 ? 'N' : String(sim.gear);
    if ($('env-gear-readout')) $('env-gear-readout').textContent = label;
    if ($('env-drive-direction')) $('env-drive-direction').textContent = sim.gear === -1 ? (sim.speed < -.2 ? 'Reverse' : 'Stopped · reverse') : Math.abs(sim.speed) > .2 ? 'Moving' : 'Stationary';
    knob.setAttribute('aria-label', `Gear lever, ${label === 'N' ? 'neutral' : label === 'R' ? 'reverse' : `gear ${label}`}. Left and right arrows or A and D select a lane. Up and down select its gear. R selects reverse and N returns to neutral.`);
    setLever(position(sim.gear));
  }
  function snapNeutral(message = 'The lever returned to centered neutral.') {
    if (sim.gear > 0) sim.lane = Math.floor((sim.gear - 1) / 2);
    else if (sim.gear === -1) sim.lane = 0;
    sim.gear = 0;
    renderGear();
    setStatus(message);
  }
  function slotAt(x, y) {
    const ratio = board.clientWidth / Math.max(1, board.clientHeight);
    const slots = [
      { gear: 0, x: lanes[1], y: 50 }, { gear: -1, x: 12, y: 22 },
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
    let nearest = { x: lanes[1], y: 50, distance: Infinity };
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
    if (sim.clutch < 65) { renderGear(); setStatus('Press and hold the clutch before moving the gear lever.'); return; }
    if (target === -1 && Math.abs(sim.speed) > .2) { renderGear(); setStatus('Stop fully before selecting reverse.'); return; }
    if (target > 0 && Math.abs(sim.speed) > (speedCaps[target] || 0) + 10) { renderGear(); setStatus('Slow down before selecting that lower gear.'); return; }
    const from = sim.gear;
    const fromLane = from > 0 ? Math.floor((from - 1) / 2) : sim.lane;
    const targetLane = target > 0 ? Math.floor((target - 1) / 2) : target === -1 ? 0 : sim.lane;
    const path = [];
    const add = point => { const last = path[path.length - 1]; if (!last || last.x !== point.x || last.y !== point.y) path.push(point); };
    if (from > 0) add({ x: lanes[fromLane], y: 50 });
    else if (from === -1) add({ x: 12, y: 50 });
    else add(position(0));
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
    if (name === 'clutch') sim.clutch = amount;
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
  audioVolume?.addEventListener('input', () => {
    sim.masterVolume = clamp(Number(audioVolume.value) / 100, 0, 1);
    applyAudioVolume();
  });
  audioMute?.addEventListener('click', () => { sim.muted = !sim.muted; applyAudioVolume(); });

  knob.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    if (!sim.engine) { setStatus('Start the engine before shifting.'); return; }
    if (sim.clutch < 65) { setStatus('Press and hold the clutch before moving the gear lever.'); return; }
    event.preventDefault();
    sim.pointer = event.pointerId;
    sim.dragMoved = false;
    if (sim.gear > 0) sim.lane = Math.floor((sim.gear - 1) / 2);
    else if (sim.gear === -1) sim.lane = 0;
    sim.dragOrigin = { x: event.clientX, y: event.clientY };
    sim.dragStart = position(sim.gear);
    sim.gear = 0;
    if ($('env-gear-readout')) $('env-gear-readout').textContent = 'N';
    if ($('env-drive-direction')) $('env-drive-direction').textContent = 'Stationary';
    setStatus('Move the lever through the neutral gate and release on a marked gear.');
    knob.setPointerCapture?.(event.pointerId);
  });
  knob.addEventListener('pointermove', event => {
    if (sim.pointer !== event.pointerId || !sim.dragOrigin) return;
    const rect = board.getBoundingClientRect();
    const deltaX = event.clientX - sim.dragOrigin.x;
    const deltaY = event.clientY - sim.dragOrigin.y;
    if (Math.hypot(deltaX, deltaY) > 3) sim.dragMoved = true;
    const start = sim.dragStart || position(0);
    const x = clamp(start.x + deltaX / rect.width * 100, 0, 100);
    const y = clamp(start.y + deltaY / rect.height * 100, 0, 100);
    const point = projectToGate(x, y);
    setLever(point, false);
    sim.gear = 0;
    if ($('env-gear-readout')) $('env-gear-readout').textContent = 'N';
  });
  const finishDrag = event => {
    if (sim.pointer !== event.pointerId || !sim.dragOrigin) return;
    const origin = sim.dragOrigin;
    sim.pointer = null;
    sim.dragOrigin = null;
    const start = sim.dragStart || position(0);
    sim.dragStart = null;
    if (!sim.dragMoved) { snapNeutral('Neutral selected · drag the lever to a marked gear.'); return; }
    const rect = board.getBoundingClientRect();
    const x = clamp(start.x + (event.clientX - origin.x) / rect.width * 100, 0, 100);
    const y = clamp(start.y + (event.clientY - origin.y) / rect.height * 100, 0, 100);
    const slot = slotAt(x, y);
    if (slot.distance > 26) { snapNeutral('The lever returned to centered neutral. Release closer to a marked gear to engage it.'); return; }
    if (slot.gear === 0) { snapNeutral('Centered neutral selected.'); return; }
    if (slot.gear > 0) sim.lane = Math.floor((slot.gear - 1) / 2);
    selectGear(slot.gear);
  };
  knob.addEventListener('pointerup', finishDrag);
  knob.addEventListener('pointercancel', () => { sim.pointer = null; sim.dragOrigin = null; sim.dragStart = null; snapNeutral(); });
  knob.addEventListener('lostpointercapture', () => { if (sim.pointer !== null) { sim.pointer = null; sim.dragOrigin = null; sim.dragStart = null; snapNeutral(); } });

  function engineStart() {
    if (sim.engine) return;
    sim.engine = true;
    idleLoopStarted = false;
    sim.paused = false;
    sim.gear = 0; sim.lane = 1; sim.speed = 0; sim.rpm = idle; sim.lastFrame = 0;
    $('env-engine-toggle')?.setAttribute('aria-pressed', 'true');
    $('env-engine-toggle')?.setAttribute('aria-label', 'Stop engine');
    if ($('env-engine-button-label')) $('env-engine-button-label').textContent = 'STOP';
    renderGear();
    setStatus('Engine running · neutral. Use the gear gate to begin.');
    knob.focus({ preventScroll: true });
    idleLoopGain = startSfx ? .08 : .42;
    // Start the loop synchronously in the button gesture so browser autoplay
    // rules cannot block it after the starter sound finishes.
    beginIdleLoop();
    if (stopSfx) { stopSfx.pause(); stopSfx.currentTime = 0; }
    if (startSfx) {
      startSfx.pause(); startSfx.currentTime = 0;
      startSfx.volume = effectiveVolume();
      startSfx.play().catch(releaseIdleLoop);
      clearTimeout(startSfxTimer);
      startSfx.onended = releaseIdleLoop;
      startSfxTimer = setTimeout(() => {
        if (startSfx.paused || startSfx.ended) releaseIdleLoop();
      }, 2600);
    } else releaseIdleLoop();
    $('env-drive-status') && ($('env-drive-status').textContent = 'Engine running · neutral.');
    if ($('env-sim-status')) $('env-sim-status').textContent = 'Engine running · neutral.';
    startLoop();
  }
  function engineStop() {
    if (!sim.engine) return;
    sim.engine = false;
    sim.speed = 0; sim.rpm = idle; sim.gear = 0; sim.lane = 1; sim.fuel = 0; sim.brakeWear = 0;
    setPedal('accelerator', 0); setPedal('brake', 0); setPedal('clutch', 0);
    clearTimeout(startSfxTimer);
    idleLoopStarted = false;
    idleLoopGain = .42;
    startSfx?.pause();
    if (startSfx) startSfx.onended = null;
    if (idleAudio) { idleAudio.pause(); idleAudio.currentTime = idleLoopStart; }
    if (revAudio) { revAudio.pause(); revAudio.currentTime = revLoopStart; }
    $('env-engine-toggle')?.setAttribute('aria-pressed', 'false');
    $('env-engine-toggle')?.setAttribute('aria-label', 'Start engine');
    if ($('env-engine-button-label')) $('env-engine-button-label').textContent = 'START';
    renderGear();
    $('env-drive-status') && ($('env-drive-status').textContent = 'Engine off · neutral.');
    if ($('env-sim-status')) $('env-sim-status').textContent = 'Engine off · simulated readings remain visible.';
    updateScreen(1 / 60);
    if (stopSfx) { stopSfx.volume = effectiveVolume(); stopSfx.currentTime = 0; stopSfx.play().catch(() => {}); }
    stopLoop();
  }
  $('env-engine-toggle')?.addEventListener('click', () => sim.engine ? engineStop() : engineStart());
  $('env-engine-stop')?.addEventListener('click', engineStop);
  $('env-sim-reset')?.addEventListener('click', () => {
    sim.speed = 0; sim.fuel = 0; sim.brakeWear = 0; sim.paused = false;
    setPedal('accelerator', 0); setPedal('brake', 0); setPedal('clutch', 0); snapNeutral('Drive reset · centered neutral.');
    const pause = $('env-sim-pause'); if (pause) pause.textContent = 'Pause simulation';
  });
  $('env-sim-pause')?.addEventListener('click', event => {
    sim.paused = !sim.paused;
    event.currentTarget.textContent = sim.paused ? 'Resume simulation' : 'Pause simulation';
    sim.lastFrame = 0;
    setStatus(sim.paused ? 'Simulation paused.' : 'Simulation resumed.');
    updateScreen(1 / 60);
  });

  function updateScreen(dt = 1 / 60) {
    const absSpeed = Math.abs(sim.speed);
    const throttle = sim.throttle / 100;
    const brake = sim.brake / 100;
    const clutch = sim.clutch / 100;
    const cap = speedCaps[sim.gear] || 0;
    const coupled = sim.gear !== 0 && clutch < .65;
    const wheelRpm = coupled && cap ? idle + absSpeed / cap * (redline - idle) : idle;
    const pedalCurve = throttle > 0 ? Math.pow(throttle, .8) : 0;
    const throttleRpm = idle + pedalCurve * (redline - idle - 280) * (coupled ? .82 : 1);
    const targetRpm = sim.engine ? clamp(Math.max(coupled ? wheelRpm : idle, throttle > .005 ? throttleRpm : idle), idle, redline) : 0;
    sim.rpm += (targetRpm - sim.rpm) * clamp(dt * (clutch >= .65 || !coupled ? 3.3 : 2.5), .02, 1);
    const curve = sim.rpm < 1400 ? .68 + .32 * clamp((sim.rpm - idle) / 620, 0, 1) : sim.rpm <= 3400 ? 1 : 1 - .22 * clamp((sim.rpm - 3400) / (redline - 3400), 0, 1);
    const engineLoad = sim.engine && !sim.paused ? throttle * (coupled ? clamp(.48 + .42 * (1 - absSpeed / Math.max(cap, 1)), .45, .9) : .58) : 0;
    const torque = sim.engine ? Math.round(420 * curve * pedalCurve * (coupled ? .9 : .76)) : 0;
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
    const speedArc = $('env-speed-arc'); if (speedArc) speedArc.style.width = `${clamp(absSpeed / 176 * 100, 0, 100)}%`;
    const rpmArc = $('env-rpm-arc'); if (rpmArc) rpmArc.style.width = `${clamp(sim.rpm / redline * 100, 0, 100)}%`;
    if ($('env-drive-status') && !sim.paused) $('env-drive-status').textContent = sim.gear === 0 && throttle > .03 ? 'In neutral · engine speed rises while the wheels remain still.' : 'Illustrative simulation · no live vehicle data.';
    if (idleAudio && sim.engine) {
      const starterPlaying = startSfx && !startSfx.paused && !startSfx.ended;
      const starterProgress = starterPlaying ? clamp(startSfx.currentTime / Math.max(.1, startSfx.duration || 1), 0, 1) : 1;
      idleLoopGain = .08 + .34 * starterProgress;
    }
    setRevAudio(sim.rpm, engineLoad);
  }
  function frame(now) {
    let dt = 1 / 60;
    if (sim.lastFrame && !sim.paused && sim.engine) {
      dt = Math.min(.05, (now - sim.lastFrame) / 1000);
      const throttle = sim.throttle / 100, brake = sim.brake / 100, speed = Math.abs(sim.speed);
      const clutchOpen = sim.clutch >= 65;
      if (sim.gear === -1) {
        if (throttle && !clutchOpen) sim.speed -= throttle * gearPull[-1] * 9 * dt * clamp(1 - speed / 8, 0, 1);
        if (brake) sim.speed = Math.min(0, sim.speed + brake * (7 + speed * .03) * dt);
        sim.speed = Math.max(-8, sim.speed);
      } else {
        if (sim.speed < 0) sim.speed = Math.min(0, sim.speed + (brake ? 8 : 1.4) * dt);
        else {
          if (sim.gear > 0 && throttle && !clutchOpen) sim.speed += throttle * gearPull[sim.gear] * 9 * dt;
          if (brake) sim.speed = Math.max(0, sim.speed - brake * (8 + speed * .035) * dt);
          if (sim.gear > 0) sim.speed = Math.min(speedCaps[sim.gear], sim.speed);
          else sim.speed = Math.max(0, sim.speed - .3 * dt);
        }
      }
      sim.brakeWear = brake ? clamp(brake * (24 + speed * .62), 0, 100) : Math.max(0, sim.brakeWear - 12 * dt);
      sim.fuel += (.55 + throttle * (1.8 + sim.rpm / redline * 6.2)) * dt / 3600;
    }
    sim.lastFrame = now;
    if (sim.engine && !sim.paused) updateScreen(dt);
    sim.raf = sim.engine && feature.classList.contains('section-modal-active') ? requestAnimationFrame(frame) : 0;
  }
  function startLoop() { if (sim.raf || !feature.classList.contains('section-modal-active')) return; sim.lastFrame = 0; sim.raf = requestAnimationFrame(frame); }
  function stopLoop() { if (sim.raf) cancelAnimationFrame(sim.raf); sim.raf = 0; sim.lastFrame = 0; }
  new MutationObserver(() => {
    if (feature.classList.contains('section-modal-active')) startLoop();
    else { if (sim.engine) engineStop(); stopLoop(); setPedal('accelerator', 0); setPedal('brake', 0); setPedal('clutch', 0); }
  }).observe(feature, { attributes: true, attributeFilter: ['class'] });
  if (feature.classList.contains('section-modal-active')) startLoop();

  const isTyping = target => target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
  document.addEventListener('keydown', event => {
    if (!feature.classList.contains('section-modal-active') || !sim.engine || isTyping(event.target)) return;
    if (sim.shifting) return;
    const key = event.key.toLowerCase();
    if (event.repeat && ['arrowup','arrowdown','arrowleft','arrowright','a','d'].includes(key)) return;
    if (['w', 's', ' ', 'a', 'd', 'r', 'n', 'c', 'shift', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) event.preventDefault();
    if (key === 'w') setPedal('accelerator', 100);
    else if (key === 's' || key === ' ') setPedal('brake', 100);
    else if (key === 'c' || key === 'shift') setPedal('clutch', 100);
    else if (key === 'n') { if (sim.gear === 0) snapNeutral('Centered neutral selected.'); else selectGear(0); }
    else if (key === 'r') selectGear(-1);
    else if (key === 'a' || key === 'd' || key === 'arrowleft' || key === 'arrowright') {
      if (sim.gear !== 0 && sim.clutch < 65) { setStatus('Press and hold the clutch before changing gear lanes.'); return; }
      const currentLane = sim.gear > 0 ? Math.floor((sim.gear - 1) / 2) : sim.lane;
      if (sim.gear !== 0) { sim.gear = 0; renderGear(); setStatus('Centered neutral selected · choose a lane next.'); }
      sim.lane = clamp(currentLane + (key === 'a' || key === 'arrowleft' ? -1 : 1), 0, 2);
      sim.gear = 0;
      renderGear();
      setStatus('Neutral gate · choose an upper or lower gear.');
    }
    else if (key === 'arrowup' || key === 'arrowdown') {
      if (sim.gear !== 0) selectGear(0);
      else selectGear(sim.lane * 2 + (key === 'arrowup' ? 1 : 2));
    }
  });
  document.addEventListener('keyup', event => {
    if (!feature.classList.contains('section-modal-active')) return;
    if (event.key.toLowerCase() === 'w') setPedal('accelerator', 0);
    if (event.key.toLowerCase() === 's' || event.key === ' ') setPedal('brake', 0);
    if (event.key.toLowerCase() === 'c' || event.key === 'Shift') setPedal('clutch', 0);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { setPedal('accelerator', 0); setPedal('brake', 0); setPedal('clutch', 0); } });
  renderGear();
  updateScreen();
})();
