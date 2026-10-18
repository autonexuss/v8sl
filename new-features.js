(() => {
  'use strict';

  const REVIEWED = '2026-10-18';
  const SOURCES = {
    mg: { title: 'MG Motor India · ZS EV specifications', url: 'https://www.mgmotor.co.in/vehicles/mgzsev-electric-car-in-india' },
    mahindra: { title: 'Mahindra Electric SUV · BE 6 brochure', url: 'https://www.mahindraelectricsuv.com/on/demandware.static/-/Library-Sites-eSUVSharedLibrary/default/dw9d7f448a/Be-6e/BE6-Digital-Leaflet.pdf' },
    hyundaiIoniq: { title: 'Hyundai India · IONIQ 5 specifications', url: 'https://www.hyundai.com/in/en/find-a-car/ioniq-5/specification' },
    hyundaiCreta: { title: 'Hyundai India · CRETA Electric specifications', url: 'https://www.hyundai.com/in/en/find-a-car/creta-electric/highlights' },
    hyundaiCreta2025: { title: 'Hyundai India · CRETA Electric launch specification (2025)', url: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/hyundai-story/announcements/Intimation-of-Press-release-The-Hyundai-CRETA-Electric-Innovative-Technology-Unparalleled-Safety-and-Electrifying-Performce.pdf' },
    marutiEv: { title: 'Maruti Suzuki · e VITARA launch and specifications', url: 'https://www.marutisuzuki.com/corporate/media/press-releases/2026/february/india-goes-electric-with-maruti-suzuki-e-vitara-introductory-baas-price-starts' },
    mahindra3xo: { title: 'Mahindra · XUV 3XO EV launch', url: 'https://auto.mahindra.com/press-release/mahindra-introduces-xuv-3xo-ev-range.html' },
    toyotaEbella: { title: 'Toyota India · Urban Cruiser Ebella specifications', url: 'https://www.toyotabharat.com/documents/brochures/e-brochure-urbancruiser-ebella.pdf' },
    kiaClavis: { title: 'Kia India · Carens Clavis EV specifications', url: 'https://www.kia.com/in/our-vehicles/carens-clavis-ev/showroom.html' },
    kiaSyros: { title: 'Kia India · Syros EV specifications', url: 'https://www.kia.com/in/our-vehicles/syros-ev/specs.html' },
    bee: { title: 'Bureau of Energy Efficiency · EV FAQs', url: 'https://beeindia.gov.in/view_content.php?lang=1&lid=70' },
    mgLaunch: { title: 'MG Motor India · ZS EV 2022 launch', url: 'https://www.mgmotor.co.in/media-center/newsroom/mg-motor-india-strengthens-its-commitment-to-electric-mobility-in-india' },
    traffic: { title: 'Delhi Traffic Police · General safety guidelines', url: 'https://staging.parivahan.gov.in/delhitrafficpolice//en/node/88' },
    toyotaTyre: { title: 'Toyota Owners · Tire inflation pressure', url: 'https://www.toyota.com/owners/warranty-owners-manuals/digital/article/rav4/2024/om42f42u/ch06se030406/' },
    toyotaTpms: { title: 'Toyota Owners · TPMS and tire maintenance', url: 'https://www.toyota.com/owners/warranty-owners-manuals/digital/article/rav4-prime/2023/om42e79u/ch08se020403/' }
  };

  const DIRECTORY = window.CHASSIS_INDIA_DIRECTORY || [];
  const BEV_IDS = window.CHASSIS_INDIA_BEV_IDS || [];
  const EV_CARS = BEV_IDS.flatMap(([makeName, modelName]) => {
    const make = DIRECTORY.find(item => item.make === makeName);
    const model = make?.models.find(item => item.name === modelName);
    if (!make || !model) return [];
    return [{ id: `${make.make}|${model.name}`, make: make.make, model: model.name, from: model.from, to: model.to }];
  });
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
    { c: 'Automotive basics', claim: 'A tyre pressure monitoring system replaces regular tyre-pressure checks.', fact: false, why: 'The cited Toyota owner manual says TPMS does not replace routine pressure checks. Consult the manual for your own car.', src: 'toyotaTpms' },
    { c: 'Automotive basics', claim: 'For the cited Toyota manual, the recommended cold tyre pressure is vehicle-specific.', fact: true, why: 'The manual directs owners to the vehicle tyre and loading label for the recommended cold pressure.', src: 'toyotaTyre' },
    { c: 'Automotive basics', claim: 'A tyre is cold in the cited manual after the vehicle has been parked for at least three hours.', fact: true, why: 'That manual gives this condition for a cold-pressure reading; other vehicles may define checks differently.', src: 'toyotaTyre' },
    { c: 'Automotive basics', claim: 'Every car should use the maximum pressure printed on its tyre sidewall as its normal pressure.', fact: false, why: 'The cited manual points owners to the vehicle’s recommended cold pressure on its tyre/loading label.', src: 'toyotaTyre' },
    { c: 'Automotive basics', claim: 'The cited Toyota manual recommends checking tyre pressure at least monthly.', fact: true, why: 'The manual recommends regular checks and specifies a monthly minimum. Follow the manual for your vehicle.', src: 'toyotaTyre' }
  ].map((q, i) => ({ ...q, id: i + 1, reviewed: REVIEWED }));

  const main = document.querySelector('main');
  if (!main || document.getElementById('ev-range-adventure')) return;
  const before = document.getElementById('about');
  const put = html => { const box = document.createElement('template'); box.innerHTML = html.trim(); const node = box.content.firstElementChild; node.classList.add('shell-section-closed'); main.insertBefore(node, before || null); return node; };
  const panelHead = (eyebrow, title, text) => `<header class="nf-heading"><div class="eyebrow"><i></i>${eyebrow}</div><h2>${title}</h2><p>${text}</p></header>`;


  put(`<section class="new-feature-panel section-wrap" id="ev-range-adventure" aria-labelledby="ev-range-title">
    ${panelHead('BATTERY-ELECTRIC CARS · INDIA DIRECTORY', 'EV Range Adventure', 'Set your starting charge and driving conditions, then explore how the route changes the trip estimate.')}
    <div class="nf-layout nf-ev-layout"><form class="nf-card nf-form" id="ev-range-form">
      <label>Brand / make<select id="ev-make"><option value="">Choose an EV brand</option></select></label>
      <label>Electric car<select id="ev-model" disabled><option value="">Choose a brand first</option></select></label>
      <label>Starting battery <output id="ev-start-output">80%</output><input id="ev-start" type="range" min="10" max="100" step="1" value="80"></label>
      <label>Trip distance <output id="ev-distance-output">120 km</output><input id="ev-distance" type="range" min="10" max="600" step="5" value="120"></label>
      <label>Average speed <output id="ev-speed-output">80 km/h</output><input id="ev-speed" type="range" min="30" max="120" step="5" value="80"></label>
      <label>Weather<select id="ev-weather"><option value="mild">Mild</option><option value="hot">Hot</option><option value="cold">Cool</option></select></label>
      <label>Route terrain<select id="ev-terrain"><option value="flat">Mostly flat</option><option value="hilly">Hilly</option></select></label>
      <label>Air conditioning<select id="ev-ac"><option value="on">On</option><option value="off">Off</option></select></label>
      <label>Passenger and cargo load<select id="ev-load"><option value="light">Light</option><option value="medium" selected>Typical</option><option value="heavy">Heavy</option></select></label>
      <div class="nf-actions"><button class="nf-primary" id="ev-start-trip" type="button">Start adventure</button><button class="nf-secondary" id="ev-pause-trip" type="button" disabled>Pause</button><button class="nf-secondary" id="ev-reset-trip" type="button">Reset</button></div>
    </form><div class="nf-card nf-output nf-ev-output"><span class="nf-kicker">TRIP ESTIMATE</span><h3 id="ev-trip-status" aria-live="polite">Ready when you are.</h3><div class="nf-progress"><i id="ev-trip-progress"></i></div><div class="nf-metrics"><div><span>Trip energy</span><strong id="ev-energy">—</strong></div><div><span>Arrival battery</span><strong id="ev-arrival">—</strong></div><div><span>Estimated remaining range</span><strong id="ev-remaining">—</strong></div></div><p id="ev-reachability" class="nf-reachability">Adjust the trip controls to see how the route conditions affect the estimate.</p><p class="nf-note">Trip estimates respond to starting charge, distance, speed, weather, terrain, air conditioning and passenger load.</p></div></div>
  </section>`);

  put(`<section class="new-feature-panel section-wrap" id="myth-or-fact" aria-labelledby="myth-title">
    ${panelHead('SOURCED · RANDOMIZED · NO REPEATS UNTIL THE BANK CYCLES', 'Myth or Fact?', 'Answer randomized car, EV, maintenance and road-safety claims. Every explanation links to its source. The question bank cycles only after its current category has been used; it is finite and can grow as new claims are reviewed.')}
    <div class="nf-layout nf-quiz-layout"><div class="nf-card nf-quiz-controls"><label>Question category<select id="quiz-category"><option value="All">All categories</option><option>EVs</option><option>Maintenance</option><option>Safety</option><option>Automotive basics</option></select></label><label class="nf-check-label"><input id="quiz-timed" type="checkbox"> Timed round · 15 seconds per question</label><div class="nf-actions"><button class="nf-primary" id="quiz-new" type="button">New round</button><button class="nf-secondary" id="quiz-replay" type="button">Replay round</button></div><p id="quiz-score" class="nf-score" aria-live="polite">Score 0 · streak 0 · best 0</p><p class="nf-note">Questions are randomized without repeats until the selected bank is exhausted. Best score is stored locally in this browser only.</p></div>
      <article class="nf-card nf-question" aria-live="polite"><div class="nf-question-top"><span id="quiz-counter">Question 1</span><span id="quiz-timer" hidden>15</span></div><h3 id="quiz-claim"></h3><div class="nf-actions nf-answer-actions"><button class="nf-primary" id="quiz-fact" type="button">Fact</button><button class="nf-secondary" id="quiz-myth" type="button">Myth</button></div><div id="quiz-feedback" class="nf-feedback" hidden></div><button class="nf-secondary" id="quiz-next" type="button" hidden>Next question</button></article></div>
  </section>`);

  const htmlSafe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const option = (label, value = label) => { const o = document.createElement('option'); o.textContent = label; o.value = value; return o; };
  const linkFor = key => SOURCES[key];
  const safeAnchor = (source, label) => `<a href="${source.url}" target="_blank" rel="noopener noreferrer">${label || source.title} ↗</a>`;

  const resetSelect = (select, placeholder, disabled = true) => { select.replaceChildren(option(placeholder, '')); select.disabled = disabled; };

  const evMake = document.getElementById('ev-make'), evModel = document.getElementById('ev-model');
  const evDirectory = DIRECTORY.map(entry => ({ ...entry, models: entry.models.filter(car => EV_CARS.some(ev => ev.make === entry.make && ev.model === car.name)) })).filter(entry => entry.models.length);
  evDirectory.forEach(entry => evMake.add(option(entry.make, entry.make)));
  evMake.addEventListener('change', () => {
    const entry = evDirectory.find(item => item.make === evMake.value);
    resetSelect(evModel, entry ? 'Choose an electric model' : 'Choose a brand first', !entry);
    (entry?.models || []).forEach(item => evModel.add(option(item.name, item.name)));
  });

  // Trip controls run independently of the display-only vehicle picker.
  const EV_SCENARIO = { batteryKwh: 50, referenceRangeKm: 350 };
  const evOut = id => document.getElementById(`${id}-output`);
  const evControlIds = ['ev-start', 'ev-distance', 'ev-speed', 'ev-weather', 'ev-terrain', 'ev-ac', 'ev-load'];
  function updateEV() {
    const battery = EV_SCENARIO.batteryKwh, range = EV_SCENARIO.referenceRangeKm;
    const start = Number(document.getElementById('ev-start').value);
    const distance = Number(document.getElementById('ev-distance').value);
    const speed = Number(document.getElementById('ev-speed').value);
    evOut('ev-start').textContent = `${start}%`;
    evOut('ev-distance').textContent = `${distance} km`;
    evOut('ev-speed').textContent = `${speed} km/h`;

    const weather = document.getElementById('ev-weather').value;
    const terrain = document.getElementById('ev-terrain').value;
    const ac = document.getElementById('ev-ac').value;
    const load = document.getElementById('ev-load').value;
    const factors = {
      speed: Math.max(.88, Math.min(1.45, 1 + (speed - 60) * .003)),
      weather: weather === 'mild' ? 1 : weather === 'cold' ? 1.12 : 1.08,
      terrain: terrain === 'hilly' ? 1.13 : 1,
      ac: ac === 'on' ? 1.08 : 1,
      load: load === 'light' ? .98 : load === 'heavy' ? 1.1 : 1.04
    };
    const kwhPerKm = battery / range * Object.values(factors).reduce((a, b) => a * b, 1);
    const available = battery * start / 100;
    const energy = distance * kwhPerKm;
    const arrivalEnergy = available - energy;
    const arrivalPercent = Math.max(0, arrivalEnergy) / battery * 100;
    const remainingRange = Math.max(0, arrivalEnergy) / kwhPerKm;

    document.getElementById('ev-energy').textContent = `${energy.toFixed(1)} kWh`;
    document.getElementById('ev-arrival').textContent = arrivalEnergy < 0 ? 'Below 0% · not reachable' : `${arrivalPercent.toFixed(0)}%`;
    document.getElementById('ev-remaining').textContent = `${remainingRange.toFixed(0)} km`;
    document.getElementById('ev-reachability').textContent = arrivalEnergy >= 0
      ? `Scenario factors · speed ×${factors.speed.toFixed(2)}, weather ×${factors.weather.toFixed(2)}, terrain ×${factors.terrain.toFixed(2)}, HVAC ×${factors.ac.toFixed(2)}, load ×${factors.load.toFixed(2)}.`
      : 'This scenario exceeds the starting charge estimate. Reduce distance or conditions that increase energy use.';
    return { distance, arrival: arrivalEnergy, arrivalPct: arrivalPercent };
  }
  evControlIds.forEach(id => {
    const control = document.getElementById(id);
    control.addEventListener(control.tagName === 'INPUT' ? 'input' : 'change', updateEV);
  });
  updateEV();

  let tripProgress = 0, tripTimer = 0, tripRunning = false;
  function stopEV(reset) {
    clearInterval(tripTimer);
    tripTimer = 0;
    tripRunning = false;
    document.getElementById('ev-pause-trip').textContent = 'Pause';
    document.getElementById('ev-pause-trip').disabled = true;
    if (reset) {
      tripProgress = 0;
      document.getElementById('ev-trip-status').textContent = 'Ready when you are.';
    }
    document.getElementById('ev-trip-progress').style.width = `${tripProgress * 100}%`;
  }
  document.getElementById('ev-start-trip').addEventListener('click', () => {
    if (tripRunning) return;
    const estimate = updateEV();
    if (tripProgress >= 1) tripProgress = 0;
    tripRunning = true;
    const status = document.getElementById('ev-trip-status');
    status.textContent = 'Adventure in progress · adjusting to your trip controls';
    const pause = document.getElementById('ev-pause-trip');
    pause.disabled = false;
    pause.textContent = 'Pause';
    const duration = Math.max(8, Math.min(36, estimate.distance / 4));
    let last = performance.now();
    tripTimer = window.setInterval(() => {
      const now = performance.now(), dt = Math.min(.2, (now - last) / 1000);
      last = now;
      tripProgress = Math.min(1, tripProgress + dt / duration);
      document.getElementById('ev-trip-progress').style.width = `${tripProgress * 100}%`;
      if (tripProgress >= 1) {
        stopEV(false);
        status.textContent = estimate.arrival >= 0
          ? `Trip complete · estimated arrival ${estimate.arrivalPct.toFixed(0)}%`
          : 'Trip simulation complete · energy estimate falls short.';
      }
    }, 80);
  });
  document.getElementById('ev-pause-trip').addEventListener('click', event => {
    if (tripRunning) {
      clearInterval(tripTimer);
      tripTimer = 0;
      tripRunning = false;
      event.currentTarget.textContent = 'Resume';
      document.getElementById('ev-trip-status').textContent = 'Paused · resume when ready.';
    } else if (tripProgress > 0 && tripProgress < 1) {
      document.getElementById('ev-start-trip').click();
    }
  });
  document.getElementById('ev-reset-trip').addEventListener('click', () => stopEV(true));

  // Sourced myth/fact rounds, category filtering, optional clock, and local-only best score.
  const quiz = { questions: [], index: 0, score: 0, streak: 0, best: 0, locked: false, timer: 0, left: 15, timed: false, category: 'All', used: new Set() };
  try { quiz.best = Number(localStorage.getItem('autonexus.mythFact.best') || 0); } catch { quiz.best = 0; }
  try { quiz.used = new Set(JSON.parse(localStorage.getItem('autonexus.mythFact.used') || '[]')); } catch { quiz.used = new Set(); }
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
      quiz.used.add(current.id);
      try { localStorage.setItem('autonexus.mythFact.used', JSON.stringify([...quiz.used])); } catch { /* local storage is optional */ }
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
    const bank = QUESTIONS.filter(item => quiz.category === 'All' || item.c === quiz.category);
    quiz.questions = replay && quiz.questions.length ? [...quiz.questions] : bank.filter(item => !quiz.used.has(item.id));
    if (!replay && quiz.questions.length === 0) {
      bank.forEach(item => quiz.used.delete(item.id));
      try { localStorage.setItem('autonexus.mythFact.used', JSON.stringify([...quiz.used])); } catch { /* local storage is optional */ }
      quiz.questions = [...bank];
    }
    if (!replay) for (let i = quiz.questions.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [quiz.questions[i], quiz.questions[j]] = [quiz.questions[j], quiz.questions[i]]; }
    quiz.index = 0; quiz.score = 0; quiz.streak = 0; updateScore(); showQuestion();
  }
  q('quiz-new').addEventListener('click', () => newRound(false)); q('quiz-replay').addEventListener('click', () => newRound(true)); q('quiz-category').addEventListener('change', () => newRound(false)); q('quiz-timed').addEventListener('change', () => newRound(false));
  newRound(false);

})();
