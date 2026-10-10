const photos = ['assets/1.jpg', 'assets/2.jpg', 'assets/3.jpg'];
const heroImage = document.querySelector('.hero-photo');
const switches = [...document.querySelectorAll('.switch')];
let currentPhoto = 0;
function showPhoto(index) {
  currentPhoto = index;
  heroImage.style.opacity = '0.25';
  window.setTimeout(() => { heroImage.src = photos[index]; heroImage.style.opacity = '1'; }, 120);
  switches.forEach((button, i) => button.classList.toggle('active', i === index));
}
switches.forEach(button => button.addEventListener('click', () => showPhoto(Number(button.dataset.slide))));
window.setInterval(() => showPhoto((currentPhoto + 1) % photos.length), 7000);

const input = document.getElementById('car-photo');
const preview = document.getElementById('preview-image');
let localUrl;
input.addEventListener('change', () => {
  const file = input.files && input.files[0];
  if (!file) return;
  if (localUrl) URL.revokeObjectURL(localUrl);
  localUrl = URL.createObjectURL(file);
  preview.src = localUrl;
  preview.hidden = false;
  document.querySelector('.preview-empty').hidden = true;
  document.getElementById('result-title').textContent = 'Preview ready · no scan performed';
});

const toast = document.getElementById('toast');
let toastTimer;
document.querySelectorAll('[data-toast]').forEach(button => button.addEventListener('click', () => {
  toast.textContent = button.dataset.toast;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}));
const menuButton = document.querySelector('.menu-toggle');
menuButton.addEventListener('click', () => document.querySelector('.topbar nav').classList.toggle('open'));
document.querySelectorAll('.topbar nav a').forEach(link => link.addEventListener('click', () => document.querySelector('.topbar nav').classList.remove('open')));

const referenceProfiles = [
  {
    image: 'assets/1.jpg', alt: 'User photo 1: possible Mercedes-AMG A-Class hatchback', label: 'PHOTO 01 · VISUAL MATCH ONLY', overlayTitle: 'Mercedes-AMG<br>A-Class family', caption: 'Likely A 45 S · exact trim unverified',
    title: 'Possible Mercedes-AMG A 45 S',
    summary: 'The first photo appears to show an AMG A-Class hatchback. The detailed figures and equipment below are a current Mercedes-Benz India A 45 S reference, not a confirmed identification of the photographed car.',
    facts: [['ENGINE', '1,991 cc · 4-cylinder turbo petrol'], ['POWER', '310 kW / 421 HP'], ['TORQUE', '500 Nm'], ['TRANSMISSION', 'AMG SPEEDSHIFT DCT 8G automatic'], ['DRIVE', 'AMG 4MATIC+ all-wheel drive'], ['0–100 KM/H', '3.9 seconds'], ['DIMENSIONS', '4,453 × 1,850 × 1,414 mm*'], ['BOOT CAPACITY', '370 L'], ['FUEL TANK', '51 L'], ['SEATING', '5 seats · 5 doors'], ['CABIN', '10.25-inch media display · 64-colour ambient lighting'], ['AUDIO', 'Optional Burmester · 12 speakers · 710 W']],
    note: '* Width excludes mirrors. Equipment can be optional or vary by vehicle configuration. Reference specifications vary by model year and market; see the linked manufacturer page before relying on them.',
    aliases: ['a45 s', 'a45', 'mercedes a-class', 'mercedes amg a-class', 'amg a-class', 'a-class hatchback'],
    manufacturer: 'https://www.mercedes-benz.co.in/passengercars/models/hatchback/a-class/amg.html', wiki: 'https://en.wikipedia.org/wiki/Mercedes-Benz_A-Class', sourceName: 'Mercedes-Benz India · AMG A-Class'
  },
  {
    image: 'assets/2.jpg', alt: 'User photo 2: Mercedes-Maybach SUV, likely GLS family', label: 'PHOTO 02 · VISUAL MATCH ONLY', overlayTitle: 'Mercedes-Maybach<br>GLS family', caption: 'GLS 600 is a reference · confirm variant',
    title: 'Possible Mercedes-Maybach GLS 600',
    summary: 'The second photo shows Maybach branding on a large luxury SUV; the GLS family is a strong visual candidate. The figures and equipment below describe the Mercedes-Benz India GLS 600 reference, not a verified trim or model year for this photo.',
    facts: [['ENGINE', '3,982 cc V8 petrol · mild hybrid'], ['POWER', '410 kW + 16 kW (557 + 22 HP)'], ['TORQUE', '770 Nm'], ['TRANSMISSION', '9G-TRONIC 9-speed automatic'], ['DRIVE', '4MATIC all-wheel drive'], ['0–100 KM/H', '4.9 seconds'], ['DIMENSIONS', '5,208 × 2,030 × 1,838 mm*'], ['BOOT CAPACITY', '520 L'], ['FUEL TANK', '90 L'], ['SEATING', '5 seats · 5 doors'], ['CABIN', 'First-Class rear suite · two individual seats'], ['AUDIO', 'Burmester 3D · 29 speakers · 1,610 W'], ['ASSISTANCE', '360° camera · active parking assist'], ['CHASSIS', 'E-ACTIVE BODY CONTROL available']],
    note: '* Width excludes mirrors. Equipment and seating configuration can vary. Reference specifications vary by model year and market; see the linked manufacturer page before relying on them.',
    aliases: ['maybach gls', 'gls 600', 'mercedes maybach gls', 'mercedes-benz gls'],
    manufacturer: 'https://www.mercedes-benz.co.in/passengercars/models/suv/mercedes-maybach-gls/overview.html', wiki: 'https://en.wikipedia.org/wiki/Mercedes-Benz_GLS#Mercedes-Maybach_GLS', sourceName: 'Mercedes-Benz India · Maybach GLS'
  },
  {
    image: 'assets/3.jpg', alt: 'User photo 3: Audi luxury sedan, possible A8 L', label: 'PHOTO 03 · VISUAL MATCH ONLY', overlayTitle: 'Audi<br>luxury sedan', caption: 'A8 L is a candidate · exact model unverified',
    title: 'Possible Audi A8 L',
    summary: 'The third photo appears to show a large Audi sedan and may be an A8 L. The A8 is Audi’s full-size luxury sedan family; its engine, performance, dimensions and equipment change by generation, year and market.',
    facts: [['VEHICLE CLASS', 'Full-size luxury sedan'], ['BODY', 'Four-door; A8 L is long-wheelbase'], ['ENGINE', 'Varies by model year and market'], ['TRANSMISSION', 'Variant dependent'], ['DRIVE', 'Quattro available on select variants'], ['EXACT SPEC', 'Check VIN, RC or model documents']],
    note: 'The image does not establish the A8 generation or trim, so no engine or performance figures are guessed here.',
    aliases: ['audi a8', 'a8 l', 'a8l', 'audi a8 l'],
    manufacturer: 'https://www.audi.in/en/', wiki: 'https://en.wikipedia.org/wiki/Audi_A8', sourceName: 'Audi India · model and owner support'
  }
];

const profileTabs = [...document.querySelectorAll('.vehicle-tab')];
function showReferenceProfile(index) {
  const car = referenceProfiles[index];
  if (!car) return;
  document.getElementById('reference-image').src = car.image;
  document.getElementById('reference-image').alt = car.alt;
  document.getElementById('reference-label').textContent = car.label;
  document.getElementById('reference-title').innerHTML = car.overlayTitle;
  document.getElementById('reference-caption').textContent = car.caption;
  document.getElementById('vehicle-title').textContent = car.title;
  document.getElementById('vehicle-summary').textContent = car.summary;
  document.getElementById('vehicle-facts').innerHTML = car.facts.map(([label, value]) => `<div><small>${label}</small><strong>${value}</strong></div>`).join('');
  document.getElementById('spec-note').textContent = car.note;
  document.getElementById('manufacturer-link').href = car.manufacturer;
  document.getElementById('manufacturer-link').textContent = car.sourceName;
  document.getElementById('wikipedia-link').href = car.wiki;
  document.getElementById('wikipedia-link').textContent = `Wikipedia article · ${car.title.replace('Possible ', '')}`;
  profileTabs.forEach((tab, i) => {
    const selected = i === index;
    tab.classList.toggle('active', selected);
    tab.setAttribute('aria-selected', String(selected));
  });
}
profileTabs.forEach(tab => tab.addEventListener('click', () => showReferenceProfile(Number(tab.dataset.profile))));

const searchForm = document.getElementById('car-search-form');
const searchInput = document.getElementById('car-search-input');
const finderStatus = document.getElementById('finder-status');
const finderResult = document.getElementById('finder-result');
const finderVideos = document.getElementById('finder-videos');
const videoResults = document.getElementById('video-results');
const comparePanel = document.getElementById('compare-panel');
const comparedProfiles = new Set();

function normalized(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function knownProfileIndex(query) {
  const term = normalized(query);
  return referenceProfiles.findIndex(car => car.aliases.some(alias => term.includes(normalized(alias)) || normalized(alias).includes(term) && term.length > 4));
}
function makeLink(label, href, className = 'finder-link') {
  const link = document.createElement('a');
  link.className = className;
  link.href = href;
  link.textContent = label;
  if (/^https?:/i.test(href)) {
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
  }
  return link;
}
function renderKnownProfile(index) {
  const car = referenceProfiles[index];
  finderResult.replaceChildren();
  const card = document.createElement('article');
  card.className = 'finder-car-card';
  const image = document.createElement('img');
  image.src = car.image;
  image.alt = car.alt;
  const body = document.createElement('div');
  body.className = 'finder-car-body';
  const eyebrow = document.createElement('span');
  eyebrow.className = 'result-kicker';
  eyebrow.textContent = `PHOTO REFERENCE ${String(index + 1).padStart(2, '0')} · VISUAL MATCH ONLY`;
  const title = document.createElement('h3');
  title.textContent = car.title;
  const summary = document.createElement('p');
  summary.textContent = car.summary;
  const facts = document.createElement('div');
  facts.className = 'finder-facts';
  car.facts.forEach(([label, value]) => {
    const fact = document.createElement('div');
    const name = document.createElement('small');
    name.textContent = label;
    const detail = document.createElement('strong');
    detail.textContent = value;
    fact.append(name, detail);
    facts.append(fact);
  });
  const actions = document.createElement('div');
  actions.className = 'finder-actions';
  actions.append(makeLink(car.sourceName, car.manufacturer), makeLink('Wikipedia overview', car.wiki));
  const compare = document.createElement('button');
  compare.className = 'compare-toggle';
  compare.type = 'button';
  compare.dataset.addCompare = String(index);
  compare.textContent = comparedProfiles.has(index) ? 'Remove from compare −' : 'Add to compare +';
  actions.append(compare);
  body.append(eyebrow, title, summary, facts, actions);
  card.append(image, body);
  finderResult.append(card);
  finderStatus.textContent = 'Reference profile found. Exact vehicle identity still needs confirmation.';
}

function renderWikipediaResult(car, query) {
  finderResult.replaceChildren();
  const articles = Array.isArray(car) ? car : car ? [car] : [];
  if (!articles.length) {
    const empty = document.createElement('article');
    empty.className = 'wiki-result-card';
    const title = document.createElement('h3'); title.textContent = `No reference preview found for “${query}”`;
    const summary = document.createElement('p'); summary.textContent = 'Try a shorter make or model name, or use the direct searches below.';
    empty.append(title, summary, makeLink('Search Wikipedia ↗', `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`));
    finderResult.append(empty);
  } else {
    const article = articles[0];
    const card = document.createElement('article'); card.className = 'wiki-result-card wiki-lead-card';
    const media = document.createElement('div'); media.className = 'wiki-lead-media';
    if (article.thumbnail) {
      const image = document.createElement('img'); image.src = article.thumbnail; image.alt = `${article.title} reference image`; image.loading = 'lazy';
      image.addEventListener('error', () => media.remove(), { once: true });
      media.append(image);
    }
    const body = document.createElement('div'); body.className = 'wiki-lead-body';
    const label = document.createElement('span'); label.className = 'result-kicker'; label.textContent = 'PUBLIC REFERENCE · VERIFY YEAR, MARKET & VARIANT';
    const title = document.createElement('h3'); title.textContent = article.title;
    const summary = document.createElement('p'); summary.textContent = article.extract || 'Open the article for more information.';
    const articleLink = makeLink('Read the Wikipedia overview ↗', article.url);
    body.append(label, title, summary, articleLink);
    card.append(media, body);
    finderResult.append(card);

    if (articles.length > 1) {
      const related = document.createElement('section'); related.className = 'wiki-related-results';
      const heading = document.createElement('h4'); heading.textContent = 'Related reference pages';
      const grid = document.createElement('div'); grid.className = 'wiki-related-grid';
      articles.slice(1, 5).forEach(article => {
        const item = document.createElement('article'); item.className = 'wiki-related-card';
        const name = document.createElement('h5'); name.textContent = article.title;
        const extract = document.createElement('p'); extract.textContent = article.extract || 'Open this related reference page.';
        item.append(name, extract, makeLink('Open reference ↗', article.url)); grid.append(item);
      });
      related.append(heading, grid); finderResult.append(related);
    }
  }
  const sources = document.createElement('article'); sources.className = 'wiki-result-card source-result-card';
  const sourceTitle = document.createElement('h3'); sourceTitle.textContent = `More sources for ${query}`;
  const note = document.createElement('p'); note.textContent = 'The profile below combines public reference text, structured Wikidata entries and Wikimedia Commons images when available. Specs may be missing, outdated or apply to a different generation or market; check the manufacturer for your exact variant.';
  const links = document.createElement('div'); links.className = 'finder-actions';
  links.append(
    makeLink('Search official manufacturer pages ↗', `https://www.google.com/search?q=${encodeURIComponent(`${query} official manufacturer`)}`),
    makeLink('Search CarDekho ↗', `https://www.google.com/search?q=${encodeURIComponent(`site:cardekho.com ${query} car`)}`),
    makeLink('Search used-car listings ↗', `https://www.google.com/search?q=${encodeURIComponent(`site:cardekho.com/used-cars ${query}`)}`)
  );
  sources.append(sourceTitle, note, links);
  finderResult.append(sources);
}

async function wikipediaOverview(query) {
  const searchUrl = new URL('https://en.wikipedia.org/w/api.php');
  searchUrl.searchParams.set('action', 'query');
  searchUrl.searchParams.set('list', 'search');
  searchUrl.searchParams.set('srsearch', query);
  searchUrl.searchParams.set('srlimit', '5');
  searchUrl.searchParams.set('srnamespace', '0');
  searchUrl.searchParams.set('format', 'json');
  searchUrl.searchParams.set('origin', '*');
  const searchResponse = await fetch(searchUrl);
  if (!searchResponse.ok) throw new Error('Wikipedia search unavailable');
  const searchData = await searchResponse.json();
  const titles = (searchData.query?.search || []).map(result => result.title).filter(Boolean);
  if (!titles.length) return [];

  const summaryUrl = new URL('https://en.wikipedia.org/w/api.php');
  summaryUrl.searchParams.set('action', 'query');
  summaryUrl.searchParams.set('prop', 'extracts|info|pageimages|pageprops');
  summaryUrl.searchParams.set('exintro', '1');
  summaryUrl.searchParams.set('explaintext', '1');
  summaryUrl.searchParams.set('exchars', '5200');
  summaryUrl.searchParams.set('pithumbsize', '640');
  summaryUrl.searchParams.set('inprop', 'url');
  summaryUrl.searchParams.set('titles', titles.join('|'));
  summaryUrl.searchParams.set('format', 'json');
  summaryUrl.searchParams.set('origin', '*');
  const summaryResponse = await fetch(summaryUrl);
  if (!summaryResponse.ok) throw new Error('Wikipedia article unavailable');
  const summaryData = await summaryResponse.json();
  const pages = Object.values(summaryData.query?.pages || {});
  return titles.map(title => pages.find(page => page.title?.toLowerCase() === title.toLowerCase()))
    .filter(Boolean)
    .map(article => ({
      title: article.title,
      extract: article.extract || '',
      thumbnail: article.thumbnail?.source || '',
      wikidataId: article.pageprops?.wikibase_item || '',
      url: article.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replaceAll(' ', '_'))}`
    }));
}

const wikidataProperties = [
  ["P2109", "Nominal power"], ["P2230", "Torque"], ["P8628", "Engine displacement"],
  ['P2052', 'Speed'], ['P3039', 'Wheelbase'], ['P2043', 'Length'],
  ['P2049', 'Width'], ['P2048', 'Height'], ['P2073', 'Vehicle range'],
    ['P2067', 'Mass'], ['P176', 'Manufacturer'], ['P571', 'Inception']
];

async function wikidataVehicle(article, query) {
  let qid = article.wikidataId;
  if (!qid) {
    const search = new URL('https://www.wikidata.org/w/api.php');
    search.search = new URLSearchParams({ action: 'wbsearchentities', search: query, language: 'en', limit: '5', format: 'json', origin: '*' });
    const results = await fetch(search).then(response => response.ok ? response.json() : null);
    const candidates = results?.search || [];
    const matched = candidates.find(item => /car|automobile|vehicle|motor car|sports car/i.test(item.description || '') && (normalized(item.label || '').includes(normalized(query)) || normalized(query).includes(normalized(item.label || ''))));
    qid = matched?.id || '';
  }
  if (!/^Q\d+$/.test(qid || '')) return null;

  const entityUrl = new URL('https://www.wikidata.org/w/api.php');
  entityUrl.search = new URLSearchParams({ action: 'wbgetentities', ids: qid, props: 'labels|descriptions|claims', languages: 'en', format: 'json', origin: '*' });
  const result = await fetch(entityUrl).then(response => response.ok ? response.json() : null);
  const entity = result?.entities?.[qid];
  if (!entity || entity.missing !== undefined) return null;

  const ids = new Set();
  const labelsById = {};
  const quantityFor = (claim, property) => {
    const value = claim?.mainsnak?.datavalue?.value;
    if (property === 'P176') {
      if (value?.id) ids.add(value.id);
      return value?.id ? { type: 'item', id: value.id } : null;
    }
    if (property === 'P571' && value?.time) return { type: 'date', value: value.time.slice(1, 5) };
    if (value?.amount !== undefined) {
      const unit = (value.unit || '').match(/Q\d+$/)?.[0] || '';
      if (unit) ids.add(unit);
      return { type: 'quantity', amount: Number(value.amount), unit };
    }
    return null;
  };
  const values = {};
  wikidataProperties.forEach(([property]) => {
    const claims = entity.claims?.[property] || [];
    const preferred = claims.filter(claim => claim.rank === 'preferred');
    const active = preferred.length ? preferred : claims.filter(claim => claim.rank !== 'deprecated');
    const collected = active.map(claim => quantityFor(claim, property)).filter(Boolean);
    if (collected.length) values[property] = collected.slice(0, 3);
  });

  if (ids.size) {
    const labelsUrl = new URL('https://www.wikidata.org/w/api.php');
    labelsUrl.search = new URLSearchParams({ action: 'wbgetentities', ids: [...ids].join('|'), props: 'labels', languages: 'en', format: 'json', origin: '*' });
    const labelData = await fetch(labelsUrl).then(response => response.ok ? response.json() : null);
    Object.entries(labelData?.entities || {}).forEach(([id, item]) => { if (item.labels?.en?.value) labelsById[id] = item.labels.en.value; });
  }

  const labelMap = labelsById;
  const label = entity.labels?.en?.value || article.title;
  const description = entity.descriptions?.en?.value || '';
  const rows = wikidataProperties.flatMap(([property, name]) => (values[property] || []).map(value => {
    let rendered = '';
    if (value.type === 'item') rendered = labelMap[value.id] || value.id;
    else if (value.type === 'date') rendered = value.value;
    else {
      const amount = Number.isFinite(value.amount) ? Number(value.amount.toPrecision(5)).toLocaleString('en-IN') : '';
      const unit = value.unit ? (labelMap[value.unit] || value.unit) : '';
      rendered = `${amount}${unit ? ` ${unit}` : ''}`;
    }
    return { property, name, value: rendered, raw: value, source: `https://www.wikidata.org/wiki/${qid}#${property}` };
  }));
  return { qid, label, description, rows, values, unitLabels: labelMap, source: `https://www.wikidata.org/wiki/${qid}` };
}

function wikidataMetric(property, value, labels) {
  if (value?.type !== 'quantity' || !Number.isFinite(value.amount)) return null;
  const unit = (labels[value.unit] || '').toLowerCase();
  const amount = value.amount;
  if (property === 'P2109') {
    if (unit.includes('kilowatt')) return { name: 'Power', value: amount, unit: 'kW', limit: 1000 };
    if (unit === 'watt' || unit.endsWith(' watt')) return { name: 'Power', value: amount / 1000, unit: 'kW', limit: 1000 };
    if (unit.includes('horsepower') && unit.includes('metric')) return { name: 'Power', value: amount * .7355, unit: 'kW', limit: 1000 };
    if (unit.includes('horsepower')) return { name: 'Power', value: amount * .7457, unit: 'kW', limit: 1000 };
  }
  if (property === 'P2230') {
    if (unit.includes('kilonewton')) return { name: 'Torque', value: amount * 1000, unit: 'Nm', limit: 2000 };
    if (unit.includes('pound') || unit.includes('foot-pound')) return { name: 'Torque', value: amount * 1.3558, unit: 'Nm', limit: 2000 };
    if (unit.includes('newton metre') || unit === 'newton-meter' || unit === 'newton metre') return { name: 'Torque', value: amount, unit: 'Nm', limit: 2000 };
  }
  if (property === 'P2052') {
    if (unit.includes('kilometre per hour') || unit.includes('kilometer per hour')) return { name: 'Speed', value: amount, unit: 'km/h', limit: 400 };
    if (unit.includes('mile per hour')) return { name: 'Speed', value: amount * 1.60934, unit: 'km/h', limit: 400 };
    if (unit.includes('metre per second') || unit.includes('meter per second')) return { name: 'Speed', value: amount * 3.6, unit: 'km/h', limit: 400 };
  }
  return null;
}

function renderSpecTable(target, vehicle) {
  const rows = vehicle?.rows || [];
  const section = document.createElement('section'); section.className = 'spec-table-section';
  const heading = document.createElement('div'); heading.className = 'detail-section-heading';
  const title = document.createElement('h4'); title.textContent = 'Specifications found in public data';
  const context = document.createElement('p'); context.textContent = vehicle ? `${vehicle.label}${vehicle.description ? ` · ${vehicle.description}` : ''}` : 'No matching structured vehicle record was found for this search.';
  heading.append(title, context); section.append(heading);

  const metrics = [];
  for (const [property, values] of Object.entries(vehicle?.values || {})) {
    const metric = wikidataMetric(property, values[0], vehicle.unitLabels);
    if (metric && !metrics.some(item => item.name === metric.name)) metrics.push(metric);
  }
  if (metrics.length) {
    const chart = document.createElement('div'); chart.className = 'spec-graphic';
    const chartTitle = document.createElement('div'); chartTitle.className = 'spec-graphic-title';
    chartTitle.innerHTML = "<span>POWER, TORQUE & SPEED</span><small>Reference scale · not a cross-model comparison</small>";
    chart.append(chartTitle);
    metrics.forEach(metric => {
      const row = document.createElement('div'); row.className = 'spec-meter-row';
      const label = document.createElement('div'); label.className = 'spec-meter-label';
      const name = document.createElement('span'); name.textContent = metric.name;
      const value = document.createElement('strong'); value.textContent = `${Number(metric.value.toFixed(1)).toLocaleString('en-IN')} ${metric.unit}`;
      label.append(name, value);
      const track = document.createElement('div'); track.className = 'spec-meter-track';
      const fill = document.createElement('span'); fill.style.width = `${Math.max(2, Math.min(100, metric.value / metric.limit * 100))}%`; track.append(fill);
      row.append(label, track); chart.append(row);
    });
    section.append(chart);
  }

  if (rows.length) {
    const tableWrap = document.createElement('div'); tableWrap.className = 'spec-table-wrap';
    const table = document.createElement('table'); table.className = 'spec-table';
    const head = document.createElement('thead'); head.innerHTML = '<tr><th scope="col">Specification</th><th scope="col">Public data value</th><th scope="col">Source</th></tr>';
    const body = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      const name = document.createElement('th'); name.scope = 'row'; name.textContent = row.name;
      const value = document.createElement('td'); value.textContent = row.value;
      const source = document.createElement('td'); source.append(makeLink('Wikidata ↗', row.source, 'spec-source-link'));
      tr.append(name, value, source); body.append(tr);
    });
    table.append(head, body); tableWrap.append(table); section.append(tableWrap);
  } else {
    const empty = document.createElement('p'); empty.className = 'spec-empty'; empty.textContent = 'Wikidata has no usable engine or dimension values for this entry yet. Chassis leaves missing figures blank rather than estimating them.'; section.append(empty);
  }

  const note = document.createElement('p'); note.className = 'spec-provenance';
  note.textContent = vehicle ? 'Structured data is model-level and may cover another generation, trim, or market. Check the manufacturer’s brochure for the exact variant. Wikidata facts are published under CC0.' : 'Exact trim-level figures, price and availability are not claimed when public structured data does not provide them.';
  if (vehicle) note.append(' '); section.append(note);
  if (vehicle) section.append(makeLink('Open this Wikidata record ↗', vehicle.source, 'spec-source-link'));
  target.append(section);
}

function cleanMetadata(value) { return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim(); }

async function commonsVehicleImages(query, view) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'query', generator: 'search', gsrsearch: `${query} car ${view}`, gsrnamespace: '6', gsrlimit: '5', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '1200', format: 'json', origin: '*' });
  const response = await fetch(url);
  if (!response.ok) throw new Error('Wikimedia Commons image search unavailable');
  const data = await response.json();
  return Object.values(data.query?.pages || []).map(page => {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !info?.descriptionurl) return null;
    const meta = info.extmetadata || {};
    const artist = cleanMetadata(meta.Artist?.value || meta.Credit?.value);
    const license = cleanMetadata(meta.LicenseShortName?.value);
    return { title: page.title?.replace(/^File:/, '') || '', image: info.thumburl, page: info.descriptionurl, licenseUrl: meta.LicenseUrl?.value || info.descriptionurl, license: license || 'See file page', artist };
  }).filter(Boolean);
}

function renderImageGallery(target, query, localImage) {
  const gallery = document.createElement('section'); gallery.className = 'vehicle-image-gallery';
  const heading = document.createElement('div'); heading.className = 'detail-section-heading';
  const title = document.createElement('h4'); title.textContent = 'Exterior & cabin gallery';
  const intro = document.createElement('p'); intro.textContent = 'Community images from Wikimedia Commons. The result can be a different year or trim; check the file page and its reuse terms.';
  heading.append(title, intro); gallery.append(heading);
  if (localImage) {
    const supplied = document.createElement('figure'); supplied.className = 'vehicle-gallery-image supplied-gallery-image';
    const image = document.createElement('img'); image.src = localImage.image; image.alt = localImage.alt; image.loading = 'lazy';
    const caption = document.createElement('figcaption'); caption.innerHTML = '<strong>Supplied photo</strong><small>Visual reference only · exact year and trim unverified</small>';
    supplied.append(image, caption);
    const localSection = document.createElement('div'); localSection.className = 'gallery-group';
    const localTitle = document.createElement('h5'); localTitle.textContent = 'Your car photo'; localSection.append(localTitle, supplied); gallery.append(localSection);
  }
  const views = [
    { key: 'exterior', title: 'Exterior references' },
    { key: 'interior dashboard', title: 'Interior & dashboard references' }
  ];
  views.forEach(view => {
    const group = document.createElement('div'); group.className = 'gallery-group';
    const groupTitle = document.createElement('h5'); groupTitle.textContent = view.title;
    const grid = document.createElement('div'); grid.className = 'vehicle-gallery-grid';
    const status = document.createElement('p'); status.className = 'gallery-status'; status.textContent = 'Finding reusable reference images…';
    group.append(groupTitle, grid, status); gallery.append(group);
    commonsVehicleImages(query, view.key).then(images => {
      status.textContent = images.length ? `${images.length} Commons image${images.length === 1 ? '' : 's'} · open each file page to review attribution and license.` : `No close Commons match found. Search Commons for “${query} ${view.key}”.`;
      images.forEach(item => {
        const figure = document.createElement('figure'); figure.className = 'vehicle-gallery-image';
        const anchor = document.createElement('a'); anchor.href = item.page; anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; anchor.setAttribute('aria-label', `Open Commons image ${item.title}`);
        const image = document.createElement('img'); image.src = item.image; image.alt = `${item.title} · ${view.title}`; image.loading = 'lazy';
        image.addEventListener('error', () => figure.remove(), { once: true }); anchor.append(image);
        const caption = document.createElement('figcaption');
        const name = document.createElement('strong'); name.textContent = item.title || `${query} ${view.title}`;
        const credit = document.createElement('small'); credit.textContent = [item.artist ? `Photo: ${item.artist}` : 'Photographer details on file page', item.license].join(' · ');
        const links = document.createElement('span'); links.className = 'gallery-credit-links';
        links.append(makeLink('File source ↗', item.page, 'gallery-source-link'), makeLink('License ↗', item.licenseUrl, 'gallery-source-link'));
        caption.append(name, credit, links); figure.append(anchor, caption); grid.append(figure);
      });
      if (!images.length) {
        const searchLink = makeLink('Search Wikimedia Commons ↗', `https://commons.wikimedia.org/wiki/Special:MediaSearch?type=image&search=${encodeURIComponent(`${query} car ${view.key}`)}`, 'gallery-source-link');
        status.append(' ', searchLink);
      }
    }).catch(() => {
      status.textContent = 'Could not load this image group. Try again later or search Commons directly.';
    });
  });
  target.append(gallery);
}

async function appendRichCarDetails(article, query, localImage) {
  const panel = document.createElement('article'); panel.className = 'dynamic-detail-panel';
  const top = document.createElement('div'); top.className = 'dynamic-detail-top';
  const kicker = document.createElement('span'); kicker.className = 'result-kicker'; kicker.textContent = 'CAR REFERENCE PROFILE · LIVE PUBLIC SOURCES';
  const h3 = document.createElement('h3'); h3.textContent = article?.title || query;
  const attribution = document.createElement('p'); attribution.className = 'profile-attribution';
  attribution.append('Article overview: '); attribution.append(makeLink('Wikipedia contributors ↗', article?.url || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`, 'spec-source-link'));
  attribution.append(' · Structured vehicle facts: Wikidata CC0 · Images: individual Wikimedia Commons file pages and licenses.');
  top.append(kicker, h3, attribution); panel.append(top);

  const narrative = document.createElement('section'); narrative.className = 'car-narrative';
  const narrativeHeading = document.createElement('h4'); narrativeHeading.textContent = 'About this car';
  const narrativeText = document.createElement('p');
  const extract = (article?.extract || '').replace(/\s+/g, ' ').trim();
  narrativeText.textContent = extract ? `${extract.slice(0, 1050)}${extract.length > 1050 ? '…' : ''}` : `We found no general encyclopedia overview for “${query}”. Search the manufacturer’s site for an official product page and exact model year.`;
  narrative.append(narrativeHeading, narrativeText);
  if (article?.url) narrative.append(makeLink('Read the full article ↗', article.url, 'spec-source-link'));
  panel.append(narrative);

  const loading = document.createElement('section'); loading.className = 'spec-table-section';
  const loadingTitle = document.createElement('h4'); loadingTitle.textContent = 'Loading public specifications…';
  loading.append(loadingTitle); panel.append(loading);
  const galleryContainer = document.createElement('div');
  panel.append(galleryContainer);
  finderResult.append(panel);

  const vehicle = article ? await wikidataVehicle(article, query).catch(() => null) : null;
  loading.replaceChildren(); renderSpecTable(loading, vehicle);
  renderImageGallery(galleryContainer, query, localImage);
}

function renderFallbackVideoLinks(query) {
  videoResults.replaceChildren();
  const creators = [
    { name: 'Faisal Khan', handle: 'FasBeam' },
    { name: 'MotorOctane', handle: 'motoroctane' }
  ];
  creators.forEach(creator => {
    const card = document.createElement('article');
    card.className = 'video-link-card';
    const kicker = document.createElement('span');
    kicker.textContent = 'SEARCH THIS CREATOR';
    const heading = document.createElement('h4');
    heading.textContent = creator.name;
    const description = document.createElement('p');
    description.textContent = `Find ${query} reviews and drive videos on YouTube.`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} ${creator.name} car review`)}`;
    card.append(kicker, heading, description, makeLink('Search videos ↗', searchUrl));
    videoResults.append(card);
  });
  document.getElementById('video-caption-note').textContent = 'These links open YouTube search results. Captions are controlled by YouTube; turn on CC when a video provides them. To show captioned videos inside this page, configure the optional YouTube API key as described in README.md.';
}

function renderCaptionedVideos(videos) {
  if (!videos.length) return false;
  videoResults.replaceChildren();
  videos.forEach(video => {
    if (!/^[A-Za-z0-9_-]{11}$/.test(video.id || '')) return;
    const card = document.createElement('article');
    card.className = 'video-card';
    const creator = document.createElement('span');
    creator.textContent = `${video.creator} · CAPTIONS AVAILABLE`;
    const thumbLink = document.createElement('a');
    thumbLink.className = 'video-thumbnail-link';
    thumbLink.href = video.watchUrl;
    thumbLink.target = '_blank';
    thumbLink.rel = 'noopener noreferrer';
    thumbLink.setAttribute('aria-label', `Watch ${video.title} on YouTube`);
    const thumbnail = document.createElement('img');
    thumbnail.className = 'video-thumbnail';
    thumbnail.src = video.thumbnail || `https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg`;
    thumbnail.alt = `Video thumbnail: ${video.title}`;
    thumbnail.loading = 'lazy';
    const play = document.createElement('span'); play.className = 'video-play-mark'; play.setAttribute('aria-hidden', 'true'); play.textContent = '▶';
    thumbLink.append(thumbnail, play);
    const title = document.createElement('strong');
    title.textContent = video.title;
    const meta = document.createElement('small');
    meta.className = 'video-card-meta';
    meta.textContent = `${video.channel || video.creator}${video.publishedAt ? ` · ${new Date(video.publishedAt).getFullYear()}` : ''}`;
    card.append(creator, thumbLink, title, meta, makeLink('Open this video on YouTube ↗', video.watchUrl));
    videoResults.append(card);
  });
  document.getElementById('video-caption-note').textContent = 'Each image is the video’s YouTube thumbnail and opens its direct watch page. YouTube videos marked as captioned are searched; turn on CC in the player when captions are available.';
  return true;
}

async function loadVideos(query) {
  finderVideos.hidden = false;
  renderFallbackVideoLinks(query);
  try {
    const response = await fetch(`/api/videos?q=${encodeURIComponent(query)}`);
    if (!response.ok) return;
    const data = await response.json();
    if (data.configured) {
      if (renderCaptionedVideos(data.videos)) return;
      renderFallbackVideoLinks(query);
      document.getElementById('video-caption-note').textContent = 'No captioned embeds were found for this search. Use these channel-focused YouTube searches and turn on CC when the video offers captions.';
    }
  } catch { /* Static-file mode keeps the channel search links available. */ }
}

async function searchCar(query) {
  const term = query.trim();
  if (!term) return;
  finderResult.hidden = false;
  finderStatus.textContent = `Searching for ${term}…`;
  finderVideos.hidden = true;
  const localIndex = knownProfileIndex(term);
  if (localIndex >= 0) {
    renderKnownProfile(localIndex);
    const car = referenceProfiles[localIndex];
    let article = null;
    try { article = (await wikipediaOverview(car.title.replace(/^Possible\s+/i, '')))[0] || null; } catch { /* Keep the supplied photo profile and its source links available. */ }
    await appendRichCarDetails(article, car.title.replace(/^Possible\s+/i, ''), { image: car.image, alt: car.alt });
  } else {
    try {
      const articles = await wikipediaOverview(term);
      renderWikipediaResult(articles, term);
      if (articles.length) await appendRichCarDetails(articles[0], term);
      finderStatus.textContent = articles.length ? `${articles.length} public reference results found. Confirm exact model year and variant with the manufacturer.` : 'No matching article preview found; direct source searches are ready.';
    } catch {
      renderWikipediaResult(null, term);
      await appendRichCarDetails(null, term);
      finderStatus.textContent = 'Online reference could not load. Direct source searches are ready below.';
    }
  }
  loadVideos(term);
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchCar(searchInput.value);
});
document.querySelectorAll('[data-car-search]').forEach(button => button.addEventListener('click', () => {
  searchInput.value = button.dataset.carSearch;
  searchCar(button.dataset.carSearch);
}));

finderResult.addEventListener('click', event => {
  const compareButton = event.target.closest('[data-add-compare]');
  if (compareButton) {
    const index = Number(compareButton.dataset.addCompare);
    if (comparedProfiles.has(index)) comparedProfiles.delete(index);
    else if (comparedProfiles.size >= 3) {
      finderStatus.textContent = 'You can compare up to three cars at a time.';
      return;
    } else comparedProfiles.add(index);
    compareButton.textContent = comparedProfiles.has(index) ? 'Remove from compare −' : 'Add to compare +';
    renderComparison();
  }
});

function renderComparison() {
  const indexes = [...comparedProfiles];
  comparePanel.hidden = indexes.length === 0;
  if (!indexes.length) return;
  comparePanel.replaceChildren();
  const heading = document.createElement('div');
  heading.className = 'compare-heading';
  const title = document.createElement('h3');
  title.textContent = indexes.length > 1 ? 'Side-by-side comparison' : 'Comparison list';
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.textContent = 'Clear comparison';
  clear.addEventListener('click', () => {
    comparedProfiles.clear();
    renderComparison();
    finderResult.querySelectorAll('[data-add-compare]').forEach(button => { button.textContent = 'Add to compare +'; });
  });
  heading.append(title, clear);
  comparePanel.append(heading);
  if (indexes.length < 2) {
    const prompt = document.createElement('p');
    prompt.textContent = 'Search another included photo profile and add it to compare.';
    comparePanel.append(prompt);
    return;
  }
  const table = document.createElement('table');
  table.className = 'compare-table';
  const header = document.createElement('tr');
  const firstCell = document.createElement('th'); firstCell.textContent = 'DETAIL'; header.append(firstCell);
  indexes.forEach(index => { const th = document.createElement('th'); th.textContent = referenceProfiles[index].title; header.append(th); });
  const thead = document.createElement('thead'); thead.append(header); table.append(thead);
  const tbody = document.createElement('tbody');
  const labels = [...new Set(indexes.flatMap(index => referenceProfiles[index].facts.map(([label]) => label)))];
  labels.forEach(label => {
    const row = document.createElement('tr');
    const headingCell = document.createElement('th'); headingCell.textContent = label; row.append(headingCell);
    indexes.forEach(index => {
      const item = referenceProfiles[index].facts.find(([factLabel]) => factLabel === label);
      const cell = document.createElement('td'); cell.textContent = item?.[1] || 'Not listed'; row.append(cell);
    });
    tbody.append(row);
  });
  table.append(tbody);
  comparePanel.append(table);
}
