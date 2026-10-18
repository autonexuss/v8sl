(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const directory = Array.isArray(window.CHASSIS_INDIA_DIRECTORY) ? window.CHASSIS_INDIA_DIRECTORY : [];
  const profiles = window.chassisCuratedIndiaSpecProfiles || (typeof curatedIndiaSpecProfiles !== 'undefined' ? curatedIndiaSpecProfiles : []);
  const clean = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

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
    const carRecord = { make: { make: makeName }, model: { name: modelName } };
    const sharedProfile = window.chassisCuratedSpecProfileFor?.(carRecord, `${makeName} ${modelName} ${yearNumber}`);
    return sharedProfile || profiles.find(profile => clean(profile.make) === clean(makeName) && clean(profile.model) === clean(modelName) && yearNumber >= profile.fromYear && yearNumber <= profile.toYear && !(profile.excludes || []).some(exclude => clean(modelName).includes(clean(exclude)))) || null;
  }
  function findEfficiency(profile, energy) {
    const text = profile?.rows?.find(row => /fuel economy|range|efficiency/i.test(row.name))?.value || '';
    const label = energy === 'petrol' ? 'Petrol' : energy === 'diesel' ? 'Diesel' : 'Electric';
    const match = text.match(new RegExp(`${label}[^0-9]{0,20}([0-9]+(?:\\.[0-9]+)?)\\s*km\\s*\\/\\s*${energy === 'electric' ? 'kWh' : 'L'}`, 'i'));
    return match ? Number(match[1]) : null;
  }

  // Compare 2–4 cars from the India-market directory using shared curated profiles and public car-search references.
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
    const onSelectionChange = () => {
      compareRequestId += 1;
      const results = byId('env-compare-results');
      if (!results) return;
      const runButton = byId('env-compare-run');
      if (runButton) { runButton.disabled = false; runButton.textContent = 'Compare cars'; }
      const notice = document.createElement('p');
      notice.textContent = 'Your selection changed. Choose Compare cars to refresh the sourced comparison.';
      results.replaceChildren(notice);
    };
    bindVehicleSelectors(make, model, year, onSelectionChange);
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
  let compareRequestId = 0;
  function comparisonPowerPS(value) {
    const text = String(value || '');
    const ps = text.match(/([\d,.]+)\s*(?:PS|CV)\b/i);
    const hp = text.match(/([\d,.]+)\s*(?:bhp|hp)\b/i);
    const kw = text.match(/([\d,.]+)\s*kW\b/i);
    if (ps) return Number(ps[1].replace(/,/g, ''));
    if (hp) return Number(hp[1].replace(/,/g, '')) * 1.01387;
    if (kw) return Number(kw[1].replace(/,/g, '')) * 1.35962;
    return null;
  }
  function comparisonTorqueNm(value) {
    const text = String(value || '');
    const amount = text.match(/([\d,.]+)\s*(?:Nm|N·m|newton.?met(?:er|re)s?)\b/i);
    if (amount) return Number(amount[1].replace(/,/g, ''));
    const knm = text.match(/([\d,.]+)\s*kN(?:m|·m)\b/i);
    if (knm) return Number(knm[1].replace(/,/g, '')) * 1000;
    return null;
  }
  function makeComparisonData(car, lookup) {
    const profile = lookup?.curatedProfile || car.profile || null;
    const publicRows = [...(lookup?.infoboxRows || []), ...(lookup?.vehicleFacts?.rows || [])];
    const profileRows = profile?.rows || [];
    const valueFor = pattern => {
      const exact = profileRows.find(row => pattern.test(row.name));
      if (exact?.value) return String(exact.value) + (exact.sourceLabel ? ' · ' + exact.sourceLabel : '');
      const publicMatch = publicRows.find(row => pattern.test(row.name));
      return publicMatch?.value || 'Not available in the matched search sources';
    };
    const engines = profile?.engines || [];
    const powers = engines.map(engine => Number(engine.powerPS)).filter(value => Number.isFinite(value) && value > 0);
    const torques = engines.map(engine => Number.parseFloat(String(engine.torque).replace(/,/g, ''))).filter(value => Number.isFinite(value) && value > 0);
    const publicPower = valueFor(/nominal power|maximum power|engine power|power output|power/i);
    const publicTorque = valueFor(/torque/i);
    const parsedPower = comparisonPowerPS(publicPower);
    const parsedTorque = comparisonTorqueNm(publicTorque);
    if (!powers.length && parsedPower) powers.push(parsedPower);
    if (!torques.length && parsedTorque) torques.push(parsedTorque);
    const economy = valueFor(/fuel economy|fuel consumption|energy consumption|range|efficiency/i);
    const fuel = engines.length ? [...new Set(engines.map(engine => engine.fuel).filter(Boolean))].join(' / ') : valueFor(/fuel type|fuel|energy source/i);
    const engine = engines.length
      ? engines.map(item => [item.name, item.displacement, item.powerPS ? item.powerPS + ' PS' : '', item.torque, item.transmission].filter(Boolean).join(' · ')).join('; ')
      : [valueFor(/engine|powertrain/i), valueFor(/engine displacement|displacement/i)].filter(value => value !== 'Not available in the matched search sources').join(' · ') || 'Not available in the matched search sources';
    const rowValue = pattern => valueFor(pattern);
    const tailpipe = /electric|battery|bev/i.test(fuel)
      ? '0 g/km tailpipe · electricity generation excluded'
      : (() => {
          const petrolEfficiency = findEfficiency(profile, 'petrol');
          const dieselEfficiency = findEfficiency(profile, 'diesel');
          if (petrolEfficiency) return (2350 / petrolEfficiency).toFixed(0) + ' g/km petrol (estimate)';
          if (dieselEfficiency) return (2690 / dieselEfficiency).toFixed(0) + ' g/km diesel (estimate)';
          return 'Not available';
        })();
    const sourceUrl = profile?.performance || profile?.brochure || lookup?.article?.url || lookup?.vehicleFacts?.source || car.make.url || '';
    const sourceLabel = profile?.sourceLabel || (lookup?.article?.url ? 'Matched model overview' : lookup?.vehicleFacts?.source ? 'Wikidata vehicle record' : car.make.make + ' official site');
    const sourceNote = profile?.provenance || (lookup?.article || lookup?.vehicleFacts || (lookup?.infoboxRows || []).length
      ? 'Public reference data describes a model family and may not match the selected year, engine or trim.'
      : 'No exact technical rows were returned by the car-search references. Use the manufacturer link to verify the selected year and trim.');
    const dimensions = [
      ['Length', rowValue(/^length/i)],
      ['Width', rowValue(/^width/i)],
      ['Height', rowValue(/^height/i)]
    ].filter(([, value]) => value !== 'Not available in the matched search sources').map(([label, value]) => label + ': ' + value).join(' · ');
    return {
      title: car.make.make + ' ' + car.model.name + ' · ' + car.year,
      powers, torques,
      values: {
        engine,
        fuel,
        power: powers.length > 1 ? Math.min(...powers).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + '–' + Math.max(...powers).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' PS across listed engines' : powers.length ? powers[0].toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' PS' : publicPower,
        torque: torques.length > 1 ? Math.min(...torques).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + '–' + Math.max(...torques).toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' Nm across listed engines' : torques.length ? torques[0].toLocaleString('en-IN', { maximumFractionDigits: 0 }) + ' Nm' : publicTorque,
        transmission: engines.length ? [...new Set(engines.map(item => item.transmission).filter(Boolean))].join(' / ') : rowValue(/transmission|gearbox/i),
        economy,
        body: rowValue(/body style|seating|seat capacity|number of seats/i),
        dimensions: dimensions || rowValue(/^dimensions?/i),
        wheelbase: rowValue(/wheelbase/i),
        drive: rowValue(/drivetrain|drive type/i),
        tankAndBoot: [rowValue(/fuel tank/i), rowValue(/boot capacity|luggage capacity/i)].filter(value => value !== 'Not available in the matched search sources').join(' · ') || 'Not available',
        co2: tailpipe
      },
      sourceUrl,
      sourceLabel,
      sourceNote
    };
  }
  async function renderComparison() {
    const target = byId('env-compare-results');
    const runButton = byId('env-compare-run');
    if (!target) return;
    const selected = compareCars.map(entry => {
      const make = selectedMake(entry.make.value);
      const model = make?.models.find(item => clean(item.name) === clean(entry.model.value));
      return make && model && entry.year.value
        ? { make, model, year: entry.year.value, profile: profileFor(make.make, model.name, entry.year.value) }
        : null;
    }).filter(Boolean);
    if (selected.length < 2) {
      const message = document.createElement('p');
      message.textContent = 'Choose a manufacturer, model and model year for at least two cars before comparing.';
      target.replaceChildren(message);
      return;
    }

    const requestId = ++compareRequestId;
    if (runButton) { runButton.disabled = true; runButton.textContent = 'Matching car-search sources…'; }
    const loading = document.createElement('p');
    loading.textContent = 'Matching the selected year to the same curated profiles and public references used by Find a car…';
    target.replaceChildren(loading);

    try {
      const data = await Promise.all(selected.map(async car => {
        let lookup = null;
        if (!car.profile && typeof window.chassisLoadCarComparisonProfile === 'function') {
          try { lookup = await window.chassisLoadCarComparisonProfile(car.make.make, car.model.name, car.year); }
          catch { lookup = null; }
        }
        return makeComparisonData(car, lookup);
      }));
      if (requestId !== compareRequestId) return;

      const wrap = document.createElement('div'); wrap.className = 'env-compare-table-wrap';
      const table = document.createElement('table'); table.className = 'env-compare-table';
      const caption = document.createElement('caption'); caption.className = 'visually-hidden'; caption.textContent = 'India-market car comparison using shared search sources'; table.append(caption);
      const head = document.createElement('thead'), header = document.createElement('tr');
      const first = document.createElement('th'); first.scope = 'col'; first.textContent = 'DETAIL'; header.append(first);
      data.forEach(item => { const th = document.createElement('th'); th.scope = 'col'; th.textContent = item.title; header.append(th); });
      head.append(header); table.append(head);
      const rows = [
        ['Engine / powertrain', item => item.values.engine],
        ['Fuel / energy', item => item.values.fuel],
        ['Published peak power', item => item.values.power],
        ['Published peak torque', item => item.values.torque],
        ['Transmission', item => item.values.transmission],
        ['Published efficiency / range', item => item.values.economy],
        ['Body and seating', item => item.values.body],
        ['Dimensions', item => item.values.dimensions],
        ['Wheelbase', item => item.values.wheelbase],
        ['Drive', item => item.values.drive],
        ['Fuel tank / boot capacity', item => item.values.tankAndBoot],
        ['Tailpipe CO₂', item => item.values.co2]
      ];
      const body = document.createElement('tbody');
      rows.forEach(([labelText, getter]) => {
        const row = document.createElement('tr'), heading = document.createElement('th');
        heading.scope = 'row'; heading.textContent = labelText; row.append(heading);
        data.forEach(item => { const cell = document.createElement('td'); cell.textContent = getter(item); row.append(cell); });
        body.append(row);
      });
      const sources = document.createElement('tr'), sourceHeading = document.createElement('th');
      sourceHeading.scope = 'row'; sourceHeading.textContent = 'Source and data notes'; sources.append(sourceHeading);
      data.forEach(item => {
        const cell = document.createElement('td');
        cell.append(safeLink(item.sourceLabel, item.sourceUrl));
        const note = document.createElement('p'); note.textContent = item.sourceNote; cell.append(note);
        sources.append(cell);
      });
      body.append(sources); table.append(body); wrap.append(table); target.replaceChildren(wrap);

      const scale = document.createElement('div'); scale.className = 'env-power-bars';
      const powerMax = Math.max(1, ...data.flatMap(item => item.powers));
      data.forEach(item => {
        if (!item.powers.length) return;
        const bar = document.createElement('div'); bar.className = 'env-power-bar';
        const label = document.createElement('span'); label.textContent = item.title;
        const track = document.createElement('div'); track.className = 'env-power-track';
        const fill = document.createElement('i'); fill.style.width = Math.max(4, item.powers[0] / powerMax * 100) + '%';
        track.append(fill);
        const value = document.createElement('strong'); value.textContent = Math.round(item.powers[0]).toLocaleString('en-IN') + ' PS';
        bar.append(label, track, value); scale.append(bar);
      });
      if (scale.childElementCount) {
        const note = document.createElement('p'); note.className = 'env-source-note';
        note.textContent = 'Bars compare published peak power from the selected car-search profile or matched public model references. Where only model-family data exists, exact year and trim figures need confirmation.';
        target.append(scale, note);
      } else {
        const note = document.createElement('p'); note.className = 'env-source-note';
        note.textContent = 'Rows without a matched value stay marked as unavailable. No figure is inferred from a nearby model or variant.';
        target.append(note);
      }
    } catch (error) {
      if (requestId !== compareRequestId) return;
      const failure = document.createElement('p');
      failure.textContent = 'The public reference lookup is unavailable right now. Try Compare cars again; selected cars and the manufacturer links remain available.';
      target.replaceChildren(failure);
    } finally {
      if (requestId === compareRequestId && runButton) { runButton.disabled = false; runButton.textContent = 'Compare cars'; }
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
