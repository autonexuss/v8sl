(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const directory = Array.isArray(window.CHASSIS_INDIA_DIRECTORY) ? window.CHASSIS_INDIA_DIRECTORY : [];
  const profiles = typeof curatedIndiaSpecProfiles !== 'undefined' ? curatedIndiaSpecProfiles : [];
  const clean = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // The interactive diesel iMT simulator lives in simulator.js.

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
