(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const directory = Array.isArray(window.CHASSIS_INDIA_DIRECTORY) ? window.CHASSIS_INDIA_DIRECTORY : [];
  const profiles = typeof curatedIndiaSpecProfiles !== 'undefined' ? curatedIndiaSpecProfiles : [];
  const clean = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Six-speed, small petrol-engine teaching model. These are illustrative ratios and outputs,
  // not a vehicle-specific calibration or a source of live vehicle measurements.
  const redline = 6500;
  const idle = 900;
  const speedCaps = { 1: 55, 2: 95, 3: 145, 4: 185, 5: 225, 6: 270, '-1': 15 };
  const gearPull = { 1: 1, 2: .68, 3: .48, 4: .38, 5: .31, 6: .27, '-1': .32 };
  const laneX = [38, 63, 88];
  const gearPos = gear => {
    if (gear === -1) return { x: 12, y: 22 };
    if (gear === 0) return { x: laneX[shift.lane], y: 50 };
    const index = gear - 1;
    return { x: laneX[Math.floor(index / 2)], y: index % 2 === 0 ? 22 : 78 };
  };
  const shift = { gear: 0, lane: 0, reverseArmed: false, pointerId: null, paused: false, speed: 0, rpm: idle, fuel: 0, brakeWear: 0, pedals: { clutch: 0, brake: 0, accelerator: 0 }, lastFrame: 0 };
  const board = byId('env-shift-board');
  const knob = byId('env-shifter');
  let moveToken = 0;

  function setLever(position, animate = true) {
    if (!knob) return;
    knob.style.transition = animate ? '' : 'none';
    knob.style.left = `${position.x}%`;
    knob.style.top = `${position.y}%`;
    if (!animate) requestAnimationFrame(() => { if (knob) knob.style.transition = ''; });
  }

  function showShiftMessage(message) {
    const status = byId('env-shift-status');
    if (status) status.textContent = message;
  }

  function renderGear() {
    const label = shift.gear === -1 ? 'R' : shift.gear === 0 ? 'N' : String(shift.gear);
    const out = byId('env-gear-readout');
    const direction = byId('env-drive-direction');
    if (out) out.textContent = label;
    if (direction) direction.textContent = shift.gear === -1 ? (shift.speed < -.2 ? 'Reverse' : 'Stopped · reverse') : shift.speed > .2 ? 'Forward' : 'Stationary';
    if (knob) knob.setAttribute('aria-label', `Gear lever. ${shift.gear === 0 ? 'Neutral' : shift.gear === -1 ? 'Reverse' : `Gear ${shift.gear}`}. Use arrow keys to move through the H-pattern. Press U to unlock reverse.`);
    setLever(gearPos(shift.gear));
  }

  function predictedRpm(gear) {
    if (!gear) return shift.rpm;
    const cap = speedCaps[gear] || 55;
    const speed = Math.abs(shift.speed);
    return idle + (speed / cap) * (redline - idle);
  }

  async function shiftTo(target) {
    if (target === shift.gear) return;
    if (target !== 0 && shift.pedals.clutch < 60) {
      showShiftMessage('Press the clutch to at least 60% before selecting a gear.');
      return;
    }
    if (target === -1) {
      if (!shift.reverseArmed) { showShiftMessage('Lift the reverse lockout before selecting R.'); return; }
      if (Math.abs(shift.speed) > .2) { showShiftMessage('Reverse is locked until the car is fully stopped.'); return; }
    }
    if (target > 0 && predictedRpm(target) > redline + 80) {
      showShiftMessage('That downshift would exceed the simulated redline. Slow down first.');
      return;
    }

    const token = ++moveToken;
    const startGear = shift.gear;
    const oldLane = startGear > 0 ? Math.floor((startGear - 1) / 2) : shift.lane;
    const targetLane = target > 0 ? Math.floor((target - 1) / 2) : (target === -1 ? 0 : oldLane);
    const route = [];
    const add = point => {
      const last = route[route.length - 1];
      if (!last || last.x !== point.x || last.y !== point.y) route.push(point);
    };

    if (startGear === -1) add({ x: 12, y: 50 });
    else if (startGear > 0) add({ x: laneX[oldLane], y: 50 });
    else add({ x: laneX[oldLane], y: 50 });

    if (target === -1) {
      add({ x: laneX[0], y: 50 });
      add({ x: laneX[0], y: 22 });
      add({ x: 12, y: 22 });
    } else if (target > 0) {
      if (oldLane !== targetLane || startGear === -1) add({ x: laneX[targetLane], y: 50 });
      add(gearPos(target));
    } else add({ x: laneX[oldLane], y: 50 });

    for (const point of route) {
      if (token !== moveToken) return;
      setLever(point);
      await new Promise(resolve => window.setTimeout(resolve, 105));
    }
    if (token !== moveToken) return;
    shift.gear = target;
    if (target > 0) shift.lane = Math.floor((target - 1) / 2);
    if (target === -1) shift.lane = 0;
    renderGear();
    if (target === 0) showShiftMessage('Neutral selected. Select a lane, then use the clutch to engage a gear.');
    else showShiftMessage(`${target === -1 ? 'Reverse' : `Gear ${target}`} engaged.`);
    const simStatus = byId('env-sim-status');
    if (simStatus) simStatus.textContent = target === 0 ? 'Neutral selected.' : `${target === -1 ? 'Reverse' : `Gear ${target}`} selected · illustrative simulation.`;
  }

  function unlockReverse() {
    shift.reverseArmed = !shift.reverseArmed;
    const button = byId('env-reverse-lock');
    if (button) {
      button.textContent = shift.reverseArmed ? 'Reverse lockout lifted' : 'Lift reverse lockout';
      button.setAttribute('aria-pressed', String(shift.reverseArmed));
    }
    showShiftMessage(shift.reverseArmed ? 'Reverse is armed. Press the clutch and stop before selecting R.' : 'Reverse lockout engaged.');
  }

  function projectToGate(x, y) {
    const width = board?.clientWidth || 2;
    const height = board?.clientHeight || 1;
    const ratio = width / height;
    const segments = [
      [[12, 22], [12, 78]], [[12, 22], [38, 22]],
      [[38, 22], [38, 78]], [[63, 22], [63, 78]], [[88, 22], [88, 78]], [[38, 50], [88, 50]]
    ];
    let best = { x: 38, y: 50, distance: Infinity };
    for (const [[x1, y1], [x2, y2]] of segments) {
      const dx = x2 - x1, dy = y2 - y1;
      const denom = (dx * ratio) ** 2 + dy ** 2 || 1;
      const t = clamp((((x - x1) * ratio) * (dx * ratio) + (y - y1) * dy) / denom, 0, 1);
      const px = x1 + dx * t, py = y1 + dy * t;
      const distance = Math.hypot((x - px) * ratio, y - py);
      if (distance < best.distance) best = { x: px, y: py, distance };
    }
    return best;
  }

  function closestSlot(x, y) {
    const slots = [
      { gear: 0, lane: 0, x: laneX[0], y: 50 }, { gear: 0, lane: 1, x: laneX[1], y: 50 }, { gear: 0, lane: 2, x: laneX[2], y: 50 },
      { gear: -1, x: 12, y: 22 },
      ...[1, 2, 3, 4, 5, 6].map(gear => ({ gear, ...gearPos(gear) }))
    ];
    const ratio = (board?.clientWidth || 2) / (board?.clientHeight || 1);
    return slots.map(slot => ({ ...slot, distance: Math.hypot((x - slot.x) * ratio, y - slot.y) })).sort((a, b) => a.distance - b.distance)[0];
  }

  if (knob && board) {
    knob.addEventListener('pointerdown', event => {
      if (event.button !== undefined && event.button !== 0) return;
      event.preventDefault();
      shift.pointerId = event.pointerId;
      knob.setPointerCapture?.(event.pointerId);
    });
    knob.addEventListener('pointermove', event => {
      if (shift.pointerId !== event.pointerId) return;
      const rect = board.getBoundingClientRect();
      const point = projectToGate(clamp((event.clientX - rect.left) / rect.width * 100, 0, 100), clamp((event.clientY - rect.top) / rect.height * 100, 0, 100));
      setLever(point, false);
    });
    const finishDrag = event => {
      if (shift.pointerId !== event.pointerId) return;
      shift.pointerId = null;
      const rect = board.getBoundingClientRect();
      const x = clamp((event.clientX - rect.left) / rect.width * 100, 0, 100);
      const y = clamp((event.clientY - rect.top) / rect.height * 100, 0, 100);
      const slot = closestSlot(x, y);
      if (slot.distance > 19) { renderGear(); showShiftMessage('Follow the H-pattern rails and release near a gear position.'); return; }
      if (slot.gear === 0) shift.lane = slot.lane;
      shiftTo(slot.gear);
    };
    knob.addEventListener('pointerup', finishDrag);
    knob.addEventListener('pointercancel', () => { shift.pointerId = null; renderGear(); });
    knob.addEventListener('lostpointercapture', () => { if (shift.pointerId !== null) { shift.pointerId = null; renderGear(); } });
    knob.addEventListener('keydown', event => {
      const key = event.key;
      if (key === 'u' || key === 'U') { event.preventDefault(); unlockReverse(); return; }
      if (key === 'Escape') return;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(key)) return;
      event.preventDefault();
      if (key === 'Home') { shiftTo(0); return; }
      const currentLane = shift.gear === -1 ? 0 : shift.gear > 0 ? Math.floor((shift.gear - 1) / 2) : shift.lane;
      if (key === 'ArrowLeft' || key === 'ArrowRight') {
        const nextLane = currentLane + (key === 'ArrowLeft' ? -1 : 1);
        if (nextLane < 0) {
          if (shift.gear === 0 && shift.reverseArmed) shiftTo(-1);
          else showShiftMessage('Reverse is a separate guarded lane. Press U to arm it.');
          return;
        }
        if (nextLane > 2) return;
        const oldGear = shift.gear;
        shift.lane = nextLane;
        if (oldGear > 0) shiftTo(nextLane * 2 + (oldGear % 2 ? 1 : 2));
        else if (oldGear === 0) setLever({ x: laneX[nextLane], y: 50 });
        return;
      }
      const upper = key === 'ArrowUp';
      const target = shift.lane * 2 + (upper ? 1 : 2);
      if (shift.gear === target) { showShiftMessage(`Gear ${target} is already selected.`); return; }
      shiftTo(target);
    });
  }

  byId('env-reverse-lock')?.addEventListener('click', unlockReverse);
  byId('env-neutral')?.addEventListener('click', () => shiftTo(0));

  function setPedal(name, value) {
    const amount = clamp(Number(value) || 0, 0, 100);
    shift.pedals[name] = amount;
    const output = byId(`env-${name}-output`);
    const button = document.querySelector(`.env-pedal[data-pedal="${name}"]`);
    const range = document.querySelector(`[data-pedal-range="${name}"]`);
    if (output) output.textContent = `${Math.round(amount)}%`;
    if (button) {
      button.classList.toggle('is-pressed', amount > 0);
      button.setAttribute('aria-pressed', String(amount > 0));
      button.setAttribute('aria-label', `${amount > 0 ? 'Release' : 'Press'} ${name === 'accelerator' ? 'accelerator' : `${name} pedal`} · ${Math.round(amount)} percent`);
      const fill = button.querySelector('i');
      if (fill) fill.style.height = `${amount * .72}%`;
    }
    if (range && Number(range.value) !== Math.round(amount)) range.value = String(Math.round(amount));
  }

  document.querySelectorAll('.env-pedal[data-pedal]').forEach(button => {
    const name = button.dataset.pedal;
    const release = () => setPedal(name, 0);
    button.addEventListener('pointerdown', event => {
      event.preventDefault();
      setPedal(name, 100);
      button.setPointerCapture?.(event.pointerId);
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('lostpointercapture', release);
    button.addEventListener('keydown', event => {
      if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) { event.preventDefault(); setPedal(name, 100); }
    });
    button.addEventListener('keyup', event => { if (event.key === ' ' || event.key === 'Enter') release(); });
    button.addEventListener('blur', release);
    button.addEventListener('click', event => {
      if (event.detail === 0) setPedal(name, shift.pedals[name] > 0 ? 0 : 100);
    });
  });
  document.querySelectorAll('[data-pedal-range]').forEach(input => input.addEventListener('input', () => setPedal(input.dataset.pedalRange, input.value)));

  function renderSimulation() {
    const speed = Math.abs(shift.speed);
    const throttle = shift.pedals.accelerator / 100;
    const brake = shift.pedals.brake / 100;
    const clutch = shift.pedals.clutch / 100;
    const coupling = shift.gear === 0 ? 0 : 1 - clutch;
    const cap = speedCaps[shift.gear] || 0;
    const coupledRpm = cap ? idle + (speed / cap) * (redline - idle) : idle;
    const freeRpm = idle + throttle * (redline - idle - 250);
    shift.rpm = clamp(cap && coupling > .02 ? Math.max(idle, Math.min(redline, coupledRpm + throttle * 650)) : freeRpm, idle, redline);
    const torqueCurve = clamp(1 - Math.max(0, shift.rpm - 4200) / 4600, .42, 1);
    const torque = Math.round(220 * throttle * torqueCurve * coupling);
    const kw = torque * shift.rpm / 9549;

    const updateText = (id, value) => { const node = byId(id); if (node) node.textContent = value; };
    updateText('env-speed', String(Math.round(speed)));
    updateText('env-rpm', String(Math.round(shift.rpm / 10) * 10));
    updateText('env-power', `${kw.toFixed(1)} kW`);
    updateText('env-torque', `${torque} Nm`);
    updateText('env-fuel', `${shift.fuel.toFixed(2)} L`);
    updateText('env-co2', `${(shift.fuel * 2.35).toFixed(2)} kg`);
    updateText('env-brake-wear', `${Math.round(shift.brakeWear)} / 100`);
    const brakeDustScore = brake * (0.45 + Math.min(1, speed / 120) * 0.55);
    updateText('env-brake-dust', brake === 0 ? 'None' : brakeDustScore >= .65 ? 'High · relative' : brakeDustScore >= .25 ? 'Moderate · relative' : 'Low · relative');
    updateText('env-drive-direction', shift.gear === -1 ? (shift.speed < -.2 ? 'Reverse' : 'Stopped · reverse') : speed > .2 ? 'Forward' : 'Stationary');
    const speedArc = byId('env-speed-arc'); if (speedArc) speedArc.style.width = `${clamp(speed / 270 * 100, 0, 100)}%`;
    const rpmArc = byId('env-rpm-arc'); if (rpmArc) rpmArc.style.width = `${clamp(shift.rpm / redline * 100, 0, 100)}%`;
    const status = byId('env-sim-status');
    if (status && shift.paused) status.textContent = 'Simulation paused.';
    else if (status && shift.gear !== 0 && shift.pedals.clutch >= 60) status.textContent = 'Clutch is disconnecting engine power from the wheels.';
    else if (status && shift.gear === 0 && throttle > .03) status.textContent = 'In neutral: engine speed rises, wheels remain still.';
    else if (status && shift.gear === 1 && speed >= speedCaps[1] - .5) status.textContent = 'First gear speed is constrained. Press clutch and shift up.';
    else if (status) status.textContent = 'Illustrative simulation · no live vehicle data.';
  }

  function frame(timestamp) {
    if (shift.lastFrame && !shift.paused) {
      const dt = Math.min(.05, (timestamp - shift.lastFrame) / 1000);
      const speed = Math.abs(shift.speed);
      const throttle = shift.pedals.accelerator / 100;
      const brake = shift.pedals.brake / 100;
      const clutch = shift.pedals.clutch / 100;
      const coupling = shift.gear === 0 ? 0 : 1 - clutch;
      if (shift.gear === -1) {
        if (throttle && coupling > 0) shift.speed -= throttle * coupling * 8 * dt * clamp(1 - speed / 15, 0, 1);
        if (brake) shift.speed = Math.min(0, shift.speed + brake * (6 + speed * .03) * dt);
        shift.speed = Math.max(-15, shift.speed);
      } else {
        if (shift.speed < 0) shift.speed = Math.min(0, shift.speed + (brake ? 8 : 1.3) * dt);
        else {
          if (shift.gear > 0 && throttle && coupling > 0) shift.speed += throttle * coupling * gearPull[shift.gear] * 10 * dt;
          if (brake) shift.speed = Math.max(0, shift.speed - brake * (8 + speed * .035) * dt);
          if (shift.gear > 0) shift.speed = Math.min(speedCaps[shift.gear], shift.speed);
          else shift.speed = Math.max(0, shift.speed - .35 * dt);
        }
        shift.speed = Math.max(0, shift.speed);
      }
      if (brake > 0) shift.brakeWear = clamp(brake * (24 + speed * .62), 0, 100);
      else shift.brakeWear = Math.max(0, shift.brakeWear - 12 * dt);
      const fuelRateLitresPerHour = .72 + throttle * (2.5 + (shift.rpm / redline) * 8.5);
      shift.fuel += fuelRateLitresPerHour * dt / 3600;
    }
    shift.lastFrame = timestamp;
    renderSimulation();
    rafId = requestAnimationFrame(frame);
  }
  byId('env-sim-pause')?.addEventListener('click', event => {
    shift.paused = !shift.paused;
    event.currentTarget.textContent = shift.paused ? 'Resume simulation' : 'Pause simulation';
    byId('env-sim-status').textContent = shift.paused ? 'Simulation paused.' : 'Simulation resumed.';
    shift.lastFrame = 0;
  });
  byId('env-sim-reset')?.addEventListener('click', () => {
    ++moveToken;
    shift.gear = 0; shift.lane = 0; shift.reverseArmed = false; shift.paused = false; shift.speed = 0; shift.rpm = idle; shift.fuel = 0; shift.brakeWear = 0; shift.lastFrame = 0;
    Object.keys(shift.pedals).forEach(name => setPedal(name, 0));
    const lock = byId('env-reverse-lock'); if (lock) { lock.textContent = 'Lift reverse lockout'; lock.setAttribute('aria-pressed', 'false'); }
    const pause = byId('env-sim-pause'); if (pause) pause.textContent = 'Pause simulation';
    renderGear(); renderSimulation(); showShiftMessage('Press clutch to select a gear.');
    byId('env-sim-status').textContent = 'Reset · stationary in neutral.';
  });
  let rafId = null;
  renderGear();
  renderSimulation();
  const featureSection = byId('environment-feature');
  const startSimulation = () => {
    if (rafId !== null || !featureSection?.classList.contains('section-modal-active')) return;
    shift.lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  };
  const stopSimulation = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    shift.lastFrame = 0;
  };
  if (featureSection) {
    new MutationObserver(() => {
      if (featureSection.classList.contains('section-modal-active')) startSimulation();
      else stopSimulation();
    }).observe(featureSection, { attributes: true, attributeFilter: ['class'] });
    if (featureSection.classList.contains('section-modal-active')) startSimulation();
  }

  // Directory-backed vehicle controls. Unsupported specifications remain explicitly unavailable.
  function fillMake(select, placeholder = 'Choose a make') {
    if (!select) return;
    select.replaceChildren(new Option(placeholder, ''));
    directory.forEach(make => select.add(new Option(make.make, make.make)));
  }
  function selectedMake(value) { return directory.find(make => clean(make.make) === clean(value)) || null; }
  function bindVehicleSelectors(makeSelect, modelSelect, yearSelect, onChange = () => {}) {
    if (!makeSelect || !modelSelect || !yearSelect) return;
    fillMake(makeSelect);
    makeSelect.addEventListener('change', () => {
      const make = selectedMake(makeSelect.value);
      modelSelect.replaceChildren(new Option(make ? 'Choose a model' : 'Choose a make first', ''));
      (make?.models || []).forEach(model => modelSelect.add(new Option(model.name, model.name)));
      modelSelect.disabled = !make;
      yearSelect.replaceChildren(new Option('Choose a model first', ''));
      yearSelect.disabled = true;
      onChange();
    });
    modelSelect.addEventListener('change', () => {
      const make = selectedMake(makeSelect.value);
      const model = make?.models.find(item => clean(item.name) === clean(modelSelect.value));
      const current = new Date().getFullYear();
      const years = model ? Array.from({ length: Math.max(0, Math.min(model.to, current) - model.from + 1) }, (_, index) => Math.min(model.to, current) - index) : [];
      yearSelect.replaceChildren(new Option(model ? 'Choose a year' : 'Choose a model first', ''));
      years.forEach(year => yearSelect.add(new Option(String(year), String(year))));
      yearSelect.disabled = !years.length;
      if (years.length) yearSelect.value = String(years[0]);
      onChange();
    });
    yearSelect.addEventListener('change', onChange);
  }

  function profileFor(makeName, modelName, year) {
    const yearNumber = Number(year) || new Date().getFullYear();
    return profiles.find(profile => clean(profile.make) === clean(makeName) && clean(profile.model) === clean(modelName) && yearNumber >= profile.fromYear && yearNumber <= profile.toYear && !(profile.excludes || []).some(exclude => clean(modelName).includes(clean(exclude)))) || null;
  }
  function findEfficiency(profile, energy) {
    const text = profile?.rows?.find(row => /fuel economy|range|efficiency/i.test(row.name))?.value || '';
    const label = energy === 'petrol' ? 'Petrol' : energy === 'diesel' ? 'Diesel' : 'Electric';
    const match = text.match(new RegExp(`${label}[^0-9]{0,20}([0-9]+(?:\\.[0-9]+)?)\\s*km\\s*\\/\\s*${energy === 'electric' ? 'kWh' : 'L'}`, 'i'));
    return match ? Number(match[1]) : null;
  }

  // Compare 2–4 cars from the India-market directory; only the curated manufacturer data is rendered.
  const selectorHost = byId('env-compare-selectors');
  const compareCars = [];
  function addCompareCar() {
    if (!selectorHost || compareCars.length >= 4) return;
    const number = compareCars.length + 1;
    const fieldset = document.createElement('fieldset');
    const legend = document.createElement('legend'); legend.textContent = `CAR ${String(number).padStart(2, '0')}`;
    const fields = document.createElement('div');
    const make = document.createElement('select'); make.setAttribute('aria-label', `Car ${number} manufacturer`); make.required = true;
    const model = document.createElement('select'); model.setAttribute('aria-label', `Car ${number} model`); model.disabled = true;
    const year = document.createElement('select'); year.setAttribute('aria-label', `Car ${number} model year`); year.disabled = true;
    [ ['Manufacturer', make], ['Model', model], ['Model year', year] ].forEach(([labelText, select]) => {
      const label = document.createElement('label'); label.append(document.createTextNode(labelText), select); fields.append(label);
    });
    fillMake(make);
    bindVehicleSelectors(make, model, year);
    fieldset.append(legend, fields);
    selectorHost.append(fieldset);
    compareCars.push({ make, model, year, fieldset });
    const addButton = byId('env-add-car'); if (addButton) addButton.disabled = compareCars.length >= 4;
  }
  addCompareCar(); addCompareCar();
  byId('env-add-car')?.addEventListener('click', addCompareCar);

  function safeLink(label, url) {
    const link = document.createElement('a');
    link.href = url || '#'; link.textContent = label; link.target = '_blank'; link.rel = 'noopener noreferrer';
    if (!url) { link.removeAttribute('target'); link.removeAttribute('rel'); }
    return link;
  }
  function renderComparison() {
    const target = byId('env-compare-results');
    if (!target) return;
    const selected = compareCars.map(entry => {
      const make = selectedMake(entry.make.value);
      const model = make?.models.find(item => clean(item.name) === clean(entry.model.value));
      return make && model ? { make, model, year: entry.year.value, profile: profileFor(make.make, model.name, entry.year.value) } : null;
    }).filter(Boolean);
    if (selected.length < 2) { target.replaceChildren(Object.assign(document.createElement('p'), { textContent: 'Choose at least two India-market cars before comparing.' })); return; }
    const tableWrap = document.createElement('div'); tableWrap.className = 'env-compare-table-wrap';
    const table = document.createElement('table'); table.className = 'env-compare-table';
    const caption = document.createElement('caption'); caption.className = 'visually-hidden'; caption.textContent = 'Source-backed car comparison'; table.append(caption);
    const head = document.createElement('thead'), headRow = document.createElement('tr');
    const first = document.createElement('th'); first.scope = 'col'; first.textContent = 'DETAIL'; headRow.append(first);
    selected.forEach(car => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = `${car.make.make} ${car.model.name} · ${car.year || 'year not selected'}`; headRow.append(th); });
    head.append(headRow); table.append(head);
    const getData = car => {
      const profile = car.profile;
      const engines = profile?.engines || [];
      const powers = engines.map(engine => Number(engine.powerPS)).filter(Number.isFinite);
      const torques = engines.map(engine => Number.parseFloat(String(engine.torque).replace(',', ''))).filter(Number.isFinite);
      const economy = profile?.rows?.find(row => /fuel economy|range|efficiency/i.test(row.name));
      const petrolEfficiency = findEfficiency(profile, 'petrol');
      const dieselEfficiency = findEfficiency(profile, 'diesel');
      const co2 = petrolEfficiency ? `${(2350 / petrolEfficiency).toFixed(0)} g/km petrol (estimate)` : dieselEfficiency ? `${(2690 / dieselEfficiency).toFixed(0)} g/km diesel (estimate)` : 'Not available';
      return {
        car, engines, powers, torques,
        fuel: engines.length ? [...new Set(engines.map(engine => engine.fuel))].join(' / ') : 'Not available',
        power: powers.length ? `${Math.min(...powers)}–${Math.max(...powers)} PS across listed engines` : 'Not available',
        torque: torques.length ? `${Math.min(...torques)}–${Math.max(...torques)} Nm across listed engines` : 'Not available',
        economy: economy ? `${economy.value}${economy.sourceLabel ? ` · ${economy.sourceLabel}` : ''}` : 'Not available',
        co2,
        source: profile?.performance || profile?.brochure || car.make.url,
        sourceLabel: profile?.sourceLabel || `${car.make.make} official site`,
        sourceNote: profile?.provenance || 'No source-backed specifications for this exact make, model and year are curated in Autonexus.'
      };
    };
    const data = selected.map(getData);
    const rows = [
      ['Fuel / energy', item => item.fuel], ['Published peak power', item => item.power], ['Published peak torque', item => item.torque], ['Published efficiency / range', item => item.economy], ['Tailpipe CO₂ per km', item => item.co2]
    ];
    const tbody = document.createElement('tbody');
    rows.forEach(([labelText, getter]) => {
      const row = document.createElement('tr'); const th = document.createElement('th'); th.scope = 'row'; th.textContent = labelText; row.append(th);
      data.forEach(item => { const td = document.createElement('td'); td.textContent = getter(item); row.append(td); });
      tbody.append(row);
    });
    const sourcesRow = document.createElement('tr'); const sourcesHead = document.createElement('th'); sourcesHead.scope = 'row'; sourcesHead.textContent = 'Source and notes'; sourcesRow.append(sourcesHead);
    data.forEach(item => {
      const td = document.createElement('td');
      td.append(safeLink(item.sourceLabel, item.source));
      const note = document.createElement('p'); note.textContent = item.sourceNote; td.append(note); sourcesRow.append(td);
    });
    tbody.append(sourcesRow); table.append(tbody); tableWrap.append(table);
    target.replaceChildren(tableWrap);

    const scale = document.createElement('div'); scale.className = 'env-power-bars';
    const powerMax = Math.max(1, ...data.flatMap(item => item.powers));
    data.forEach(item => {
      if (!item.powers.length) return;
      const bar = document.createElement('div'); bar.className = 'env-power-bar';
      const label = document.createElement('span'); label.textContent = `${item.car.make.make} ${item.car.model.name}`;
      const track = document.createElement('span'); track.className = 'env-power-bar-track';
      const fill = document.createElement('i'); fill.style.width = `${Math.max(3, Math.max(...item.powers) / powerMax * 100)}%`; track.append(fill);
      const value = document.createElement('strong'); value.textContent = `${Math.max(...item.powers)} PS`;
      bar.append(label, track, value); scale.append(bar);
    });
    if (scale.childElementCount) {
      const note = document.createElement('p'); note.className = 'env-source-note'; note.textContent = 'Bars compare the maximum published power in each selected curated profile; equipment and engine variants differ.';
      target.append(scale, note);
    }
  }
  byId('env-compare-run')?.addEventListener('click', renderComparison);

  // Distance comparison: user-owned assumptions, zero remote calls and no saved inputs.
  const distanceEnergy = byId('env-distance-energy');
  const distanceEfficiency = byId('env-distance-efficiency');
  const distanceMake = byId('env-distance-make');
  const distanceModel = byId('env-distance-model');
  const distanceYear = byId('env-distance-year');
  fillMake(distanceMake, 'Choose a make (optional)');
  if (distanceMake && distanceModel && distanceYear) {
    distanceMake.addEventListener('change', () => {
      const make = selectedMake(distanceMake.value);
      distanceModel.replaceChildren(new Option(make ? 'Choose a model' : 'Choose a make first', ''));
      (make?.models || []).forEach(model => distanceModel.add(new Option(model.name, model.name)));
      distanceModel.disabled = !make; distanceYear.replaceChildren(new Option('Choose a model first', '')); distanceYear.disabled = true;
    });
    distanceModel.addEventListener('change', () => {
      const make = selectedMake(distanceMake.value);
      const model = make?.models.find(item => clean(item.name) === clean(distanceModel.value));
      const maxYear = Math.min(model?.to || 0, new Date().getFullYear());
      const years = model ? Array.from({ length: Math.max(0, maxYear - model.from + 1) }, (_, i) => maxYear - i) : [];
      distanceYear.replaceChildren(new Option(model ? 'Choose a year' : 'Choose a model first', ''));
      years.forEach(year => distanceYear.add(new Option(String(year), String(year)))); distanceYear.disabled = !years.length;
      if (years.length) distanceYear.value = String(years[0]);
      setDistanceProfileDefault();
    });
    distanceYear.addEventListener('change', setDistanceProfileDefault);
  }
  function setDistanceProfileDefault() {
    const make = selectedMake(distanceMake?.value);
    const model = make?.models.find(item => clean(item.name) === clean(distanceModel?.value));
    const profile = make && model ? profileFor(make.make, model.name, distanceYear?.value) : null;
    const value = findEfficiency(profile, distanceEnergy?.value || 'petrol');
    if (value && distanceEfficiency) distanceEfficiency.value = String(value);
  }
  distanceEnergy?.addEventListener('change', setDistanceProfileDefault);

  const currentSlider = byId('env-distance-current');
  const cutSlider = byId('env-distance-cut');
  function updateDistanceLabels() {
    if (!currentSlider || !cutSlider) return;
    const current = Number(currentSlider.value), maxCut = Math.min(500, current);
    cutSlider.max = String(maxCut);
    if (Number(cutSlider.value) > maxCut) cutSlider.value = String(maxCut);
    byId('env-distance-current-output').textContent = `${current.toLocaleString('en-IN')} km`;
    byId('env-distance-cut-output').textContent = `${Number(cutSlider.value).toLocaleString('en-IN')} km`;
  }
  currentSlider?.addEventListener('input', updateDistanceLabels);
  cutSlider?.addEventListener('input', updateDistanceLabels);
  updateDistanceLabels();
  byId('env-distance-form')?.addEventListener('submit', event => {
    event.preventDefault();
    const target = byId('env-distance-results');
    const current = Number(currentSlider?.value), cut = Math.min(Number(cutSlider?.value), current), after = Math.max(0, current - cut);
    const efficiency = Number(distanceEfficiency?.value), energy = distanceEnergy?.value || 'petrol';
    if (!(current >= 0) || !(efficiency > 0)) { target.textContent = 'Enter a valid distance and efficiency to compare.'; return; }
    const unitsBefore = current / efficiency, unitsAfter = after / efficiency, savedUnits = Math.max(0, unitsBefore - unitsAfter);
    const price = Number(byId('env-distance-price')?.value);
    const gridFactor = Number(byId('env-grid-factor')?.value);
    const unitLabel = energy === 'electric' ? 'kWh' : energy === 'diesel' ? 'L diesel' : 'L petrol';
    const factor = energy === 'diesel' ? 2.69 : energy === 'petrol' ? 2.35 : 0;
    const addResult = (label, value, detail) => {
      const card = document.createElement('div'); card.className = 'env-distance-result';
      const title = document.createElement('span'); title.textContent = label;
      const strong = document.createElement('strong'); strong.textContent = value;
      const small = document.createElement('small'); small.textContent = detail;
      card.append(title, strong, small); target.append(card);
    };
    target.replaceChildren();
    addResult('Energy use · current → reduced', `${unitsBefore.toFixed(1)} → ${unitsAfter.toFixed(1)} ${unitLabel}`, `Estimated saving: ${savedUnits.toFixed(1)} ${unitLabel} over ${cut} km.`);
    addResult('Energy cost', price > 0 ? `₹${(unitsBefore * price).toFixed(0)} → ₹${(unitsAfter * price).toFixed(0)}` : 'Add your local price', price > 0 ? `Estimated saving: ₹${(savedUnits * price).toFixed(0)} using your ₹${price}/unit.` : 'No current price is fetched or assumed.');
    if (energy === 'electric') {
      const beforeGrid = gridFactor > 0 ? unitsBefore * gridFactor / 1000 : null;
      const afterGrid = gridFactor > 0 ? unitsAfter * gridFactor / 1000 : null;
      addResult('Tailpipe / grid CO₂', beforeGrid === null ? '0 kg tailpipe CO₂' : `0 kg tailpipe · ${beforeGrid.toFixed(1)} → ${afterGrid.toFixed(1)} kg grid`, beforeGrid === null ? 'EV tailpipe is shown as zero; enter a grid factor to estimate electricity-related CO₂.' : `Estimated grid CO₂ saving: ${(beforeGrid - afterGrid).toFixed(1)} kg using your factor.`);
    } else {
      addResult('Tailpipe CO₂ estimate', `${(unitsBefore * factor).toFixed(1)} → ${(unitsAfter * factor).toFixed(1)} kg`, `Estimated saving: ${(savedUnits * factor).toFixed(1)} kg using ${factor.toFixed(2)} kg CO₂ per litre; no life-cycle effects included.`);
    }
  });
  byId('env-distance-form')?.addEventListener('reset', () => requestAnimationFrame(() => { updateDistanceLabels(); byId('env-distance-results')?.replaceChildren(); distanceModel?.replaceChildren(new Option('Choose a make first', '')); distanceModel.disabled = true; distanceYear?.replaceChildren(new Option('Choose a model first', '')); if (distanceYear) distanceYear.disabled = true; }));
})();
