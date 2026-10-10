// Chassis starter tools. This catalogue is intentionally transparent: it is not a live vehicle feed.
const chassisCars = [
  { id: 'swift', make: 'Maruti Suzuki', model: 'Swift', body: 'Hatchback', fuel: 'Petrol / CNG', seats: '5', note: 'Compact hatchback · manual and automatic options vary by version', url: 'https://www.marutisuzuki.com/' },
  { id: 'baleno', make: 'Maruti Suzuki', model: 'Baleno', body: 'Hatchback', fuel: 'Petrol / CNG', seats: '5', note: 'Premium hatchback · powertrain and equipment vary by trim', url: 'https://www.nexaexperience.com/baleno' },
  { id: 'wagon-r', make: 'Maruti Suzuki', model: 'Wagon R', body: 'Hatchback', fuel: 'Petrol / CNG', seats: '5', note: 'Tall-boy hatchback · petrol and CNG versions', url: 'https://www.marutisuzuki.com/' },
  { id: 'brezza', make: 'Maruti Suzuki', model: 'Brezza', body: 'SUV', fuel: 'Petrol / CNG', seats: '5', note: 'Compact SUV · petrol and factory CNG versions', url: 'https://www.marutisuzuki.com/' },
  { id: 'fronx', make: 'Maruti Suzuki', model: 'Fronx', body: 'Crossover', fuel: 'Petrol / CNG', seats: '5', note: 'Compact crossover · engine and gearbox depend on variant', url: 'https://www.nexaexperience.com/fronx' },
  { id: 'grand-vitara', make: 'Maruti Suzuki', model: 'Grand Vitara', body: 'SUV', fuel: 'Petrol / CNG / Hybrid', seats: '5', note: 'Compact SUV · mild-hybrid, strong-hybrid and CNG options vary', url: 'https://www.nexaexperience.com/grand-vitara' },
  { id: 'nexon', make: 'Tata', model: 'Nexon', body: 'SUV', fuel: 'Petrol / Diesel / Electric', seats: '5', note: 'Compact SUV family · includes separate electric versions', url: 'https://cars.tatamotors.com/suv/nexon.html' },
  { id: 'punch', make: 'Tata', model: 'Punch', body: 'SUV', fuel: 'Petrol / CNG / Electric', seats: '5', note: 'Small SUV family · electric version has a distinct powertrain', url: 'https://cars.tatamotors.com/suv/punch.html' },
  { id: 'tiago', make: 'Tata', model: 'Tiago', body: 'Hatchback', fuel: 'Petrol / CNG / Electric', seats: '5', note: 'Hatchback family · Tiago EV is a separate electric model', url: 'https://cars.tatamotors.com/hatchback/tiago.html' },
  { id: 'harrier', make: 'Tata', model: 'Harrier', body: 'SUV', fuel: 'Diesel', seats: '5', note: 'Mid-size SUV · current equipment varies by model year', url: 'https://cars.tatamotors.com/suv/harrier.html' },
  { id: 'creta', make: 'Hyundai', model: 'Creta', body: 'SUV', fuel: 'Petrol / Diesel', seats: '5', note: 'Mid-size SUV · multiple engine and transmission combinations', url: 'https://www.hyundai.com/in/en/find-a-car/creta' },
  { id: 'venue', make: 'Hyundai', model: 'Venue', body: 'SUV', fuel: 'Petrol / Diesel', seats: '5', note: 'Compact SUV · confirm powertrain and safety equipment by trim', url: 'https://www.hyundai.com/in/en/find-a-car/venue' },
  { id: 'verna', make: 'Hyundai', model: 'Verna', body: 'Sedan', fuel: 'Petrol', seats: '5', note: 'Sedan · engine and transmission options vary by version', url: 'https://www.hyundai.com/in/en/find-a-car/verna' },
  { id: 'seltos', make: 'Kia', model: 'Seltos', body: 'SUV', fuel: 'Petrol / Diesel', seats: '5', note: 'Mid-size SUV · variant-specific engines and features', url: 'https://www.kia.com/in/our-vehicles/seltos/showroom.html' },
  { id: 'sonet', make: 'Kia', model: 'Sonet', body: 'SUV', fuel: 'Petrol / Diesel', seats: '5', note: 'Compact SUV · variant-specific engines and features', url: 'https://www.kia.com/in/our-vehicles/sonet/showroom.html' },
  { id: 'city', make: 'Honda', model: 'City', body: 'Sedan', fuel: 'Petrol / Hybrid', seats: '5', note: 'Sedan family · hybrid and petrol variants differ', url: 'https://www.hondacarindia.com/honda-city' },
  { id: 'thar', make: 'Mahindra', model: 'Thar', body: 'SUV', fuel: 'Petrol / Diesel', seats: '4', note: 'Off-road focused SUV · body and seating versions vary', url: 'https://auto.mahindra.com/suv/thar' },
  { id: 'xuv700', make: 'Mahindra', model: 'XUV700', body: 'SUV', fuel: 'Petrol / Diesel', seats: '5 / 7', note: 'SUV offered in seating configurations that depend on trim', url: 'https://auto.mahindra.com/suv/xuv700' },
  { id: 'hycross', make: 'Toyota', model: 'Innova Hycross', body: 'MPV', fuel: 'Petrol / Hybrid', seats: '7 / 8', note: 'MPV · seating and powertrain depend on variant', url: 'https://www.toyotabharat.com/showroom/innova-hycross/' },
  { id: 'fortuner', make: 'Toyota', model: 'Fortuner', body: 'SUV', fuel: 'Petrol / Diesel', seats: '7', note: 'Large SUV · engine, drivetrain and features vary by grade', url: 'https://www.toyotabharat.com/showroom/fortuner/' },
  { id: 'windsor', make: 'MG', model: 'Windsor EV', body: 'Crossover', fuel: 'Electric', seats: '5', note: 'Electric crossover · check current battery and charging specifications', url: 'https://www.mgmotor.co.in/' },
  { id: 'xev-9e', make: 'Mahindra', model: 'XEV 9e', body: 'SUV', fuel: 'Electric', seats: '5', note: 'Electric SUV · battery, range and charging depend on version', url: 'https://www.mahindraelectricsuv.com/' },
  { id: 'a45', make: 'Mercedes-Benz', model: 'AMG A 45 S', body: 'Hatchback', fuel: 'Petrol', seats: '5', note: 'High-performance hatchback · India availability and specifications can change', url: 'https://www.mercedes-benz.co.in/' },
  { id: 'glc', make: 'Mercedes-Benz', model: 'GLC', body: 'SUV', fuel: 'Petrol / Diesel', seats: '5', note: 'Luxury SUV · exact powertrain depends on model year and market', url: 'https://www.mercedes-benz.co.in/passengercars/models/suv/glc/overview.html' },
  { id: 'a8', make: 'Audi', model: 'A8 L', body: 'Sedan', fuel: 'Petrol', seats: '5', note: 'Luxury sedan · current India availability and trim should be confirmed', url: 'https://www.audi.in/en/models/a8/a8-l/' },
  { id: 'x1', make: 'BMW', model: 'X1', body: 'SUV', fuel: 'Petrol / Diesel', seats: '5', note: 'Luxury compact SUV · specifications vary by version', url: 'https://www.bmw.in/en/all-models/x-series/X1/2023/bmw-x1.html' }
];

const marketForm = document.getElementById('market-form');
const marketResults = document.getElementById('market-results');
const marketCount = document.getElementById('market-count');
const marketQuery = document.getElementById('market-query');
const marketMake = document.getElementById('market-make');
const marketBody = document.getElementById('market-body');
const marketFuel = document.getElementById('market-fuel');
const modelDetail = document.getElementById('model-detail');
const catalogCompare = document.getElementById('catalog-compare');
const selectedForCompare = new Set();
let remoteSearchTimer;
let remoteSearchSequence = 0;

function appendOptions(select, values) {
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.append(option);
  });
}
appendOptions(marketMake, [...new Set(chassisCars.map(car => car.make))].sort());
appendOptions(marketBody, [...new Set(chassisCars.map(car => car.body))].sort());
appendOptions(marketFuel, [...new Set(chassisCars.flatMap(car => car.fuel.split(' / ')))].sort());
const listingModel = document.getElementById('listing-model');
chassisCars.forEach(car => {
  const option = document.createElement('option');
  option.value = car.id;
  option.textContent = `${car.make} ${car.model}`;
  listingModel.append(option);
});

function safeExternalLink(text, href, className = '') {
  const link = document.createElement('a');
  link.textContent = text;
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (className) link.className = className;
  return link;
}

function filteredCars() {
  const query = marketQuery.value.trim().toLowerCase();
  return chassisCars.filter(car => {
    const searchable = `${car.make} ${car.model} ${car.body} ${car.fuel} ${car.note}`.toLowerCase();
    return (!query || searchable.includes(query))
      && (!marketMake.value || car.make === marketMake.value)
      && (!marketBody.value || car.body === marketBody.value)
      && (!marketFuel.value || car.fuel.toLowerCase().includes(marketFuel.value.toLowerCase()));
  });
}

async function onlineCarOverview(query) {
  try {
    const localRoute = await fetch(`/api/car?q=${encodeURIComponent(query)}`);
    if (localRoute.ok) {
      const data = await localRoute.json();
      if (data.car) return data.car;
    }
  } catch { /* Static hosting uses Wikipedia's public endpoint directly below. */ }
  // Action API explicitly enables anonymous cross-origin requests with origin=*.
  // This lets the same fallback work on GitHub Pages and other static hosts.
  const searchUrl = new URL('https://en.wikipedia.org/w/api.php');
  searchUrl.searchParams.set('action', 'query');
  searchUrl.searchParams.set('list', 'search');
  searchUrl.searchParams.set('srsearch', query);
  searchUrl.searchParams.set('srlimit', '1');
  searchUrl.searchParams.set('format', 'json');
  searchUrl.searchParams.set('origin', '*');
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) throw new Error('Online reference search is unavailable right now.');
  const searchData = await searchResponse.json();
  const title = searchData.query?.search?.[0]?.title;
  if (!title) return null;
  const summaryUrl = new URL('https://en.wikipedia.org/w/api.php');
  summaryUrl.searchParams.set('action', 'query');
  summaryUrl.searchParams.set('prop', 'extracts|info');
  summaryUrl.searchParams.set('exintro', '1');
  summaryUrl.searchParams.set('explaintext', '1');
  summaryUrl.searchParams.set('inprop', 'url');
  summaryUrl.searchParams.set('titles', title);
  summaryUrl.searchParams.set('format', 'json');
  summaryUrl.searchParams.set('origin', '*');
  const summaryResponse = await fetch(summaryUrl);
  if (!summaryResponse.ok) throw new Error('Article preview is unavailable right now.');
  const summaryData = await summaryResponse.json();
  const article = Object.values(summaryData.query?.pages || {})[0];
  return {
    title: article?.title || title,
    extract: article?.extract || 'Open the article for more information.',
    url: article?.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`
  };
}

function showOnlineCarOverview(query) {
  const sequence = ++remoteSearchSequence;
  window.clearTimeout(remoteSearchTimer);
  marketCount.textContent = `Looking online for “${query}”…`;
  remoteSearchTimer = window.setTimeout(async () => {
    try {
      const article = await onlineCarOverview(query);
      if (sequence !== remoteSearchSequence) return;
      marketResults.replaceChildren();
      const card = document.createElement('article');
      card.className = 'online-result-card';
      const kicker = document.createElement('span');
      kicker.className = 'tool-label';
      kicker.textContent = 'ONLINE REFERENCE · CHECK EXACT MODEL & YEAR';
      const title = document.createElement('h3');
      title.textContent = article?.title || `Search results for “${query}”`;
      const summary = document.createElement('p');
      summary.textContent = article?.extract || 'No matching article preview was found. Try a different spelling or open one of the external searches.';
      const links = document.createElement('div');
      links.className = 'online-result-links';
      if (article?.url) links.append(safeExternalLink('Wikipedia article ↗', article.url));
      links.append(
        safeExternalLink('Search web for specifications ↗', `https://www.google.com/search?q=${encodeURIComponent(`${query} car specifications India manufacturer`)}`),
        safeExternalLink('Search official manufacturer pages ↗', `https://www.google.com/search?q=${encodeURIComponent(`${query} official manufacturer`)}`),
        safeExternalLink('Find CarDekho pages ↗', `https://www.google.com/search?q=${encodeURIComponent(`site:cardekho.com ${query} car`)}`),
        safeExternalLink('Search used-car listings ↗', `https://www.google.com/search?q=${encodeURIComponent(`site:cardekho.com/used-cars ${query}`)}`),
        safeExternalLink('Faisal Khan videos ↗', `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} Faisal Khan car review`)}`),
        safeExternalLink('MotorOctane videos ↗', `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} MotorOctane car review`)}`)
      );
      const caveat = document.createElement('small');
      caveat.textContent = 'Wikipedia is a general reference and the article may not be the exact trim. Live prices, variants and dealer listings are not imported into Chassis.';
      card.append(kicker, title, summary, links, caveat);
      marketResults.append(card);
      marketCount.textContent = article ? 'Online overview found. Confirm the exact car, model year and variant.' : 'No article preview found; external searches are ready.';
    } catch {
      if (sequence !== remoteSearchSequence) return;
      marketResults.replaceChildren();
      const card = document.createElement('article');
      card.className = 'online-result-card';
      const title = document.createElement('h3'); title.textContent = `Search online for “${query}”`;
      const text = document.createElement('p'); text.textContent = 'The reference service could not be reached. Use these direct searches, or check your internet connection.';
      const links = document.createElement('div'); links.className = 'online-result-links';
      links.append(
        safeExternalLink('Search web ↗', `https://www.google.com/search?q=${encodeURIComponent(`${query} car specifications`)}`),
        safeExternalLink('Search CarDekho ↗', `https://www.google.com/search?q=${encodeURIComponent(`site:cardekho.com ${query} car`)}`),
        safeExternalLink('Search YouTube ↗', `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} car review`)}`)
      );
      card.append(title, text, links); marketResults.append(card);
      marketCount.textContent = 'Online reference did not load; use a direct search link.';
    }
  }, 450);
}

function renderCarCards() {
  window.clearTimeout(remoteSearchTimer);
  remoteSearchSequence++;
  const matches = filteredCars();
  marketResults.replaceChildren();
  marketCount.textContent = `${matches.length} ${matches.length === 1 ? 'model' : 'models'} in the starter catalogue`;
  matches.forEach(car => {
    const card = document.createElement('article');
    card.className = 'market-card';
    const art = document.createElement('div');
    art.className = `market-card-art ${car.body.toLowerCase().replace(/[^a-z]+/g, '-')}`;
    const category = document.createElement('span');
    category.textContent = car.body.toUpperCase();
    const monogram = document.createElement('b');
    monogram.textContent = car.make.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    art.append(category, monogram);
    const content = document.createElement('div');
    content.className = 'market-card-content';
    const make = document.createElement('span');
    make.className = 'market-make';
    make.textContent = car.make;
    const title = document.createElement('h3');
    title.textContent = car.model;
    const facts = document.createElement('p');
    facts.textContent = `${car.fuel} · ${car.seats} seats`;
    const note = document.createElement('p');
    note.className = 'market-card-note';
    note.textContent = car.note;
    const actions = document.createElement('div');
    actions.className = 'market-card-actions';
    const detail = document.createElement('button');
    detail.type = 'button';
    detail.textContent = 'Model details';
    detail.addEventListener('click', () => showModelDetails(car));
    const compare = document.createElement('button');
    compare.type = 'button';
    compare.className = 'compare-model';
    compare.textContent = selectedForCompare.has(car.id) ? 'Added ✓' : 'Compare +';
    compare.setAttribute('aria-pressed', String(selectedForCompare.has(car.id)));
    compare.addEventListener('click', () => toggleCarCompare(car));
    actions.append(detail, compare);
    content.append(make, title, facts, note, actions);
    card.append(art, content);
    marketResults.append(card);
  });
  if (!matches.length) {
    if (marketQuery.value.trim().length >= 2 && !marketMake.value && !marketBody.value && !marketFuel.value) {
      showOnlineCarOverview(marketQuery.value.trim());
    } else {
      window.clearTimeout(remoteSearchTimer);
      remoteSearchSequence++;
      const empty = document.createElement('p');
      empty.className = 'market-empty';
      empty.textContent = 'No models match these filters. Clear the filters or search by make/model to look online.';
      marketResults.append(empty);
    }
  }
}

function showModelDetails(car) {
  modelDetail.hidden = false;
  modelDetail.replaceChildren();
  const heading = document.createElement('div');
  heading.className = 'model-detail-heading';
  const identity = document.createElement('div');
  const label = document.createElement('span');
  label.className = 'tool-label';
  label.textContent = 'STARTER CATALOGUE · CONFIRM EXACT VARIANT';
  const title = document.createElement('h3');
  title.textContent = `${car.make} ${car.model}`;
  const note = document.createElement('p');
  note.textContent = `${car.note}. This directory contains basic model-family information only; it is not a specification sheet or price quote.`;
  identity.append(label, title, note);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'detail-close';
  close.textContent = 'Close ×';
  close.addEventListener('click', () => { modelDetail.hidden = true; });
  heading.append(identity, close);
  const facts = document.createElement('div');
  facts.className = 'detail-facts';
  [[ 'Make', car.make ], [ 'Model family', car.model ], [ 'Body style', car.body ], [ 'Fuel options', car.fuel ], [ 'Seats', car.seats ]].forEach(([name, value]) => {
    const item = document.createElement('div');
    const dt = document.createElement('small'); dt.textContent = name;
    const dd = document.createElement('strong'); dd.textContent = value;
    item.append(dt, dd); facts.append(item);
  });
  const links = document.createElement('div');
  links.className = 'detail-links';
  links.append(
    safeExternalLink('Manufacturer website ↗', car.url),
    safeExternalLink('Search independent reference ↗', `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(`${car.make} ${car.model}`)}`),
    safeExternalLink('Find current pricing & offers ↗', `https://www.google.com/search?q=${encodeURIComponent(`${car.make} ${car.model} current price India official`)}`),
    safeExternalLink('Faisal Khan video search ↗', `https://www.youtube.com/results?search_query=${encodeURIComponent(`${car.make} ${car.model} Faisal Khan review`)}`),
    safeExternalLink('MotorOctane video search ↗', `https://www.youtube.com/results?search_query=${encodeURIComponent(`${car.make} ${car.model} MotorOctane review`)}`)
  );
  modelDetail.append(heading, facts, links);
  modelDetail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function toggleCarCompare(car) {
  if (selectedForCompare.has(car.id)) selectedForCompare.delete(car.id);
  else if (selectedForCompare.size >= 3) {
    marketCount.textContent = 'Compare up to three models at a time. Remove one to add another.';
    return;
  } else selectedForCompare.add(car.id);
  renderCarCards();
  renderCatalogCompare();
}

function renderCatalogCompare() {
  const cars = [...selectedForCompare].map(id => chassisCars.find(car => car.id === id)).filter(Boolean);
  catalogCompare.hidden = cars.length === 0;
  if (!cars.length) return;
  catalogCompare.replaceChildren();
  const header = document.createElement('div');
  header.className = 'compare-heading';
  const title = document.createElement('h3'); title.textContent = 'Compare your shortlist';
  const clear = document.createElement('button'); clear.type = 'button'; clear.textContent = 'Clear';
  clear.addEventListener('click', () => { selectedForCompare.clear(); renderCarCards(); renderCatalogCompare(); });
  header.append(title, clear);
  const table = document.createElement('table');
  table.className = 'compare-table';
  const headRow = document.createElement('tr');
  const firstHead = document.createElement('th'); firstHead.textContent = 'DETAIL'; headRow.append(firstHead);
  cars.forEach(car => { const th = document.createElement('th'); th.textContent = `${car.make} ${car.model}`; headRow.append(th); });
  const thead = document.createElement('thead'); thead.append(headRow); table.append(thead);
  const body = document.createElement('tbody');
  [['Body style', 'body'], ['Fuel options', 'fuel'], ['Seats', 'seats']].forEach(([label, key]) => {
    const row = document.createElement('tr'); const th = document.createElement('th'); th.textContent = label; row.append(th);
    cars.forEach(car => { const td = document.createElement('td'); td.textContent = car[key]; row.append(td); }); body.append(row);
  });
  const noteRow = document.createElement('tr'); const noteHead = document.createElement('th'); noteHead.textContent = 'Reference'; noteRow.append(noteHead);
  cars.forEach(car => { const td = document.createElement('td'); td.append(safeExternalLink('Manufacturer ↗', car.url)); noteRow.append(td); }); body.append(noteRow);
  table.append(body);
  const caveat = document.createElement('small'); caveat.textContent = 'Comparison uses the starter catalogue only. Prices, variants, performance, safety ratings and full equipment need a current authorized model-data feed.';
  catalogCompare.append(header, table, caveat);
}

marketForm.addEventListener('submit', event => { event.preventDefault(); renderCarCards(); });
[marketQuery, marketMake, marketBody, marketFuel].forEach(input => input.addEventListener(input === marketQuery ? 'input' : 'change', renderCarCards));
document.getElementById('market-reset').addEventListener('click', () => {
  marketQuery.value = ''; marketMake.value = ''; marketBody.value = ''; marketFuel.value = ''; renderCarCards();
});
renderCarCards();

const inr = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, value));
const emiForm = document.getElementById('emi-form');
function calculateEmi() {
  const price = Number(document.getElementById('emi-price').value);
  const down = Number(document.getElementById('emi-down').value);
  const annualRate = Number(document.getElementById('emi-rate').value);
  const years = Number(document.getElementById('emi-years').value);
  const result = document.getElementById('emi-result');
  if (!Number.isFinite(price + down + annualRate + years) || price <= 0 || down < 0 || down >= price || annualRate < 0 || years <= 0) {
    result.textContent = 'Enter a vehicle amount above zero and a down payment below that amount.';
    return;
  }
  const principal = price - down;
  const months = Math.round(years * 12);
  const monthlyRate = annualRate / 1200;
  const emi = monthlyRate === 0 ? principal / months : principal * monthlyRate * (1 + monthlyRate) ** months / ((1 + monthlyRate) ** months - 1);
  result.replaceChildren();
  const strong = document.createElement('strong'); strong.textContent = `${inr(emi)} / month`;
  const note = document.createElement('span'); note.textContent = `Loan ${inr(principal)} · estimated total interest ${inr(emi * months - principal)}`;
  result.append(strong, note);
}
emiForm.addEventListener('submit', event => { event.preventDefault(); calculateEmi(); });
emiForm.addEventListener('input', calculateEmi);
calculateEmi();

const valueForm = document.getElementById('value-form');
function calculateIllustrativeValue() {
  const paid = Number(document.getElementById('value-price').value);
  const year = Number(document.getElementById('value-year').value);
  const km = Number(document.getElementById('value-km').value);
  const condition = Number(document.getElementById('value-condition').value);
  const result = document.getElementById('value-result');
  const age = new Date().getFullYear() - year;
  if (!(paid > 0) || year < 1990 || year > new Date().getFullYear() || km < 0) {
    result.textContent = `Enter a purchase price, a year from 1990 to ${new Date().getFullYear()}, and a valid odometer reading.`;
    return;
  }
  const annualRetention = age <= 1 ? 0.82 : Math.max(0.20, 0.82 * (0.90 ** (age - 1)));
  const kmAdjustment = Math.min(1.12, Math.max(0.88, 1 - ((km - age * 12000) / 10000) * 0.012));
  const center = paid * annualRetention * kmAdjustment * condition;
  result.replaceChildren();
  const strong = document.createElement('strong'); strong.textContent = `${inr(center * 0.92)} – ${inr(center * 1.08)}`;
  const note = document.createElement('span'); note.textContent = 'Broad formula illustration based on age, kilometres and selected condition.';
  result.append(strong, note);
}
valueForm.addEventListener('submit', event => { event.preventDefault(); calculateIllustrativeValue(); });
valueForm.addEventListener('input', calculateIllustrativeValue);
calculateIllustrativeValue();

const listingForm = document.getElementById('listing-form');
listingForm.addEventListener('submit', event => {
  event.preventDefault();
  const car = chassisCars.find(item => item.id === listingModel.value);
  const year = Number(document.getElementById('listing-year').value);
  const km = Number(document.getElementById('listing-km').value);
  const price = Number(document.getElementById('listing-price').value);
  if (!car || year < 1990 || year > new Date().getFullYear() || km < 0 || price <= 0) return;
  const draft = [
    `${year} ${car.make} ${car.model}`,
    `Asking price: ${inr(price)}`,
    `Odometer: ${new Intl.NumberFormat('en-IN').format(km)} km`,
    `Fuel family: ${car.fuel}`,
    '',
    'Please contact me for an inspection and verified vehicle documents.'
  ].join('\n');
  document.getElementById('listing-text').textContent = draft;
  document.getElementById('listing-preview').hidden = false;
  document.getElementById('listing-copy-status').textContent = 'Draft prepared in this page; it has not been posted.';
});
document.getElementById('copy-listing').addEventListener('click', async () => {
  const value = document.getElementById('listing-text').textContent;
  const status = document.getElementById('listing-copy-status');
  try {
    await navigator.clipboard.writeText(value);
    status.textContent = 'Copied to clipboard.';
  } catch {
    const field = document.createElement('textarea');
    field.value = value; field.style.position = 'fixed'; field.style.opacity = '0';
    document.body.append(field); field.select();
    const copied = document.execCommand('copy'); field.remove();
    status.textContent = copied ? 'Copied to clipboard.' : 'Select and copy the draft text above.';
  }
});

document.getElementById('nearby-form').addEventListener('submit', event => {
  event.preventDefault();
  const place = document.getElementById('nearby-place').value.trim();
  const type = document.getElementById('nearby-type').value;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${type} near ${place}`)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

function readLocalList(key) {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; }
  catch { return []; }
}
function writeLocalList(key, list) {
  try { localStorage.setItem(key, JSON.stringify(list)); return true; }
  catch { return false; }
}
function renderPrivateList(key, targetId, fields) {
  const target = document.getElementById(targetId);
  const entries = readLocalList(key);
  target.replaceChildren();
  entries.forEach((entry, index) => {
    const row = document.createElement('div'); row.className = 'private-item';
    const text = document.createElement('span'); text.textContent = fields.map(field => entry[field]).filter(Boolean).join(' · ');
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', 'Remove saved item');
    remove.addEventListener('click', () => { const next = readLocalList(key); next.splice(index, 1); writeLocalList(key, next); renderPrivateList(key, targetId, fields); });
    row.append(text, remove); target.append(row);
  });
  if (!entries.length) { const empty = document.createElement('small'); empty.textContent = 'Nothing saved yet.'; target.append(empty); }
}
const serviceKey = 'chassis-private-service-notes-v1';
const reminderKey = 'chassis-private-reminders-v1';
const serviceDate = document.getElementById('service-date');
const localToday = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };
serviceDate.value = localToday();
document.getElementById('service-form').addEventListener('submit', event => {
  event.preventDefault();
  const entry = { date: serviceDate.value, odometer: `${document.getElementById('service-odo').value} km`, note: document.getElementById('service-note').value.trim() };
  const entries = readLocalList(serviceKey); entries.unshift(entry);
  if (!writeLocalList(serviceKey, entries)) { window.alert('Browser storage is unavailable. Your note was not saved.'); return; }
  event.currentTarget.reset(); serviceDate.value = localToday();
  renderPrivateList(serviceKey, 'service-list', ['date', 'odometer', 'note']);
});
document.getElementById('reminder-form').addEventListener('submit', event => {
  event.preventDefault();
  const entries = readLocalList(reminderKey);
  entries.unshift({ title: document.getElementById('reminder-title').value.trim(), date: document.getElementById('reminder-date').value });
  if (!writeLocalList(reminderKey, entries)) { window.alert('Browser storage is unavailable. Your reminder was not saved.'); return; }
  event.currentTarget.reset();
  renderPrivateList(reminderKey, 'reminder-list', ['date', 'title']);
});
renderPrivateList(serviceKey, 'service-list', ['date', 'odometer', 'note']);
renderPrivateList(reminderKey, 'reminder-list', ['date', 'title']);
