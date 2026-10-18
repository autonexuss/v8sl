(() => {
  'use strict';

  const REVIEWED = '2026-10-18';
  const SOURCES = {
    fortuner2021: { title: 'Toyota India · 2021 Fortuner launch', url: 'https://www.toyotabharat.com/news/2021/tkm-ushers-in-the-new-year-with-new-fortuner-and-legender.html' },
    fortuner2026: { title: 'Toyota India · 2026 Fortuner Leader Edition', url: 'https://www.toyotabharat.com/news/2026/tkm-introduces-the-2026-fortuner-leader-edition.html' },
    fortunerSpecs: { title: 'Toyota India · Fortuner specifications', url: 'https://www.toyotabharat.com/showroom/fortuner/index-fortuner.html' },
    mg: { title: 'MG Motor India · ZS EV specifications', url: 'https://www.mgmotor.co.in/vehicles/mgzsev-electric-car-in-india' },
    mahindra: { title: 'Mahindra Electric SUV · BE 6 brochure', url: 'https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dw9d7f448a/Be-6e/BE6-Digital-Leaflet.pdf' },
    bee: { title: 'Bureau of Energy Efficiency · EV FAQs', url: 'https://beeindia.gov.in/view_content.php?lang=1&lid=70' },
    mgLaunch: { title: 'MG Motor India · ZS EV 2022 launch', url: 'https://www.mgmotor.co.in/media-center/newsroom/mg-motor-india-strengthens-its-commitment-to-electric-mobility-in-india' },
    traffic: { title: 'Delhi Traffic Police · General safety guidelines', url: 'https://staging.parivahan.gov.in/delhitrafficpolice//en/node/88' },
    toyotaTyre: { title: 'Toyota Owners · Tire inflation pressure', url: 'https://www.toyota.com/owners/warranty-owners-manuals/digital/article/rav4/2024/om42f42u/ch06se030406/' },
    toyotaTpms: { title: 'Toyota Owners · TPMS and tire maintenance', url: 'https://www.toyota.com/owners/warranty-owners-manuals/digital/article/rav4-prime/2023/om42e79u/ch08se020403/' }
  };

  // A deliberately small, auditable starter catalog. It is not an all-India vehicle history database.
  const PRICE = [{
    make: 'Toyota', models: [{
      name: 'Fortuner', years: [
        { year: 2021, generation: '2021 launch facelift', variants: [{ name: '2.8 L 2WD Diesel Manual', amount: 3248000, valid: '2021-01-06', source: 'fortuner2021', note: 'Toyota launch ex-showroom price; same nationally except Kerala.' }] },
        { year: 2026, generation: '2026 Leader Edition', variants: [{ name: '2.8 L 4x2 Diesel Manual · Leader Edition', amount: 3651000, valid: '2026-10-09', source: 'fortuner2026', note: 'Toyota launch ex-showroom price; Leader Edition equipment differs from the 2021 standard Fortuner.' }] }
      ]
    }]
  }];

  const EVS = [
    { id: 'zs', name: 'MG ZS EV · 50.3 kWh', battery: 50.3, range: 461, cycle: 'certified range (manufacturer stated)', source: 'mg', year: '2025 model page', note: 'Manufacturer page states 50.3 kWh and 461 km certified range. Actual trip range varies.' },
    { id: 'be6', name: 'Mahindra BE 6 · 79 kWh', battery: 79, range: 683, cycle: 'MIDC P1 + P2 certified range', source: 'mahindra', year: '2025 brochure', note: 'Manufacturer brochure states 79 kWh and 683 km MIDC range. Actual trip range varies.' }
  ];

  // Questions use direct official sources and restrained wording. Review date is stored per item.
  const QUESTIONS = [
    { c: 'EVs', claim: 'A battery-electric car has zero tailpipe emissions while it is being driven.', fact: true, why: 'BEE describes battery-operated vehicles as having zero tailpipe emissions. This says nothing about electricity generation or lifecycle emissions.', src: 'bee' },
    { c: 'EVs', claim: 'Charging time can vary between a fast charger and a household 15 A connection.', fact: true, why: 'BEE gives very different illustrative charging times for fast and slow/moderate charging. The exact time depends on the vehicle and charger.', src: 'bee' },
    { c: 'EVs', claim: 'Home charging costs the same in every Indian state.', fact: false, why: 'BEE says home-charge cost varies with the notified state EV tariff and the vehicle battery capacity.', src: 'bee' },
    { c: 'EVs', claim: 'A certified range guarantees the same distance in every real-world drive.', fact: false, why: 'MG labels its range as certified and says actual performance can vary with driving pattern and speed.', src: 'mg' },
    { c: 'EVs', claim: 'The size of an EV battery, by itself, is enough to calculate its exact charging time.', fact: false, why: 'BEE distinguishes charging approaches and rates; charger power and the charging system affect the time.', src: 'bee' },
    { c: 'Maintenance', claim: 'A tyre-pressure monitoring system replaces routine tyre-pressure checks.', fact: false, why: 'Toyota says TPMS does not replace routine checks and the driver remains responsible for correct pressure.', src: 'toyotaTpms' },
    { c: 'Maintenance', claim: 'Toyota says the recommended cold pressure is vehicle-specific and shown on its tyre/loading label.', fact: true, why: 'The Toyota owner manual directs drivers to the vehicle label for the recommended cold pressure.', src: 'toyotaTyre' },
    { c: 'Maintenance', claim: 'For the cited Toyota manual, a tyre is considered cold after at least three hours parked or under one mile driven.', fact: true, why: 'That manual gives those conditions for obtaining an accurate cold-pressure reading. Follow your own vehicle manual.', src: 'toyotaTyre' },
    { c: 'Maintenance', claim: 'Every car should use the maximum pressure printed on the tyre sidewall as its normal pressure.', fact: false, why: 'Toyota points to the vehicle’s recommended cold pressure on the tyre/loading label, rather than treating the sidewall maximum as the vehicle setting.', src: 'toyotaTyre' },
    { c: 'Maintenance', claim: 'Toyota’s cited manual recommends checking tyre pressure at least once a month.', fact: true, why: 'The cited Toyota manual says monthly at minimum and notes a more frequent interval in its recommendation. Check the manual for your own car.', src: 'toyotaTyre' },
    { c: 'Safety', claim: 'All occupants should wear seat belts while travelling in a car.', fact: true, why: 'Delhi Traffic Police advises the driver and all passengers to use seat belts at all times.', src: 'traffic' },
    { c: 'Safety', claim: 'Using a mobile phone while driving can divert a driver’s attention.', fact: true, why: 'Delhi Traffic Police lists mobile-phone use and other distractions as something to avoid while driving.', src: 'traffic' },
    { c: 'Safety', claim: 'Driving after alcohol or drugs is safe if the journey is short.', fact: false, why: 'Delhi Traffic Police says never to drive under the influence because it impairs judgement and reaction time.', src: 'traffic' },
    { c: 'Safety', claim: 'Traffic signs, signals and road markings should be obeyed even when the road looks quiet.', fact: true, why: 'Delhi Traffic Police advises road users to follow traffic rules and signals; quiet conditions do not cancel them.', src: 'traffic' },
    { c: 'Safety', claim: 'Checking brakes, tyres, lights and signals helps keep a vehicle roadworthy.', fact: true, why: 'Delhi Traffic Police includes regular checks of these items in its general safety guidelines.', src: 'traffic' },
    { c: 'Automotive basics', claim: 'Toyota’s 2021 India launch listed 204 PS and 420 Nm for the Fortuner 2.8 L diesel manual.', fact: true, why: 'Toyota’s launch announcement states 204 PS and 420 Nm for manual-transmission diesel variants.', src: 'fortuner2021' },
    { c: 'Automotive basics', claim: 'The 2021 India Fortuner 2.8 L diesel was offered with a six-speed manual transmission.', fact: true, why: 'Toyota’s 2021 launch release lists a six-speed manual for the 2.8 L diesel.', src: 'fortuner2021' },
    { c: 'Automotive basics', claim: 'Toyota’s 2021 release listed 500 Nm for the Fortuner diesel automatic and 420 Nm for the manual.', fact: true, why: 'The release gives these separate figures for the automatic and manual diesel variants.', src: 'fortuner2021' },
    { c: 'Automotive basics', claim: 'Toyota’s 2021 launch price for the Fortuner 2.8 L 2WD diesel manual was ₹32.48 lakh ex-showroom.', fact: true, why: 'Toyota’s dated launch release lists ₹32,48,000 for this variant, with Kerala noted as an exception to the national price.', src: 'fortuner2021' },
    { c: 'Automotive basics', claim: 'The 2021 India Fortuner 2.7 L petrol lineup included a five-speed manual option.', fact: true, why: 'Toyota’s 2021 launch announcement lists a five-speed manual for the 2.7 L petrol lineup.', src: 'fortuner2021' }
  ].map((q, i) => ({ ...q, id: i + 1, reviewed: REVIEWED }));

  const main = document.querySelector('main');
  if (!main || document.getElementById('car-price-history')) return;
  const before = document.getElementById('about');
  const put = html => { const box = document.createElement('template'); box.innerHTML = html.trim(); const node = box.content.firstElementChild; node.classList.add('shell-section-closed'); main.insertBefore(node, before || null); return node; };
  const panelHead = (eyebrow, title, text) => `<header class="nf-heading"><div class="eyebrow"><i></i>${eyebrow}</div><h2>${title}</h2><p>${text}</p></header>`;

  put(`<section class="new-feature-panel section-wrap" id="car-price-history" aria-labelledby="price-history-title">
    ${panelHead('INDIA · DATED NEW-CAR PRICES', 'Car Price History', 'Compare a dated manufacturer launch price with a later new-car price. Prices use the same ex-showroom basis and link to the source announcement.')}
    <div class="nf-layout nf-price-layout"><form class="nf-card nf-form" id="price-history-form"><div class="nf-coverage"><strong>Starter coverage · not exhaustive</strong><span>Only source-checked vehicles in this small dataset appear in the dropdowns.</span></div>
      <label>Brand / make<select id="ph-make" required><option value="">Choose a brand</option></select></label>
      <label>Model<select id="ph-model" required disabled><option value="">Choose a brand first</option></select></label>
      <label>Model year<select id="ph-year" required disabled><option value="">Choose a model first</option></select></label>
      <label>Variant / trim<select id="ph-variant" required disabled><option value="">Choose a model year first</option></select></label>
      <p class="nf-note">This is not a complete India-market price archive. Autonexus currently has a source-checked Toyota Fortuner example. Unlisted vehicles are not guessed or treated as verified.</p>
      <button class="nf-primary" type="submit">Compare dated prices <span aria-hidden="true">↗</span></button>
    </form><div class="nf-card nf-output" id="price-history-result" role="status" aria-live="polite"><span class="nf-kicker">PRICE COMPARISON</span><h3>Select a verified model, year and variant.</h3><p>Manufacturer prices are ex-showroom. City taxes, registration, insurance, discounts and on-road totals are not included.</p></div></div>
  </section>`);

  put(`<section class="new-feature-panel section-wrap" id="ev-range-adventure" aria-labelledby="ev-range-title">
    ${panelHead('PLAN A SCENARIO · NOT LIVE TELEMETRY', 'EV Range Adventure', 'Choose a published EV profile and explore how different trip assumptions change a simplified range estimate. No route, weather, traffic or charger API is connected.')}
    <div class="nf-layout nf-ev-layout"><form class="nf-card nf-form" id="ev-range-form">
      <label>Electric vehicle<select id="ev-profile" required></select></label><p class="nf-source-line" id="ev-profile-source"></p>
      <label>Starting battery <output id="ev-start-output">80%</output><input id="ev-start" type="range" min="10" max="100" step="1" value="80"></label>
      <label>Trip distance <output id="ev-distance-output">120 km</output><input id="ev-distance" type="range" min="10" max="600" step="5" value="120"></label>
      <label>Average speed <output id="ev-speed-output">80 km/h</output><input id="ev-speed" type="range" min="30" max="120" step="5" value="80"></label>
      <label>Weather<select id="ev-weather"><option value="mild">Mild</option><option value="hot">Hot</option><option value="cold">Cool</option></select></label>
      <label>Route terrain<select id="ev-terrain"><option value="flat">Mostly flat</option><option value="hilly">Hilly</option></select></label>
      <label>Air conditioning<select id="ev-ac"><option value="on">On</option><option value="off">Off</option></select></label>
      <label>Passenger and cargo load<select id="ev-load"><option value="light">Light</option><option value="medium" selected>Typical</option><option value="heavy">Heavy</option></select></label>
      <div class="nf-actions"><button class="nf-primary" id="ev-start-trip" type="button">Start adventure</button><button class="nf-secondary" id="ev-pause-trip" type="button" disabled>Pause</button><button class="nf-secondary" id="ev-reset-trip" type="button">Reset</button></div>
    </form><div class="nf-card nf-output nf-ev-output"><span class="nf-kicker">TRIP ESTIMATE</span><h3 id="ev-trip-status" aria-live="polite">Ready when you are.</h3><div class="nf-progress"><i id="ev-trip-progress"></i></div><div class="nf-metrics"><div><span>Trip energy</span><strong id="ev-energy">—</strong></div><div><span>Arrival battery</span><strong id="ev-arrival">—</strong></div><div><span>Estimated remaining range</span><strong id="ev-remaining">—</strong></div></div><p id="ev-reachability" class="nf-reachability">Adjust the trip conditions, then start the scenario.</p><p class="nf-note">Educational estimate only. It divides the published battery capacity by the manufacturer-stated test-cycle range, then applies explicitly illustrative multipliers: speed, weather, hills, HVAC and payload. These modifiers are not calibrated test data and do not predict an individual trip.</p><p class="nf-source-line" id="ev-model-note"></p></div></div>
  </section>`);

  put(`<section class="new-feature-panel section-wrap" id="parking-precision" aria-labelledby="parking-title">
    ${panelHead('ARCADE · LEARN THE CONTROLS', 'Parking Precision', 'Guide an illustrative top-down car into the marked bay. This is a small arcade challenge, not a real vehicle dynamics or parking-distance simulator.')}
    <div class="nf-card nf-game-card"><div class="nf-game-toolbar"><label>Layout<select id="parking-level"><option value="beginner">Beginner</option><option value="standard">Standard</option><option value="precision">Precision</option></select></label><div class="nf-game-stats"><span id="parking-state" role="status" aria-live="polite">Ready · focus the playfield for keyboard controls</span><span>Time <b id="parking-time">0.0 s</b></span><span>Hits <b id="parking-hits">0</b></span></div></div>
      <canvas id="parking-canvas" width="900" height="500" tabindex="0" role="application" aria-label="Parking Precision game. Focus this playfield, then use arrow keys or WASD to steer and move. Aim for the marked bay." ></canvas>
      <div class="nf-actions"><button class="nf-primary" id="parking-start" type="button">Start</button><button class="nf-secondary" id="parking-pause" type="button" disabled>Pause</button><button class="nf-secondary" id="parking-reset" type="button">Restart</button></div>
      <div class="nf-game-help"><p><strong>Keyboard</strong> · WASD or arrow keys to steer/move · Space to brake. Click the playfield first. Keys are ignored while typing in fields.</p><p><strong>Touch</strong> · Hold a control below. Score starts at 1,000; time costs 4 points per second, each collision costs 100, and precise alignment earns up to 150 bonus points.</p></div>
      <div class="nf-touch-controls" aria-label="Touch driving controls"><button type="button" data-drive="left" aria-label="Steer left">←</button><button type="button" data-drive="forward" aria-label="Move forward">↑</button><button type="button" data-drive="brake" aria-label="Brake">■</button><button type="button" data-drive="reverse" aria-label="Reverse">↓</button><button type="button" data-drive="right" aria-label="Steer right">→</button></div>
      <div class="nf-game-result" id="parking-result" role="status" aria-live="polite"></div>
    </div>
  </section>`);

  put(`<section class="new-feature-panel section-wrap" id="myth-or-fact" aria-labelledby="myth-title">
    ${panelHead('SOURCED · SHORT AND REPLAYABLE', 'Myth or Fact?', 'A quick automotive knowledge game. Each answer includes a short explanation and a direct source link. Claims are limited to the cited vehicle or context where relevant.')}
    <div class="nf-layout nf-quiz-layout"><div class="nf-card nf-quiz-controls"><label>Question category<select id="quiz-category"><option value="All">All categories</option><option>EVs</option><option>Maintenance</option><option>Safety</option><option>Automotive basics</option></select></label><label class="nf-check-label"><input id="quiz-timed" type="checkbox"> Timed round · 15 seconds per question</label><div class="nf-actions"><button class="nf-primary" id="quiz-new" type="button">New round</button><button class="nf-secondary" id="quiz-replay" type="button">Replay round</button></div><p id="quiz-score" class="nf-score" aria-live="polite">Score 0 · streak 0 · best 0</p><p class="nf-note">Twenty reviewed starter claims · five per category. Best score is stored locally in this browser only.</p></div>
      <article class="nf-card nf-question" aria-live="polite"><div class="nf-question-top"><span id="quiz-counter">Question 1</span><span id="quiz-timer" hidden>15</span></div><h3 id="quiz-claim"></h3><div class="nf-actions nf-answer-actions"><button class="nf-primary" id="quiz-fact" type="button">Fact</button><button class="nf-secondary" id="quiz-myth" type="button">Myth</button></div><div id="quiz-feedback" class="nf-feedback" hidden></div><button class="nf-secondary" id="quiz-next" type="button" hidden>Next question</button></article></div>
  </section>`);

  const fmtINR = n => `₹${Number(n).toLocaleString('en-IN')}`;
  const option = (label, value = label) => { const o = document.createElement('option'); o.textContent = label; o.value = value; return o; };
  const linkFor = key => SOURCES[key];
  const safeAnchor = (source, label) => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${label || source.title} ↗</a>`;

  // Cascading, verified-only price selectors.
  const make = document.getElementById('ph-make'), model = document.getElementById('ph-model'), year = document.getElementById('ph-year'), variant = document.getElementById('ph-variant');
  PRICE.forEach(entry => make.add(option(entry.make, entry.make)));
  const resetSelect = (select, placeholder, disabled = true) => { select.replaceChildren(option(placeholder, '')); select.disabled = disabled; };
  make.addEventListener('change', () => {
    const entry = PRICE.find(item => item.make === make.value);
    resetSelect(model, entry ? 'Choose a model' : 'Choose a brand first', !entry);
    (entry?.models || []).forEach(item => model.add(option(item.name, item.name)));
    resetSelect(year, 'Choose a model first'); resetSelect(variant, 'Choose a model year first');
  });
  model.addEventListener('change', () => {
    const entry = PRICE.find(item => item.make === make.value)?.models.find(item => item.name === model.value);
    resetSelect(year, entry ? 'Choose a model year' : 'Choose a model', !entry);
    (entry?.years || []).forEach(item => year.add(option(`${item.year} · ${item.generation}`, String(item.year))));
    resetSelect(variant, 'Choose a model year first');
  });
  year.addEventListener('change', () => {
    const record = PRICE.find(item => item.make === make.value)?.models.find(item => item.name === model.value)?.years.find(item => String(item.year) === year.value);
    resetSelect(variant, record ? 'Choose a variant' : 'Choose a model year', !record);
    (record?.variants || []).forEach((item, i) => variant.add(option(item.name, String(i))));
  });
  document.getElementById('price-history-form').addEventListener('submit', event => {
    event.preventDefault();
    const chosen = PRICE.find(item => item.make === make.value)?.models.find(item => item.name === model.value)?.years.find(item => String(item.year) === year.value);
    const old = chosen?.variants[Number(variant.value)];
    const result = document.getElementById('price-history-result');
    if (!old) { result.innerHTML = '<span class="nf-kicker">NO VERIFIED MATCH</span><h3>Price data unavailable.</h3><p>Choose a listed option. Autonexus will not infer an unlisted car or trim.</p>'; return; }
    const latest = PRICE.find(item => item.make === make.value)?.models.find(item => item.name === model.value)?.years.at(-1)?.variants[0];
    const oldSource = linkFor(old.source), latestSource = linkFor(PRICE[0].models[0].years.at(-1).variants[0].source);
    const change = latest.amount - old.amount, percent = change / old.amount * 100;
    const sameYear = chosen.year === PRICE[0].models[0].years.at(-1).year;
    result.innerHTML = `<span class="nf-kicker">DATED EX-SHOWROOM COMPARISON · INDIA</span><h3>${make.value} ${model.value}</h3><div class="nf-price-pair"><div><span>${chosen.year} · ${old.name}</span><strong>${fmtINR(old.amount)}</strong><small>${old.valid} · manufacturer launch price</small>${safeAnchor(oldSource)}</div><div><span>${sameYear ? 'Current listed selection' : `${PRICE[0].models[0].years.at(-1).year} · ${latest.name}`}</span><strong>${fmtINR(latest.amount)}</strong><small>${PRICE[0].models[0].years.at(-1).variants[0].valid} · manufacturer launch price</small>${safeAnchor(latestSource)}</div></div><div class="nf-change"><span>Nominal change${sameYear ? ' for the same selected year' : ' · cross-edition comparison'}</span><strong>${change >= 0 ? '+' : '−'}${fmtINR(Math.abs(change))} · ${change >= 0 ? '+' : '−'}${Math.abs(percent).toFixed(1)}%</strong></div><p class="nf-note">${old.note} ${sameYear ? 'The selected entry is also the latest entry in this dataset.' : 'The 2021 standard Fortuner and 2026 Leader Edition are not like-for-like trims; equipment and model-year differences mean this is a cross-edition nominal comparison, not an inflation-adjusted or same-variant price change.'} No longer-sold trims do not receive an invented current new-car price.</p>`;
  });

  // EV range scenario: certified battery/range data, with explicitly illustrative input multipliers.
  const evSelect = document.getElementById('ev-profile'), evSource = document.getElementById('ev-profile-source');
  EVS.forEach(car => evSelect.add(option(car.name, car.id)));
  const getEV = () => EVS.find(car => car.id === evSelect.value) || EVS[0];
  const evIds = ['ev-start', 'ev-distance', 'ev-speed'];
  const evOut = id => document.getElementById(`${id}-output`);
  let tripTimer = 0, tripProgress = 0, tripRunning = false;
  function updateEV() {
    const car = getEV();
    evSource.innerHTML = `${car.battery} kWh · ${car.range} km ${car.cycle} · ${safeAnchor(linkFor(car.source))}`;
    const start = Number(document.getElementById('ev-start').value), distance = Number(document.getElementById('ev-distance').value), speed = Number(document.getElementById('ev-speed').value);
    evOut('ev-start').textContent = `${start}%`; evOut('ev-distance').textContent = `${distance} km`; evOut('ev-speed').textContent = `${speed} km/h`;
    const weather = document.getElementById('ev-weather').value, terrain = document.getElementById('ev-terrain').value, ac = document.getElementById('ev-ac').value, load = document.getElementById('ev-load').value;
    const factors = { speed: Math.max(.88, Math.min(1.45, 1 + (speed - 60) * .003)), weather: weather === 'mild' ? 1 : 1.09, terrain: terrain === 'hilly' ? 1.13 : 1, ac: ac === 'on' ? 1.08 : 1, load: load === 'light' ? .98 : load === 'heavy' ? 1.1 : 1.04 };
    const kwhPerKm = car.battery / car.range * Object.values(factors).reduce((a, b) => a * b, 1);
    const usable = car.battery * start / 100, need = distance * kwhPerKm, arrival = usable - need;
    const arrivalPct = Math.max(0, arrival) / car.battery * 100;
    const remaining = Math.max(0, arrival) / kwhPerKm;
    document.getElementById('ev-energy').textContent = `${need.toFixed(1)} kWh`;
    document.getElementById('ev-arrival').textContent = arrival < 0 ? 'Below 0% · not reachable' : `${arrivalPct.toFixed(0)}%`;
    document.getElementById('ev-remaining').textContent = `${remaining.toFixed(0)} km`;
    document.getElementById('ev-reachability').textContent = arrival >= 0 ? `Reachable under these simplified assumptions · modifiers: speed ×${factors.speed.toFixed(2)}, weather ×${factors.weather.toFixed(2)}, terrain ×${factors.terrain.toFixed(2)}, HVAC ×${factors.ac.toFixed(2)}, load ×${factors.load.toFixed(2)}.` : 'This scenario exceeds the starting energy estimate. Reduce distance or conditions that increase estimated use.';
    document.getElementById('ev-model-note').innerHTML = `${car.note} ${safeAnchor(linkFor(car.source))}`;
    return { distance, arrival, arrivalPct };
  }
  evIds.concat(['ev-weather', 'ev-terrain', 'ev-ac', 'ev-load']).forEach(id => document.getElementById(id).addEventListener('input', updateEV));
  document.getElementById('ev-profile').addEventListener('change', updateEV);
  updateEV();
  function stopEV(reset) { clearInterval(tripTimer); tripTimer = 0; tripRunning = false; document.getElementById('ev-pause-trip').textContent = 'Pause'; document.getElementById('ev-pause-trip').disabled = true; if (reset) { tripProgress = 0; document.getElementById('ev-trip-status').textContent = 'Ready when you are.'; } document.getElementById('ev-trip-progress').style.width = `${tripProgress * 100}%`; }
  document.getElementById('ev-start-trip').addEventListener('click', () => {
    if (tripRunning) return;
    if (tripProgress >= 1) tripProgress = 0;
    const estimate = updateEV(); tripRunning = true;
    const status = document.getElementById('ev-trip-status'); status.textContent = 'Adventure in progress · estimated trip';
    const pause = document.getElementById('ev-pause-trip'); pause.disabled = false; pause.textContent = 'Pause';
    const duration = Math.max(8, Math.min(36, estimate.distance / 4)); let last = performance.now();
    tripTimer = window.setInterval(() => { const now = performance.now(), dt = Math.min(.2, (now - last) / 1000); last = now; tripProgress = Math.min(1, tripProgress + dt / duration); document.getElementById('ev-trip-progress').style.width = `${tripProgress * 100}%`; if (tripProgress >= 1) { stopEV(false); status.textContent = estimate.arrival >= 0 ? `Trip complete · estimated arrival ${estimate.arrivalPct.toFixed(0)}%` : 'Trip simulation complete · energy estimate falls short.'; } }, 80);
  });
  document.getElementById('ev-pause-trip').addEventListener('click', event => { if (tripRunning) { clearInterval(tripTimer); tripTimer = 0; tripRunning = false; event.currentTarget.textContent = 'Resume'; document.getElementById('ev-trip-status').textContent = 'Paused · resume when ready.'; } else if (tripProgress > 0 && tripProgress < 1) { document.getElementById('ev-start-trip').click(); } });
  document.getElementById('ev-reset-trip').addEventListener('click', () => stopEV(true));

  // Time-step-based parking game. Keyboard listeners are scoped to the focused canvas.
  const canvas = document.getElementById('parking-canvas'), ctx = canvas.getContext('2d'), game = { running: false, paused: false, x: 112, y: 245, angle: 0, speed: 0, hits: 0, time: 0, raf: 0, last: 0, keys: new Set(), cones: [] };
  const parkingLevel = document.getElementById('parking-level');
  const levelCones = { beginner: [], standard: [{ x: 390, y: 172 }, { x: 390, y: 326 }], precision: [{ x: 350, y: 150 }, { x: 350, y: 350 }, { x: 475, y: 143 }, { x: 475, y: 357 }] };
  function resetGame() { game.running = false; game.paused = false; game.x = 112; game.y = 245; game.angle = 0; game.speed = 0; game.hits = 0; game.time = 0; game.keys.clear(); game.cones = (levelCones[parkingLevel.value] || []).map(p => ({ ...p })); document.getElementById('parking-start').textContent = 'Start'; document.getElementById('parking-start').disabled = false; document.getElementById('parking-pause').disabled = true; document.getElementById('parking-pause').textContent = 'Pause'; document.getElementById('parking-state').textContent = 'Ready · focus the playfield for keyboard controls'; document.getElementById('parking-time').textContent = '0.0 s'; document.getElementById('parking-hits').textContent = '0'; document.getElementById('parking-result').textContent = ''; drawGame(); }
  function drawGame() {
    const w = canvas.width, h = canvas.height; ctx.clearRect(0, 0, w, h);
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#172127'); g.addColorStop(1, '#25343a'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ffffff0d'; ctx.lineWidth = 1; for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
    ctx.fillStyle = '#ffffff08'; ctx.fillRect(0, 85, w, 330);
    ctx.setLineDash([10, 9]); ctx.strokeStyle = '#f5dfaa'; ctx.lineWidth = 5; ctx.strokeRect(610, 160, 160, 180); ctx.setLineDash([]);
    ctx.fillStyle = '#f5dfaa'; ctx.font = 'bold 16px system-ui'; ctx.fillText('PARK HERE', 646, 150);
    for (const cone of game.cones) { ctx.fillStyle = '#f19a62'; ctx.beginPath(); ctx.moveTo(cone.x, cone.y - 14); ctx.lineTo(cone.x - 12, cone.y + 12); ctx.lineTo(cone.x + 12, cone.y + 12); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#ffe0c8'; ctx.stroke(); }
    ctx.save(); ctx.translate(game.x, game.y); ctx.rotate(game.angle); ctx.fillStyle = '#0007'; ctx.beginPath(); ctx.ellipse(0, 5, 31, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#d9e2e4'; ctx.beginPath(); ctx.roundRect(-34, -17, 68, 34, 9); ctx.fill(); ctx.fillStyle = '#314853'; ctx.beginPath(); ctx.roundRect(-13, -13, 26, 26, 6); ctx.fill(); ctx.fillStyle = '#fff4cb'; ctx.fillRect(29, -10, 4, 7); ctx.fillRect(29, 3, 4, 7); ctx.fillStyle = '#e47d69'; ctx.fillRect(-33, -10, 4, 7); ctx.fillRect(-33, 3, 4, 7); ctx.restore();
  }
  function tickGame(now) {
    if (!game.running || !canvas.closest('#parking-precision')?.classList.contains('section-modal-active')) { game.raf = 0; return; }
    const dt = game.last ? Math.min(.04, (now - game.last) / 1000) : 0; game.last = now; game.time += dt;
    const forward = game.keys.has('w') || game.keys.has('arrowup') || game.keys.has('forward'); const reverse = game.keys.has('s') || game.keys.has('arrowdown') || game.keys.has('reverse'); const braking = game.keys.has(' ') || game.keys.has('brake');
    if (forward) game.speed = Math.min(150, game.speed + 90 * dt); else if (reverse) game.speed = Math.max(-85, game.speed - 70 * dt); else game.speed *= Math.pow(.965, dt * 60);
    if (braking) game.speed *= Math.pow(.82, dt * 60);
    const steering = (game.keys.has('a') || game.keys.has('arrowleft') || game.keys.has('left') ? -1 : 0) + (game.keys.has('d') || game.keys.has('arrowright') || game.keys.has('right') ? 1 : 0);
    game.angle += steering * Math.sign(game.speed) * Math.min(1, Math.abs(game.speed) / 55) * 1.3 * dt;
    game.x += Math.cos(game.angle) * game.speed * dt; game.y += Math.sin(game.angle) * game.speed * dt;
    let hit = false; if (game.x < 34 || game.x > 866 || game.y < 104 || game.y > 396) { game.x = Math.max(34, Math.min(866, game.x)); game.y = Math.max(104, Math.min(396, game.y)); hit = true; }
    if (game.cones.some(c => Math.hypot(game.x - c.x, game.y - c.y) < 27)) hit = true;
    if (hit && game.speed) { game.hits++; game.speed *= -.16; document.getElementById('parking-hits').textContent = String(game.hits); }
    document.getElementById('parking-time').textContent = `${game.time.toFixed(1)} s`; drawGame();
    const parked = game.x > 615 && game.x < 765 && game.y > 165 && game.y < 335 && Math.abs(game.speed) < 24 && Math.abs(Math.atan2(Math.sin(game.angle), Math.cos(game.angle))) < (parkingLevel.value === 'precision' ? .12 : .22);
    if (parked) { const score = Math.max(0, Math.round(1000 - game.time * 4 - game.hits * 100 + (parkingLevel.value === 'precision' ? 150 : 80))); game.running = false; game.raf = 0; document.getElementById('parking-state').textContent = 'Successfully parked.'; document.getElementById('parking-result').textContent = `Parked · score ${score} · ${game.hits} collision${game.hits === 1 ? '' : 's'} · ${game.time.toFixed(1)} seconds.`; document.getElementById('parking-start').textContent = 'Play again'; document.getElementById('parking-pause').disabled = true; return; }
    game.raf = requestAnimationFrame(tickGame);
  }
  function startGame() { if (game.running) return; const panel = document.getElementById('parking-precision'); if (!panel.classList.contains('section-modal-active')) return; game.running = true; game.paused = false; game.last = 0; document.getElementById('parking-start').disabled = true; document.getElementById('parking-pause').disabled = false; document.getElementById('parking-state').textContent = 'Playing · use gentle steering to line up with the bay'; canvas.focus({ preventScroll: true }); if (!game.raf) game.raf = requestAnimationFrame(tickGame); }
  document.getElementById('parking-start').addEventListener('click', () => { if (game.time || game.hits || document.getElementById('parking-result').textContent) resetGame(); startGame(); });
  document.getElementById('parking-pause').addEventListener('click', event => { if (game.running) { game.running = false; game.paused = true; game.raf = 0; event.currentTarget.textContent = 'Resume'; document.getElementById('parking-start').disabled = false; document.getElementById('parking-state').textContent = 'Paused'; } else if (game.paused) { game.paused = false; startGame(); event.currentTarget.textContent = 'Pause'; } });
  document.getElementById('parking-reset').addEventListener('click', resetGame); parkingLevel.addEventListener('change', resetGame);
  canvas.addEventListener('keydown', event => { const key = event.key.toLowerCase(); if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)) event.preventDefault(); game.keys.add(key); });
  canvas.addEventListener('keyup', event => game.keys.delete(event.key.toLowerCase())); canvas.addEventListener('blur', () => game.keys.clear());
  const typing = el => el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  document.addEventListener('keydown', event => { if (!game.running || typing(event.target) || document.activeElement !== canvas) return; if (['arrowup','arrowdown','arrowleft','arrowright',' '].includes(event.key.toLowerCase())) event.preventDefault(); });
  document.querySelectorAll('[data-drive]').forEach(button => {
    const key = button.dataset.drive;
    button.addEventListener('pointerdown', event => { if (!game.running) return; event.preventDefault(); game.keys.add(key); button.setPointerCapture?.(event.pointerId); });
    ['pointerup','pointercancel','lostpointercapture','blur'].forEach(type => button.addEventListener(type, () => game.keys.delete(key)));
  });
  const parkingPanel = document.getElementById('parking-precision');
  new MutationObserver(() => { if (!parkingPanel.classList.contains('section-modal-active')) { game.running = false; game.paused = false; game.keys.clear(); if (game.raf) cancelAnimationFrame(game.raf); game.raf = 0; document.getElementById('parking-state').textContent = 'Closed · reopen to continue'; } else if (game.paused) { game.paused = false; startGame(); } }).observe(parkingPanel, { attributes: true, attributeFilter: ['class'] });
  resetGame();

  // Sourced myth/fact rounds, category filtering, optional clock, and local-only best score.
  const quiz = { questions: [], index: 0, score: 0, streak: 0, best: 0, locked: false, timer: 0, left: 15, timed: false, category: 'All' };
  try { quiz.best = Number(localStorage.getItem('autonexus.mythFact.best') || 0); } catch { quiz.best = 0; }
  const q = id => document.getElementById(id);
  function updateScore() { q('quiz-score').textContent = `Score ${quiz.score} · streak ${quiz.streak} · best ${quiz.best}`; }
  function finishQuiz() { clearInterval(quiz.timer); quiz.timer = 0; quiz.locked = true; q('quiz-claim').textContent = `Round complete · ${quiz.score} points`; q('quiz-counter').textContent = `${quiz.questions.length} questions`; q('quiz-feedback').hidden = false; q('quiz-feedback').textContent = 'Choose New round or Replay round to play again.'; q('quiz-fact').disabled = q('quiz-myth').disabled = true; q('quiz-next').hidden = true; }
  function showQuestion() {
    clearInterval(quiz.timer); quiz.timer = 0; quiz.locked = false;
    if (quiz.index >= quiz.questions.length) { finishQuiz(); return; }
    const current = quiz.questions[quiz.index], src = linkFor(current.src);
    q('quiz-counter').textContent = `${quiz.index + 1} / ${quiz.questions.length} · ${current.c}`; q('quiz-claim').textContent = current.claim; q('quiz-feedback').hidden = true; q('quiz-next').hidden = true; q('quiz-fact').disabled = q('quiz-myth').disabled = false;
    q('quiz-fact').onclick = () => answer(true); q('quiz-myth').onclick = () => answer(false);
    if (quiz.timed) { quiz.left = 15; q('quiz-timer').hidden = false; q('quiz-timer').textContent = '15'; quiz.timer = window.setInterval(() => { quiz.left--; q('quiz-timer').textContent = String(quiz.left); if (quiz.left <= 0) answer(null); }, 1000); } else q('quiz-timer').hidden = true;
    function answer(choice) {
      if (quiz.locked) return; quiz.locked = true; clearInterval(quiz.timer); quiz.timer = 0;
      const correct = choice === current.fact; if (correct) { quiz.score += 100 + quiz.streak * 10; quiz.streak++; } else quiz.streak = 0;
      quiz.best = Math.max(quiz.best, quiz.score); try { localStorage.setItem('autonexus.mythFact.best', String(quiz.best)); } catch { /* local storage is optional */ }
      updateScore(); q('quiz-fact').disabled = q('quiz-myth').disabled = true;
      q('quiz-feedback').innerHTML = `<strong>${choice === null ? 'Time is up' : correct ? 'Correct' : 'Not quite'} · ${current.fact ? 'Fact' : 'Myth'}</strong><p>${current.why}</p><small>Reviewed ${current.reviewed}. ${safeAnchor(src)}</small>`;
      q('quiz-feedback').hidden = false; q('quiz-next').hidden = false; q('quiz-next').textContent = quiz.index + 1 < quiz.questions.length ? 'Next question' : 'Finish round';
    }
    q('quiz-next').onclick = () => { quiz.index++; showQuestion(); };
  }
  function newRound(replay = false) {
    clearInterval(quiz.timer); quiz.timer = 0; quiz.category = q('quiz-category').value; quiz.timed = q('quiz-timed').checked;
    quiz.questions = QUESTIONS.filter(item => quiz.category === 'All' || item.c === quiz.category);
    if (!replay) quiz.questions = [...quiz.questions].sort(() => Math.random() - .5);
    quiz.index = 0; quiz.score = 0; quiz.streak = 0; updateScore(); showQuestion();
  }
  q('quiz-new').addEventListener('click', () => newRound(false)); q('quiz-replay').addEventListener('click', () => newRound(true)); q('quiz-category').addEventListener('change', () => newRound(false)); q('quiz-timed').addEventListener('change', () => newRound(false));
  newRound(false);

})();
