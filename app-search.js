// The hero advances only when its active film ends or the visitor uses Next/Previous.
const heroFilms = [
  { src: 'assets/videos/video1.webm', title: 'Supplied film 01' },
  { src: 'assets/videos/video2.webm', title: 'Supplied film 02' },
  { src: 'assets/videos/video3.webm', title: 'Supplied film 03' },
  { src: 'assets/videos/video4.webm', title: 'Supplied film 04' }
];
const heroVideo = document.querySelector('.hero-video');
const ambientCanvas = document.querySelector('.ambient-canvas');
const ambientContext = ambientCanvas?.getContext('2d', { alpha: false });
const heroVideoCount = document.getElementById('hero-video-count');
const heroVideoTitle = document.getElementById('hero-video-title');
const heroVideoProgress = document.getElementById('hero-video-progress');
const heroMuteToggle = document.querySelector('[data-video-mute]');
let currentFilm = 0;
let ambientTimer;
let filmLoadId = 0;

function paintAmbientFrame() {
  if (!ambientContext || !heroVideo || heroVideo.readyState < 2) return;
  const sourceWidth = heroVideo.videoWidth || 16;
  const sourceHeight = heroVideo.videoHeight || 9;
  const targetRatio = ambientCanvas.width / ambientCanvas.height;
  const sourceRatio = sourceWidth / sourceHeight;
  let sx = 0, sy = 0, sw = sourceWidth, sh = sourceHeight;
  if (sourceRatio > targetRatio) { sw = sourceHeight * targetRatio; sx = (sourceWidth - sw) / 2; }
  else { sh = sourceWidth / targetRatio; sy = (sourceHeight - sh) / 2; }
  ambientContext.drawImage(heroVideo, sx, sy, sw, sh, 0, 0, ambientCanvas.width, ambientCanvas.height);
}

function updateFilmControls() {
  if (!heroVideo) return;
  const duration = Number.isFinite(heroVideo.duration) && heroVideo.duration > 0 ? heroVideo.duration : 0;
  heroVideoProgress.style.width = duration ? `${Math.min(100, heroVideo.currentTime / duration * 100)}%` : '0%';
  heroMuteToggle.textContent = heroVideo.muted ? '◖' : '◖))';
  heroMuteToggle.setAttribute('aria-label', heroVideo.muted ? 'Turn sound on' : 'Turn sound off');
  heroMuteToggle.title = heroVideo.muted ? 'Turn sound on' : 'Turn sound off';
}

function showFilm(index) {
  if (!heroVideo) return;
  const loadId = ++filmLoadId;
  currentFilm = (index + heroFilms.length) % heroFilms.length;
  const film = heroFilms[currentFilm];
  heroVideo.pause();
  window.clearInterval(ambientTimer);
  heroVideo.src = film.src;
  heroVideo.load();
  heroVideoCount.textContent = `${String(currentFilm + 1).padStart(2, '0')} / ${String(heroFilms.length).padStart(2, '0')}`;
  heroVideoTitle.textContent = film.title;
  heroVideoProgress.style.width = '0%';
  heroVideo.play().then(() => {
    if (loadId !== filmLoadId || heroVideo.paused) return;
    window.clearInterval(ambientTimer);
    ambientTimer = window.setInterval(paintAmbientFrame, 90);
    updateFilmControls();
  }).catch(() => {
    if (loadId !== filmLoadId) return;
    updateFilmControls();
    heroVideoTitle.textContent = `${film.title} · Select Next to start`;
  });
}

heroVideo?.addEventListener('ended', () => showFilm(currentFilm + 1));
heroVideo?.addEventListener('click', () => showFilm(currentFilm + 1));
heroVideo?.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  showFilm(currentFilm + 1);
});
heroVideo?.addEventListener('timeupdate', updateFilmControls);
heroVideo?.addEventListener('play', () => {
  window.clearInterval(ambientTimer);
  ambientTimer = window.setInterval(paintAmbientFrame, 90);
  updateFilmControls();
});
heroVideo?.addEventListener('pause', () => { window.clearInterval(ambientTimer); paintAmbientFrame(); updateFilmControls(); });
document.querySelector('[data-video-prev]')?.addEventListener('click', () => showFilm(currentFilm - 1));
document.querySelector('[data-video-next]')?.addEventListener('click', () => showFilm(currentFilm + 1));
heroMuteToggle?.addEventListener('click', () => { heroVideo.muted = !heroVideo.muted; updateFilmControls(); });
if (ambientCanvas) { ambientCanvas.width = 120; ambientCanvas.height = 68; }
showFilm(0);

// The dark presentation is the default; the optional light preference is local to this browser.
const themeToggle = document.querySelector('[data-theme-toggle]');
function applyTheme(theme) {
  const selected = theme === 'light' ? 'light' : 'dark';
  const light = selected === 'light';
  document.documentElement.dataset.theme = selected;
  document.body.dataset.theme = selected;
  const themeColor = document.querySelector('meta[name="theme-color"]');
  if (themeColor) themeColor.content = light ? '#f4f3ef' : '#08090b';
  if (themeToggle) {
    themeToggle.innerHTML = light ? '☾ <span>Dark</span>' : '☼ <span>Light</span>';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeToggle.setAttribute('aria-pressed', String(light));
  }
}
let preferredTheme = 'dark';
try { preferredTheme = localStorage.getItem('chassis-theme') === 'light' ? 'light' : 'dark'; } catch { /* Theme still works without storage. */ }
applyTheme(preferredTheme);
themeToggle?.addEventListener('click', () => {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem('chassis-theme', theme); } catch { /* Theme remains active for this page view. */ }
});

// Service-report preview only: never sends, stores, looks up, or charges for the entered registration.
const reportForm = document.getElementById('service-report-form');
const reportRegistration = document.getElementById('report-registration');
const reportResult = document.getElementById('report-demo-result');
reportRegistration?.addEventListener('input', () => {
  const start = reportRegistration.selectionStart;
  const end = reportRegistration.selectionEnd;
  reportRegistration.value = reportRegistration.value.toUpperCase();
  reportRegistration.setSelectionRange(start, end);
});
reportForm?.addEventListener('submit', event => {
  event.preventDefault();
  const entered = reportRegistration.value.trim().toUpperCase();
  const normalizedRegistration = entered.replace(/[^A-Z0-9]/g, '');
  const regularRegistration = /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{1,4}$/.test(normalizedRegistration);
  const bhRegistration = /^[0-9]{2}BH[0-9]{4}[A-Z]{1,2}$/.test(normalizedRegistration);
  if (!regularRegistration && !bhRegistration) {
    reportResult.hidden = false;
    reportResult.textContent = 'Enter a valid-looking Indian vehicle registration, such as DL 8C AB 1234. The number will not be checked here.';
    document.getElementById('record-action-grid').hidden = true;
    reportRegistration.focus();
    return;
  }
  reportResult.hidden = false;
  reportResult.replaceChildren();
  const heading = document.createElement('strong');
  heading.textContent = 'Your number stayed on this page.';
  const detail = document.createElement('span');
  detail.textContent = 'Velocitrak has no live challan or insurance connection, so it did not check or store the registration. Enter it again only after opening the official service.';
  reportResult.append(heading, detail);
  document.getElementById('record-action-grid').hidden = false;
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
if (menuButton) {
  menuButton.addEventListener('click', () => {
    const nav = document.querySelector('.topbar nav');
    const open = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  document.querySelectorAll('.topbar nav a').forEach(link => link.addEventListener('click', () => {
    document.querySelector('.topbar nav').classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
  }));
}

const referenceProfiles = [
  {
    title: 'Mercedes-AMG A 45 S',
    summary: 'This curated reference profile describes the Mercedes-AMG A 45 S. Figures and equipment vary by model year and trim; confirm the exact vehicle through the linked manufacturer source.',
    facts: [['ENGINE', '1,991 cc · 4-cylinder turbo petrol'], ['POWER', '310 kW / 421 HP'], ['TORQUE', '500 Nm'], ['TRANSMISSION', 'AMG SPEEDSHIFT DCT 8G automatic'], ['DRIVE', 'AMG 4MATIC+ all-wheel drive'], ['0–100 KM/H', '3.9 seconds'], ['DIMENSIONS', '4,453 × 1,850 × 1,414 mm*'], ['BOOT CAPACITY', '370 L'], ['FUEL TANK', '51 L'], ['SEATING', '5 seats · 5 doors'], ['CABIN', '10.25-inch media display · 64-colour ambient lighting'], ['AUDIO', 'Optional Burmester · 12 speakers · 710 W']],
    note: '* Width excludes mirrors. Equipment can be optional or vary by vehicle configuration. Reference specifications vary by model year and market; see the linked manufacturer page before relying on them.',
    aliases: ['a45 s', 'a45', 'mercedes a-class', 'mercedes amg a-class', 'amg a-class', 'a-class hatchback'],
    manufacturer: 'https://www.mercedes-benz.co.in/passengercars/models/hatchback/a-class/amg.html', wiki: 'https://en.wikipedia.org/wiki/Mercedes-Benz_A-Class', sourceName: 'Mercedes-Benz India · AMG A-Class'
  },
  {
    image: 'assets/2.jpg', alt: 'User photo 2: Mercedes-Maybach SUV, likely GLS family',
    title: 'Possible Mercedes-Maybach GLS 600',
    summary: 'The second photo shows Maybach branding on a large luxury SUV; the GLS family is a strong visual candidate. The figures and equipment below describe the Mercedes-Benz India GLS 600 reference, not a verified trim or model year for this photo.',
    facts: [['ENGINE', '3,982 cc V8 petrol · mild hybrid'], ['POWER', '410 kW + 16 kW (557 + 22 HP)'], ['TORQUE', '770 Nm'], ['TRANSMISSION', '9G-TRONIC 9-speed automatic'], ['DRIVE', '4MATIC all-wheel drive'], ['0–100 KM/H', '4.9 seconds'], ['DIMENSIONS', '5,208 × 2,030 × 1,838 mm*'], ['BOOT CAPACITY', '520 L'], ['FUEL TANK', '90 L'], ['SEATING', '5 seats · 5 doors'], ['CABIN', 'First-Class rear suite · two individual seats'], ['AUDIO', 'Burmester 3D · 29 speakers · 1,610 W'], ['ASSISTANCE', '360° camera · active parking assist'], ['CHASSIS', 'E-ACTIVE BODY CONTROL available']],
    note: '* Width excludes mirrors. Equipment and seating configuration can vary. Reference specifications vary by model year and market; see the linked manufacturer page before relying on them.',
    aliases: ['maybach gls', 'gls 600', 'mercedes maybach gls', 'mercedes-benz gls'],
    manufacturer: 'https://www.mercedes-benz.co.in/passengercars/models/suv/mercedes-maybach-gls/overview.html', wiki: 'https://en.wikipedia.org/wiki/Mercedes-Benz_GLS#Mercedes-Maybach_GLS', sourceName: 'Mercedes-Benz India · Maybach GLS'
  },
  {
    image: 'assets/3.jpg', alt: 'User photo 3: Audi luxury sedan, possible A8 L',
    title: 'Possible Audi A8 L',
    summary: 'The third photo appears to show a large Audi sedan and may be an A8 L. The A8 is Audi’s full-size luxury sedan family; its engine, performance, dimensions and equipment change by generation, year and market.',
    facts: [['VEHICLE CLASS', 'Full-size luxury sedan'], ['BODY', 'Four-door; A8 L is long-wheelbase'], ['ENGINE', 'Varies by model year and market'], ['TRANSMISSION', 'Variant dependent'], ['DRIVE', 'Quattro available on select variants'], ['EXACT SPEC', 'Check VIN, RC or model documents']],
    note: 'The image does not establish the A8 generation or trim, so no engine or performance figures are guessed here.',
    aliases: ['audi a8', 'a8 l', 'a8l', 'audi a8 l'],
    manufacturer: 'https://www.audi.in/en/', wiki: 'https://en.wikipedia.org/wiki/Audi_A8', sourceName: 'Audi India · model and owner support'
  }
];

const searchForm = document.getElementById('car-search-form');
const searchInput = document.getElementById('car-search-input');
const finderStatus = document.getElementById('finder-status');
const finderResult = document.getElementById('finder-result');
const finderVideos = document.getElementById('finder-videos');
const videoResults = document.getElementById('video-results');
const comparePanel = document.getElementById('compare-panel');
const comparedProfiles = new Set();

function normalized(value) { return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function knownProfileIndex(query) {
  const term = normalized(query);
  return referenceProfiles.findIndex(car => car.aliases.some(alias => term.includes(normalized(alias)) || normalized(alias).includes(term) && term.length > 4));
}
const indiaCarDirectory = window.CHASSIS_INDIA_DIRECTORY || [];
const carOptions = document.getElementById('india-car-options');
if (carOptions) {
  indiaCarDirectory.forEach(make => {
    make.models.forEach(model => {
      const option = document.createElement('option');
      option.value = `${make.make} ${model.name}`;
      carOptions.append(option);
    });
  });
}

function renderMakeDirectory(make) {
  finderResult.replaceChildren();
  const card = document.createElement('article');
  card.className = 'wiki-result-card directory-make-card';
  const label = document.createElement('span'); label.className = 'result-kicker'; label.textContent = 'INDIA-MARKET MAKE';
  const title = document.createElement('h3'); title.textContent = `${make.make} models`;
  const note = document.createElement('p'); note.textContent = 'Choose a model to open its public reference profile. This directory is editorial and does not confirm a vehicle record or exact variant.';
  const picks = document.createElement('div'); picks.className = 'directory-model-picks';
  make.models.forEach(model => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'directory-model-pick';
    button.dataset.directoryCar = `${make.make} ${model.name}`;
    button.textContent = model.name;
    picks.append(button);
  });
  const source = makeLink(`Visit ${make.make} official website ↗`, make.url);
  card.append(label, title, note, picks, source);
  finderResult.append(card);
  finderStatus.textContent = `${make.make}: choose a model from the India-market directory.`;
}

function renderNoCarResult(query) {
  finderResult.replaceChildren();
  const card = document.createElement('article'); card.className = 'wiki-result-card no-car-result';
  const label = document.createElement('span'); label.className = 'result-kicker'; label.textContent = 'CAR DIRECTORY';
  const title = document.createElement('h3'); title.textContent = `No car found for “${query}”`;
  const note = document.createElement('p'); note.textContent = 'Search is limited to makes and models listed for the Indian market. Try a make, a model, or a suggested name. No general web search was run.';
  card.append(label, title, note);
  finderResult.append(card);
  finderStatus.textContent = 'No matching India-market car found.';
}

let searchRequestId = 0;
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
function shortExcerpt(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > maxLength * .72 ? lastSpace : maxLength).trimEnd()}…`;
}
function renderKnownProfile(index) {
  const car = referenceProfiles[index];
  finderResult.replaceChildren();
  const card = document.createElement('article');
  card.className = `finder-car-card${car.image ? '' : ' profile-without-photo'}`;
  const body = document.createElement('div');
  body.className = 'finder-car-body';
  const eyebrow = document.createElement('span');
  eyebrow.className = 'result-kicker';
  eyebrow.textContent = car.image ? `PHOTO REFERENCE ${String(index + 1).padStart(2, '0')} · VISUAL MATCH ONLY` : 'CURATED VEHICLE PROFILE · VERIFY EXACT VARIANT';
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
  if (car.image) {
    const image = document.createElement('img');
    image.src = car.image;
    image.alt = car.alt || car.title;
    card.append(image);
  }
  card.append(body);
  finderResult.append(card);
  finderStatus.textContent = car.image ? 'Reference profile found. Exact vehicle identity still needs confirmation.' : 'Curated profile found. Confirm the exact model year and variant with the manufacturer.';
}

function renderWikipediaResult(article, query, vehicle) {
  finderResult.replaceChildren();
  const card = document.createElement('article');
  card.className = 'wiki-result-card source-result-card';
  const body = document.createElement('div');
  const label = document.createElement('span');
  label.className = 'result-kicker';
  label.textContent = article ? 'MATCHED CAR ARTICLE · VERIFY YEAR & VARIANT' : 'NO EXACT PUBLIC ARTICLE MATCH';
  const title = document.createElement('h3');
  title.textContent = article ? article.title : vehicle.fullName;
  const summary = document.createElement('p');
  summary.textContent = article
    ? shortExcerpt(article.extract || 'Open the article for the available model overview.', 920)
    : 'No article passed the make-and-model match. Velocitrak will not substitute a similar-looking car or an unrelated search result.';
  body.append(label, title, summary);
  if (article?.url) body.append(makeLink('Read the matched Wikipedia overview ↗', article.url));
  card.append(body);
  finderResult.append(card);

  const sources = document.createElement('article');
  sources.className = 'wiki-result-card source-result-card';
  const sourceTitle = document.createElement('h3');
  sourceTitle.textContent = 'Specifications and original sources';
  const note = document.createElement('p');
  note.textContent = 'Power and vehicle facts below are shown only when a public source provides them. Model-family data can differ by year, engine and trim; confirm the exact manufacturer brochure before relying on a figure.';
  const links = document.createElement('div');
  links.className = 'finder-actions';
  const makeUrl = vehicle.make.url;
  let host = '';
  try { host = new URL(makeUrl).hostname.replace(/^www\./i, ''); } catch { /* Keep the manufacturer link. */ }
  const officialSearch = 'https://www.google.com/search?q=' + encodeURIComponent('site:' + host + ' "' + vehicle.fullName + '" specifications brochure');
  links.append(
    makeLink(vehicle.make.make + ' official website ↗', makeUrl),
    makeLink('Find the official brochure & specifications ↗', officialSearch),
    makeLink('Search CarDekho model details ↗', 'https://www.google.com/search?q=' + encodeURIComponent('site:cardekho.com ' + vehicle.fullName + ' specifications')),
    makeLink('Search used-car listings ↗', 'https://www.google.com/search?q=' + encodeURIComponent('site:cardekho.com/used-cars ' + vehicle.fullName))
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
      pageimage: article.pageimage || '',
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

async function wikidataVehicle(article = {}, query) {
  let qid = article?.wikidataId || '';
  if (!qid) {
    const search = new URL('https://www.wikidata.org/w/api.php');
    search.search = new URLSearchParams({ action: 'wbsearchentities', search: query, language: 'en', limit: '5', format: 'json', origin: '*' });
    const results = await fetch(search).then(response => response.ok ? response.json() : null);
    const candidates = results?.search || [];
    const matched = candidates.find(item => /car|automobile|vehicle|motor car|sports car|suv|crossover|sedan|hatchback|coupe|roadster|pickup truck|van/i.test(item.description || '') && (normalized(item.label || '').includes(normalized(query)) || normalized(query).includes(normalized(item.label || ''))));
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
  const imageTitle = entity.claims?.P18?.[0]?.mainsnak?.datavalue?.value || '';
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
  const label = entity.labels?.en?.value || article?.title || query;
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
  return { qid, label, description, rows, values, imageTitle, unitLabels: labelMap, source: `https://www.wikidata.org/wiki/${qid}` };
}

function wikidataMetric(property, value, labels) {
  if (value?.type !== 'quantity' || !Number.isFinite(value.amount)) return null;
  const unit = (labels[value.unit] || '').toLowerCase();
  const amount = value.amount;
  if (property === 'P2109') {
    let kw = null;
    if (unit.includes('kilowatt')) kw = amount;
    else if (unit === 'watt' || unit.endsWith(' watt')) kw = amount / 1000;
    else if (unit.includes('horsepower') && unit.includes('metric')) kw = amount * .7355;
    else if (unit.includes('horsepower')) kw = amount * .7457;
    if (kw !== null && kw > 0 && kw < 1500) {
      const ps = kw * 1.35962;
      return { name: 'Power', value: kw, unit: 'kW / PS', display: Number(kw.toFixed(1)).toLocaleString('en-IN') + ' kW / ' + Math.round(ps).toLocaleString('en-IN') + ' PS', limit: 1000 };
    }
  }
  if (property === 'P2230') {
    let nm = null;
    if (unit.includes('kilonewton')) nm = amount * 1000;
    else if (unit.includes('pound') || unit.includes('foot-pound')) nm = amount * 1.3558;
    else if (unit.includes('newton metre') || unit === 'newton-meter' || unit === 'newton metre') nm = amount;
    if (nm !== null && nm > 0 && nm < 10000) return { name: 'Torque', value: nm, unit: 'Nm', display: Math.round(nm).toLocaleString('en-IN') + ' Nm', limit: 3000 };
  }
  if (property === 'P2052') {
    let kmh = null;
    if (unit.includes('kilometre per hour') || unit.includes('kilometer per hour')) kmh = amount;
    else if (unit.includes('mile per hour')) kmh = amount * 1.60934;
    else if (unit.includes('metre per second') || unit.includes('meter per second')) kmh = amount * 3.6;
    if (kmh !== null && kmh > 0 && kmh < 800) return { name: 'Top speed', value: kmh, unit: 'km/h', display: Math.round(kmh).toLocaleString('en-IN') + ' km/h', limit: 400 };
  }
  return null;
}

async function wikipediaInfoboxSpecs(article) {
  if (!article?.title) return [];
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'parse', page: article.title, prop: 'text', format: 'json', formatversion: '2', origin: '*' });
  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  const html = typeof data.parse?.text === 'string' ? data.parse.text : '';
  if (!html) return [];
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  const table = parsed.querySelector('table.infobox');
  if (!table) return [];
  const wanted = /engine|power|torque|transmission|gearbox|fuel|consumption|economy|range|acceleration|top speed|maximum speed|dimensions|length|width|height|wheelbase|curb weight|kerb weight|mass|battery|motor|seating|seats|drivetrain/i;
  const rows = [];
  for (const row of table.querySelectorAll('tr')) {
    if (row.closest('table') !== table) continue;
    const labelCell = row.querySelector(':scope > th');
    const valueCell = row.querySelector(':scope > td');
    if (!labelCell || !valueCell) continue;
    const name = cleanMetadata(labelCell.textContent).replace(/\[\d+\]/g, '').trim();
    const value = cleanMetadata(valueCell.textContent).replace(/\[\d+\]/g, '').trim();
    if (!name || !value || !wanted.test(name)) continue;
    if (rows.some(existing => existing.name.toLowerCase() === name.toLowerCase() && existing.value === value)) continue;
    rows.push({ name, value: value.slice(0, 700), source: article.url, sourceLabel: 'Wikipedia infobox' });
    if (rows.length >= 18) break;
  }
  return rows;
}

function infoboxPowerMetric(rows) {
  const row = (rows || []).find(item => /power/i.test(item.name));
  if (!row) return null;
  const textValue = row.value;
  const kw = textValue.match(/([\d,.]+)\s*kW\b/i);
  let value = null;
  if (kw) value = Number(kw[1].replace(/,/g, ''));
  else {
    const ps = textValue.match(/([\d,.]+)\s*(?:PS|CV)\b/i);
    const hp = textValue.match(/([\d,.]+)\s*(?:bhp|hp)\b/i);
    if (ps) value = Number(ps[1].replace(/,/g, '')) * .7355;
    else if (hp) value = Number(hp[1].replace(/,/g, '')) * .7457;
  }
  if (!Number.isFinite(value) || value <= 0 || value >= 1500) return null;
  const ps = value * 1.35962;
  return { name: 'Power', value, unit: 'kW / PS', display: Number(value.toFixed(1)).toLocaleString('en-IN') + ' kW / ' + Math.round(ps).toLocaleString('en-IN') + ' PS', limit: 1000, source: row.source, sourceLabel: row.sourceLabel };
}

const curatedIndiaSpecProfiles = [{
  make: 'hyundai', model: 'creta', fromYear: 2024, toYear: 2026, excludes: ['creta n line', 'creta electric'],
  sourceLabel: 'Hyundai India brochure',
  performanceLabel: 'Hyundai India performance page ↗',
  brochureLabel: 'Open the current Hyundai India brochure ↗',
  provenance: 'Manufacturer brochure figures for the current Indian-market Hyundai Creta family. Engine output and equipment depend on the selected powertrain and trim; older years may differ.',
  photoNote: 'The exterior file identifies an Indian-version 2024 Creta. The cabin photo is the same SU2 facelift generation, photographed in the Philippines; market and trim details can differ.',
  brochure: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/brochure/creta.pdf',
  performance: 'https://www.hyundai.com/in/en/find-a-car/creta/performance',
  exterior: 'https://www.hyundai.com/in/en/find-a-car/creta/exterior',
  interior: 'https://www.hyundai.com/in/en/find-a-car/creta/interior',
  images: {
    exterior: [{
      title: '2024 Hyundai Creta · current SU2 generation (India-version model)',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyundai_Creta_1.5_Design_2024_%2854596985099%29.jpg?width=1400',
      page: 'https://commons.wikimedia.org/wiki/File:Hyundai_Creta_1.5_Design_2024_(54596985099).jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0/',
      license: 'CC BY-SA 2.0',
      artist: 'RL GNZLZ'
    }],
    interior: [{
      title: '2025 Hyundai Creta SU2 PE · cabin interior',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hyundai_Creta_SU2_PE_1.5_Premium_Black.jpg?width=1400',
      page: 'https://commons.wikimedia.org/wiki/File:Hyundai_Creta_SU2_PE_1.5_Premium_Black.jpg',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
      license: 'CC BY-SA 4.0',
      artist: 'Ethan Llamas'
    }]
  },
  engines: [
    { name: '1.5L MPi petrol', fuel: 'Petrol', displacement: '1,497 cc', powerKW: 84.4, powerPS: 115, powerRpm: '6,300 rpm', torque: '143.8 Nm', torqueRpm: '4,500 rpm', transmission: '6-speed manual / iVT' },
    { name: '1.5L U2 CRDi diesel', fuel: 'Diesel', displacement: '1,493 cc', powerKW: 85, powerPS: 116, powerRpm: '4,000 rpm', torque: '250 Nm', torqueRpm: '1,500–2,750 rpm', transmission: '6-speed manual / 6-speed automatic' },
    { name: '1.5L Turbo GDi petrol', fuel: 'Petrol', displacement: '1,482 cc', powerKW: 117.5, powerPS: 160, powerRpm: '5,500 rpm', torque: '253 Nm', torqueRpm: '1,500–3,500 rpm', transmission: '7-speed DCT' }
  ],
  rows: [
    { name: 'Body style', value: 'SUV · 5 doors · 5 seats', source: 'https://www.hyundai.com/in/en/find-a-car/creta/highlights', sourceLabel: 'Hyundai India' },
    { name: 'Overall dimensions', value: '4,330 × 1,790 × 1,635 mm (height with roof rails)', source: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/brochure/creta.pdf', sourceLabel: 'Hyundai India brochure' },
    { name: 'Wheelbase', value: '2,610 mm', source: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/brochure/creta.pdf', sourceLabel: 'Hyundai India brochure' },
    { name: 'Fuel tank', value: '50 L', source: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/brochure/creta.pdf', sourceLabel: 'Hyundai India brochure' },
    { name: 'Engine construction', value: '4 cylinders · 16 valves · DOHC', source: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/brochure/creta.pdf', sourceLabel: 'Hyundai India brochure' },
    { name: 'Front suspension', value: 'McPherson strut with coil spring', source: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/brochure/creta.pdf', sourceLabel: 'Hyundai India brochure' },
    { name: 'Rear suspension', value: 'Coupled torsion beam axle', source: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/brochure/creta.pdf', sourceLabel: 'Hyundai India brochure' },
    { name: 'Brakes', value: 'Disc brakes front and rear', source: 'https://www.hyundai.com/content/dam/hyundai/in/en/data/brochure/creta.pdf', sourceLabel: 'Hyundai India brochure' },
    { name: 'Drive', value: 'Front-wheel drive', source: 'https://www.hyundai.com/in/en/find-a-car/creta/highlights', sourceLabel: 'Hyundai India' }
  ]
  },
  {
    make: 'maruti suzuki', model: 'swift', fromYear: 2024, toYear: 2026, excludes: ['swift dzire'],
    brochure: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf',
    performance: 'https://www.marutisuzuki.com/arena/swift',
    exterior: 'https://www.marutisuzuki.com/arena/swift',
    interior: 'https://www.marutisuzuki.com/arena/swift',
    sourceLabel: 'Maruti Suzuki India brochure',
    performanceLabel: 'Maruti Suzuki India performance page ↗',
    brochureLabel: 'Open the current Maruti Suzuki Swift brochure ↗',
    provenance: 'Official Maruti Suzuki India figures for the 2024-on Swift. Power, fuel economy and equipment depend on variant; older years differ.',
    photoNote: 'These are photographs of the 2024 Swift generation from international-market vehicles; India-market equipment and trim can differ.',
    images: {
      exterior: [{
        title: '2024 Suzuki Swift · current-generation exterior (UK-market photo)',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/2024_Suzuki_Swift.jpg?width=1400',
        page: 'https://commons.wikimedia.org/wiki/File:2024_Suzuki_Swift.jpg',
        licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        license: 'CC BY-SA 4.0',
        artist: 'Calreyn88'
      }],
      interior: [{
        title: '2024 Suzuki Swift · cabin and center console (Japan-market hybrid photo)',
        image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzuki_Swift_%2724_%283%29.jpg?width=1400',
        page: 'https://commons.wikimedia.org/wiki/File:Suzuki_Swift_%2724_%283%29.jpg',
        licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
        license: 'CC0 1.0',
        artist: 'Oq10pass'
      }]
    },
    engines: [
      { name: '1.2L Z12E petrol', fuel: 'Petrol', displacement: '1,197 cc', powerKW: 60, powerPS: 81.58, powerRpm: '5,700 rpm', torque: '111.7 Nm', torqueRpm: '4,300 rpm', transmission: '5-speed manual / 5-speed AMT' },
      { name: '1.2L Z12E S-CNG', fuel: 'Petrol + CNG', displacement: '1,197 cc', powerKW: 51.3, powerPS: 69.75, powerRpm: '5,700 rpm', torque: '101.8 Nm', torqueRpm: '2,900 rpm', transmission: '5-speed manual' }
    ],
    rows: [
      { name: 'Body style', value: 'Hatchback · 5 doors · 5 seats', source: 'https://www.marutisuzuki.com/arena/swift', sourceLabel: 'Maruti Suzuki India' },
      { name: 'Dimensions', value: '3,860 × 1,735 × 1,520 mm', source: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf', sourceLabel: 'Maruti Suzuki India brochure' },
      { name: 'Wheelbase', value: '2,450 mm', source: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf', sourceLabel: 'Maruti Suzuki India brochure' },
      { name: 'Engine', value: '1,197 cc · 3-cylinder Z12E', source: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf', sourceLabel: 'Maruti Suzuki India brochure' },
      { name: 'Fuel economy', value: 'Petrol: 24.8 km/L (MT), 25.75 km/L (AMT); CNG: 32.85 km/kg', source: 'https://www.marutisuzuki.com/arena/swift', sourceLabel: 'Maruti Suzuki India' },
      { name: 'Fuel tank', value: '37 L petrol tank; CNG cylinder water capacity 55 L', source: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf', sourceLabel: 'Maruti Suzuki India brochure' },
      { name: 'Boot capacity', value: '265 L (petrol)', source: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf', sourceLabel: 'Maruti Suzuki India brochure' },
      { name: 'Front suspension', value: 'MacPherson strut', source: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf', sourceLabel: 'Maruti Suzuki India brochure' },
      { name: 'Rear suspension', value: 'Torsion beam', source: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf', sourceLabel: 'Maruti Suzuki India brochure' },
      { name: 'Brakes', value: 'Ventilated front disc · rear drum', source: 'https://www.marutisuzuki.com/content/dam/msil/arena/in/en/assets/cars/swift/document/Swift_SCNG_VerticalBrochure.pdf', sourceLabel: 'Maruti Suzuki India brochure' }
    ]
  }
];

function curatedSpecProfileFor(carRecord, requestedTerm) {
  const make = normalized(carRecord?.make?.make);
  const model = normalized(carRecord?.model?.name);
  const query = normalized(requestedTerm);
  const year = Number(String(requestedTerm || '').match(/\b(?:19|20)\d{2}\b/)?.[0] || 0);
  return curatedIndiaSpecProfiles.find(profile => {
    if (make !== profile.make || model !== profile.model) return false;
    if (profile.excludes.some(term => query.includes(normalized(term)))) return false;
    return !year || (year >= profile.fromYear && year <= profile.toYear);
  }) || null;
}

function officialPhotoSources(vehicle, requestedTerm) {
  const profile = curatedSpecProfileFor(vehicle, requestedTerm);
  return profile ? { exterior: profile.exterior, interior: profile.interior } : null;
}

function renderEngineOptions(profile) {
  const grid = document.createElement('div');
  grid.className = 'spec-engine-options';
  profile.engines.forEach(engine => {
    const card = document.createElement('article');
    card.className = 'spec-engine-card';
    const heading = document.createElement('h5'); heading.textContent = engine.name;
    const line = (label, value, prominent = false) => {
      const row = document.createElement('p');
      const name = document.createElement('span'); name.textContent = label;
      const detail = document.createElement(prominent ? 'strong' : 'span'); detail.textContent = value;
      row.append(name, detail); return row;
    };
    card.append(heading, line('MAX POWER', engine.powerPS + ' PS · ' + engine.powerKW + ' kW', true), line('MAX TORQUE', engine.torque + ' · ' + engine.torqueRpm), line('ENGINE', engine.displacement + ' · ' + engine.fuel), line('TRANSMISSION', engine.transmission));
    grid.append(card);
  });
  return grid;
}
function renderSpecTable(target, vehicle, infoboxRows, carRecord, requestedTerm) {
  const curatedProfile = curatedSpecProfileFor(carRecord, requestedTerm);
  const rows = curatedProfile ? curatedProfile.rows : [...(vehicle?.rows || []), ...(infoboxRows || [])];
  const section = document.createElement('section');
  section.className = 'spec-table-section';
  const heading = document.createElement('div');
  heading.className = 'detail-section-heading';
  const title = document.createElement('h4');
  title.textContent = 'Specifications and performance';
  const context = document.createElement('p');
  context.textContent = vehicle
    ? vehicle.label + (vehicle.description ? ' · ' + vehicle.description : ' · structured public vehicle record')
    : 'No structured Wikidata vehicle record matched this model. Use the official manufacturer and brochure links below for verified specifications.';
  heading.append(title, context);
  section.append(heading);

  const requestedYear = String(requestedTerm || '').match(/\b(?:19|20)\d{2}\b/);
  if (requestedYear) {
    const yearNote = document.createElement('p');
    yearNote.className = 'spec-year-note';
    yearNote.textContent = 'Your search included model year ' + requestedYear[0] + '. The public model-family figures below are not confirmed against that year or trim.';
    section.append(yearNote);
  }

  const metrics = [];
  let powerMetric = null;
  if (curatedProfile) {
    powerMetric = {
      display: 'Up to ' + Math.max(...curatedProfile.engines.map(engine => engine.powerPS)) + ' PS / ' + Math.max(...curatedProfile.engines.map(engine => engine.powerKW)) + ' kW',
      source: curatedProfile.brochure,
      sourceLabel: curatedProfile.sourceLabel
    };
    curatedProfile.engines.forEach(engine => metrics.push({
      name: engine.name,
      value: engine.powerKW,
      unit: 'kW',
      display: engine.powerPS + ' PS / ' + engine.powerKW + ' kW',
      limit: 125
    }));
  } else {
    if (vehicle) {
      for (const property of ['P2109', 'P2230', 'P2052']) {
        const metric = (vehicle.values?.[property] || [])
          .map(value => wikidataMetric(property, value, vehicle.unitLabels || {}))
          .find(Boolean);
        if (!metric) continue;
        metrics.push(metric);
        if (property === 'P2109') powerMetric = metric;
      }
    }
    if (!powerMetric) powerMetric = infoboxPowerMetric(infoboxRows);
    if (powerMetric && !metrics.some(metric => metric.name === 'Power')) metrics.unshift(powerMetric);
  }

  const powerCallout = document.createElement('div');
  powerCallout.className = 'spec-power-callout';
  const powerLabel = document.createElement('span');
  powerLabel.textContent = curatedProfile ? 'ENGINE POWER · CURRENT INDIA SPEC' : 'ENGINE POWER · PUBLIC REFERENCE';
  const powerValue = document.createElement('strong');
  const powerNote = document.createElement('small');
  if (powerMetric) {
    powerValue.textContent = powerMetric.display;
    powerNote.textContent = curatedProfile ? curatedProfile.engines.length + ' current India-market engine choices. Select the exact engine and trim for your car.' : 'Model-family figure; generation, market and variant may differ.';
  } else {
    powerValue.textContent = 'Not verified in matched public data';
    powerNote.textContent = 'No power number is guessed. Open the official site or brochure for the exact year and variant.';
  }
  powerCallout.append(powerLabel, powerValue, powerNote);
  if (powerMetric?.source) powerCallout.append(makeLink(powerMetric.sourceLabel + ' source ↗', powerMetric.source, 'spec-source-link'));
  if (curatedProfile) powerCallout.append(makeLink(curatedProfile.performanceLabel, curatedProfile.performance, 'spec-source-link'));
  else if (vehicle?.source) powerCallout.append(makeLink('Wikidata power record ↗', vehicle.source + '#P2109', 'spec-source-link'));
  if (!curatedProfile && carRecord?.make?.url) powerCallout.append(makeLink(carRecord.make.make + ' official website ↗', carRecord.make.url, 'spec-source-link'));
  section.append(powerCallout);

  if (metrics.length) {
    const chart = document.createElement('div');
    chart.className = 'spec-graphic';
    const chartTitle = document.createElement('div');
    chartTitle.className = 'spec-graphic-title';
    chartTitle.innerHTML = curatedProfile
      ? '<span>POWER BY ENGINE OPTION</span><small>Official India figures · alternatives within this model</small>'
      : '<span>POWER, TORQUE & TOP SPEED</span><small>Source values · not a cross-model comparison</small>';
    chart.append(chartTitle);
    metrics.forEach(metric => {
      const row = document.createElement('div');
      row.className = 'spec-meter-row';
      const label = document.createElement('div');
      label.className = 'spec-meter-label';
      const name = document.createElement('span');
      name.textContent = metric.name;
      const value = document.createElement('strong');
      value.textContent = metric.display;
      label.append(name, value);
      const track = document.createElement('div');
      track.className = 'spec-meter-track';
      const fill = document.createElement('span');
      fill.style.width = Math.max(2, Math.min(100, metric.value / metric.limit * 100)) + '%';
      track.append(fill);
      row.append(label, track);
      chart.append(row);
    });
    section.append(chart);
  }
  if (curatedProfile) section.append(renderEngineOptions(curatedProfile));

  if (rows.length) {
    const tableWrap = document.createElement('div');
    tableWrap.className = 'spec-table-wrap';
    const table = document.createElement('table');
    table.className = 'spec-table';
    const head = document.createElement('thead');
    head.innerHTML = '<tr><th scope="col">Specification</th><th scope="col">Public data value</th><th scope="col">Source</th></tr>';
    const body = document.createElement('tbody');
    rows.forEach(row => {
      const tr = document.createElement('tr');
      const name = document.createElement('th');
      name.scope = 'row';
      name.textContent = row.name;
      const value = document.createElement('td');
      value.textContent = row.value;
      const source = document.createElement('td');
      source.append(makeLink(row.sourceLabel || 'Wikidata ↗', row.source || vehicle?.source || carRecord.make.url, 'spec-source-link'));
      tr.append(name, value, source);
      body.append(tr);
    });
    table.append(head, body);
    tableWrap.append(table);
    section.append(tableWrap);
  } else {
    const empty = document.createElement('p');
    empty.className = 'spec-empty';
    empty.textContent = 'The matched public record does not publish usable power, engine or dimensions yet. Velocitrak leaves these values blank instead of inventing them.';
    section.append(empty);
  }
  const note = document.createElement('p');
  note.className = 'spec-provenance';
  note.textContent = curatedProfile
    ? curatedProfile.provenance
    : 'These are model-family reference facts, not exact VIN/trim data. A model family can span different engines and generations; the public record may describe another market. Confirm the specific Indian model year and variant in the manufacturer brochure. Wikidata structured facts are released under CC0.';
  section.append(note);
  if (curatedProfile) section.append(makeLink(curatedProfile.brochureLabel, curatedProfile.brochure, 'spec-source-link'));
  else if (vehicle?.source) section.append(makeLink('Open the Wikidata vehicle record ↗', vehicle.source, 'spec-source-link'));
  target.append(section);
}

function cleanMetadata(value) { return String(value || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim(); }

async function commonsVehicleImages(vehicle, view, requestedTerm) {
  const curatedProfile = curatedSpecProfileFor(vehicle, requestedTerm);
  if (curatedProfile?.images?.[view.key]) return curatedProfile.images[view.key];
  const requestedAlias = (vehicle.model.aliases || []).find(alias => normalized(requestedTerm).includes(normalized(alias)));
  const exactModelName = requestedAlias || vehicle.model.name;
  const searchTerms = [vehicle.make.make + ' ' + exactModelName];
  if (normalized(vehicle.make.make) === 'hyundai' && normalized(vehicle.model.name) === 'creta' && exactModelName === vehicle.model.name) {
    searchTerms.push(view.key === 'interior' ? 'Hyundai Creta SU2 PE' : 'Hyundai Creta 2024');
    if (view.key === 'interior') searchTerms.push('Hyundai Creta dashboard');
  }
  const searchResponses = await Promise.all(searchTerms.map(async term => {
    const url = new URL('https://commons.wikimedia.org/w/api.php');
    url.search = new URLSearchParams({
      action: 'query', generator: 'search', gsrsearch: term, gsrnamespace: '6', gsrlimit: '50',
      prop: 'imageinfo|categories', iiprop: 'url|extmetadata|mime|size', iiurlwidth: '1400',
      cllimit: '20', format: 'json', origin: '*'
    });
    const response = await fetch(url);
    return response.ok ? response.json() : null;
  }));
  if (searchResponses.every(data => !data)) throw new Error('Wikimedia Commons image search unavailable');
  const pages = [...new Map(searchResponses.flatMap(data => Object.values(data?.query?.pages || [])).map(page => [page.pageid, page])).values()];
  const modelNames = [exactModelName].map(normalized).filter(name => name.length >= 2);
  const makeNames = [vehicle.make.make, ...(vehicle.make.aliases || [])].map(normalized).filter(name => name.length >= 2);
  const requestedYear = String(requestedTerm || '').match(/\b(?:19|20)\d{2}\b/)?.[0] || '';
  const interiorTerms = ['interior', 'dashboard', 'dashboards', 'dash board', 'cockpit', 'cabin', 'interieur', 'salon', 'instrument panel', 'seat', 'seats'];
  const excluded = /\b(diagram|drawing|illustration|sketch|render|rendering|vector|blueprint|line art|cutaway|infographic|logo|badge|emblem|toy|scale model|model car|paper model|concept art|brochure)\b/i;
  const containsPhrase = (haystack, phrase) => (' ' + haystack + ' ').includes(' ' + phrase + ' ');
  const matches = pages.map(page => {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl || !info?.descriptionurl) return null;
    const rawTitle = page.title?.replace(/^File:/i, '') || '';
    const title = normalized(rawTitle);
    const categoryTitles = (page.categories || []).map(category => normalized((category.title || '').replace(/^Category:/i, '')));
    const categoryMatch = categoryTitles.some(category =>
      makeNames.some(name => containsPhrase(category, name)) &&
      modelNames.some(name => containsPhrase(category, name))
    );
    if (!categoryMatch) return null;
    const categoriesAndTitle = [rawTitle, ...categoryTitles].join(' ');
    if (excluded.test(categoriesAndTitle)) return null;
    // FileSource alone is not proof that a file is a photograph (illustrations
    // and brochure artwork can also carry it). Require EXIF/camera evidence or
    // an explicit photography category before showing a Commons result.
    const hasCameraMetadata = ['DateTimeOriginal', 'CameraModel', 'Model', 'Make'].some(key => cleanMetadata(info.extmetadata?.[key]?.value));
    const hasPhotographicCategory = categoryTitles.some(category => /\bphotographs?\b/.test(category));
    if (!hasCameraMetadata && !hasPhotographicCategory) return null;
    if (normalized(vehicle.make.make) === 'hyundai' && normalized(vehicle.model.name) === 'creta') {
      if (/\b(ix25|china|russia|su2r)\b/i.test(rawTitle + ' ' + categoryTitles.join(' '))) return null;
      const year = Number(requestedYear || 0);
      const expectedGeneration = year && year < 2019 ? 'hyundai creta gs' : 'hyundai creta su2';
      if (!categoryTitles.some(category => containsPhrase(category, expectedGeneration))) return null;
      if (!year && !/(2024|2025|2026|su2 pe|facelift)/i.test(rawTitle)) return null;
    }
    if (!modelNames.some(name => containsPhrase(title, name))) return null;
    if (!makeNames.some(name => containsPhrase(title, name))) return null;
    if (requestedYear && !containsPhrase(title, requestedYear)) return null;
    if (view.key === 'interior' && !interiorTerms.some(word => containsPhrase(title, normalized(word)))) return null;
    if (view.key === 'exterior' && interiorTerms.some(word => containsPhrase(title, normalized(word)) || categoryTitles.some(category => containsPhrase(category, normalized(word))))) return null;
    if (excluded.test(page.title || '')) return null;
    if (!/^image\/(jpeg|png|webp)$/i.test(info.mime || '')) return null;
    if (!Number.isFinite(info.width) || !Number.isFinite(info.height) || info.width < 500 || info.height < 300) return null;
    const meta = info.extmetadata || {};
    return {
      title: page.title?.replace(/^File:/i, '') || '',
      image: info.thumburl,
      page: info.descriptionurl,
      licenseUrl: meta.LicenseUrl?.value || info.descriptionurl,
      license: cleanMetadata(meta.LicenseShortName?.value) || 'See file page',
      artist: cleanMetadata(meta.Artist?.value || meta.Credit?.value)
    };
  }).filter(Boolean);
  return [...new Map(matches.map(item => [item.page, item])).values()].slice(0, 3);
}

function renderImageGallery(target, vehicle, requestedTerm) {
  const gallery = document.createElement('section');
  gallery.className = 'vehicle-image-gallery';
  const heading = document.createElement('div');
  heading.className = 'detail-section-heading';
  const title = document.createElement('h4');
  title.textContent = vehicle.fullName + ' · exterior & cabin photos';
  const intro = document.createElement('p');
  const curatedProfile = curatedSpecProfileFor(vehicle, requestedTerm);
  intro.textContent = 'Photos are selected from exact model and generation categories. Drawings, rebadges and unmatched images are excluded; market or trim differences are labeled when relevant, and missing matches stay empty.' + (curatedProfile?.photoNote ? ' ' + curatedProfile.photoNote : '');
  heading.append(title, intro);
  const officialPages = officialPhotoSources(vehicle, requestedTerm);
  if (officialPages) {
    const officialLinks = document.createElement('div');
    officialLinks.className = 'finder-actions gallery-official-links';
    officialLinks.append(
      makeLink('Official ' + vehicle.make.make + ' exterior gallery ↗', officialPages.exterior),
      makeLink('Official ' + vehicle.make.make + ' cabin gallery ↗', officialPages.interior)
    );
    heading.append(officialLinks);
  }
  gallery.append(heading);
  const views = [
    { key: 'exterior', title: 'Exterior photographs' },
    { key: 'interior', title: 'Interior & cabin photographs' }
  ];
  views.forEach(view => {
    const group = document.createElement('div');
    group.className = 'gallery-group';
    const groupTitle = document.createElement('h5');
    groupTitle.textContent = view.title;
    const grid = document.createElement('div');
    grid.className = 'vehicle-gallery-grid';
    const status = document.createElement('p');
    status.className = 'gallery-status';
    status.textContent = 'Searching for exact make-and-model photo files…';
    group.append(groupTitle, grid, status);
    gallery.append(group);
    commonsVehicleImages(vehicle, view, requestedTerm).then(images => {
      status.textContent = images.length
        ? images.length + ' model-category photographs · review the file page to confirm generation, market and license.'
        : 'No verified ' + (view.key === 'interior' ? 'interior/cabin' : 'exterior') + ' photo matched this model generation. No drawing, rebadge or unrelated photo was substituted.';
      if (!images.length && officialPages) {
        status.append(document.createTextNode(' '), makeLink('Open ' + vehicle.make.make + ' official gallery ↗', officialPages[view.key], 'spec-source-link'));
      }
      images.forEach(item => {
        const figure = document.createElement('figure');
        figure.className = 'vehicle-gallery-image';
        const anchor = document.createElement('a');
        anchor.href = item.page;
        anchor.dataset.photoView = view.key;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.setAttribute('aria-label', 'Open Commons file ' + item.title);
        const image = document.createElement('img');
        image.src = item.image;
        image.alt = vehicle.fullName + ' ' + view.title + ': ' + item.title;
        image.loading = 'lazy';
        image.addEventListener('error', () => figure.remove(), { once: true });
        anchor.append(image);
        const caption = document.createElement('figcaption');
        const name = document.createElement('strong');
        name.textContent = item.title;
        const credit = document.createElement('small');
        credit.textContent = [item.artist ? 'Photo: ' + item.artist : 'Photographer details on file page', item.license].join(' · ');
        const links = document.createElement('span');
        links.className = 'gallery-credit-links';
        links.append(makeLink('File source ↗', item.page, 'gallery-source-link'), makeLink('License ↗', item.licenseUrl, 'gallery-source-link'));
        caption.append(name, credit, links);
        figure.append(anchor, caption);
        grid.append(figure);
      });
    }).catch(() => {
      status.textContent = 'Could not load Commons right now. No substitute photo was shown.';
    });
  });
  target.append(gallery);
}

async function appendRichCarDetails(article, query, carRecord, requestedTerm) {
  const panel = document.createElement('article');
  panel.className = 'dynamic-detail-panel';
  const top = document.createElement('div');
  top.className = 'dynamic-detail-top';
  const kicker = document.createElement('span');
  kicker.className = 'result-kicker';
  kicker.textContent = 'CAR REFERENCE PROFILE · MATCHED PUBLIC SOURCES';
  const h3 = document.createElement('h3');
  h3.textContent = carRecord.fullName;
  const attribution = document.createElement('p');
  attribution.className = 'profile-attribution';
  if (article?.url) attribution.append('Article overview: ', makeLink('matched Wikipedia article ↗', article.url, 'spec-source-link'));
  else attribution.textContent = 'No exact Wikipedia model article matched. Manufacturer links remain available above.';
  attribution.append(' · Structured facts: Wikidata CC0 · Technical rows may be model-family values.');
  top.append(kicker, h3, attribution);
  panel.append(top);

  const narrative = document.createElement('section');
  narrative.className = 'car-narrative';
  const narrativeHeading = document.createElement('h4');
  narrativeHeading.textContent = 'About this car';
  const narrativeText = document.createElement('p');
  const extract = (article?.extract || '').replace(/\s+/g, ' ').trim();
  narrativeText.textContent = extract
    ? shortExcerpt(extract, 1150)
    : 'No matching model overview was found in the public reference. Use the official manufacturer site for the exact year, powertrain and variant. Velocitrak will not show a nearby model as a substitute.';
  narrative.append(narrativeHeading, narrativeText);
  if (article?.url) narrative.append(makeLink('Read the full article ↗', article.url, 'spec-source-link'));
  panel.append(narrative);

  const loading = document.createElement('section');
  loading.className = 'spec-table-section';
  const loadingTitle = document.createElement('h4');
  loadingTitle.textContent = 'Loading specifications from public records…';
  loading.append(loadingTitle);
  panel.append(loading);
  const galleryContainer = document.createElement('div');
  panel.append(galleryContainer);
  finderResult.append(panel);

  const [vehicleFacts, infoboxRows] = await Promise.all([
    // Query Wikidata directly if Wikipedia has no article or no Wikidata
    // sitelink. This recovers public power/torque facts for more catalogue cars.
    wikidataVehicle(article || {}, carRecord.fullName).catch(() => null),
    article ? wikipediaInfoboxSpecs(article).catch(() => []) : Promise.resolve([])
  ]);
  loading.replaceChildren();
  renderSpecTable(loading, vehicleFacts, infoboxRows, carRecord, requestedTerm);
  renderImageGallery(galleryContainer, carRecord, requestedTerm);
}

function escapeSvgText(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
}

function makeVideoSearchArtwork(query, creator) {
  const model = escapeSvgText(query).slice(0, 34);
  const channel = escapeSvgText(creator).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#152324"/><stop offset=".55" stop-color="#26322f"/><stop offset="1" stop-color="#101214"/></linearGradient><radialGradient id="l"><stop stop-color="#d4bf97" stop-opacity=".38"/><stop offset="1" stop-color="#d4bf97" stop-opacity="0"/></radialGradient></defs><rect width="800" height="450" fill="url(#g)"/><ellipse cx="610" cy="60" rx="330" ry="220" fill="url(#l)"/><path d="M80 278h77l64-69c17-18 35-27 61-27h174c24 0 41 7 57 23l71 73h74c22 0 39 18 39 40v19H80z" fill="none" stroke="#d8d0be" stroke-opacity=".75" stroke-width="5"/><circle cx="235" cy="331" r="31" fill="#121718" stroke="#d8d0be" stroke-width="5"/><circle cx="604" cy="331" r="31" fill="#121718" stroke="#d8d0be" stroke-width="5"/><path d="M246 197l-56 70h432l-68-67a46 46 0 0 0-33-14H272a38 38 0 0 0-26 11Z" fill="#d8d0be" fill-opacity=".08" stroke="#d8d0be" stroke-opacity=".45" stroke-width="3"/><text x="54" y="68" fill="#d8c49d" font-family="Arial,sans-serif" font-size="20" letter-spacing="5">YOUTUBE SEARCH PREVIEW</text><text x="54" y="139" fill="#f5f2eb" font-family="Arial,sans-serif" font-size="46" font-weight="700">${model}</text><text x="54" y="410" fill="#c6c7c1" font-family="Arial,sans-serif" font-size="18" letter-spacing="3">${channel} · OPEN RESULTS FOR REAL VIDEO THUMBNAILS</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function renderFallbackVideoLinks(query) {
  videoResults.replaceChildren();
  const creators = [
    { name: 'Faisal Khan', handle: 'FasBeam' },
    { name: 'MotorOctane', handle: 'motoroctane' }
  ];
  creators.forEach(creator => {
    const card = document.createElement('article');
    card.className = 'video-card video-search-card';
    const kicker = document.createElement('span');
    kicker.textContent = `YOUTUBE SEARCH · ${creator.name.toUpperCase()}`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${query} ${creator.name} car review`)}`;
    const thumbLink = document.createElement('a');
    thumbLink.className = 'video-thumbnail-link';
    thumbLink.href = searchUrl;
    thumbLink.target = '_blank';
    thumbLink.rel = 'noopener noreferrer';
    thumbLink.setAttribute('aria-label', `Search YouTube for ${query} reviews from ${creator.name}`);
    const artwork = document.createElement('img');
    artwork.className = 'video-thumbnail video-search-artwork';
    artwork.src = makeVideoSearchArtwork(query, creator.name);
    artwork.alt = `Illustrated search preview for ${query} videos from ${creator.name}; this is not a video thumbnail.`;
    artwork.loading = 'eager';
    artwork.decoding = 'async';
    const play = document.createElement('span');
    play.className = 'video-play-mark';
    play.setAttribute('aria-hidden', 'true');
    play.textContent = '▶';
    thumbLink.append(artwork, play);
    const title = document.createElement('strong');
    title.textContent = `Find ${query} videos`;
    const meta = document.createElement('small');
    meta.className = 'video-card-meta';
    meta.textContent = `Search preview · ${creator.name} · opens YouTube results`;
    card.append(kicker, thumbLink, title, meta, makeLink('Search this creator on YouTube ↗', searchUrl));
    videoResults.append(card);
  });
  document.getElementById('video-caption-note').textContent = 'These always-visible fallback cards are search artwork, not video thumbnails. When YouTube returns video IDs, real video thumbnails and direct watch links replace them.';
}

function renderCaptionedVideos(videos) {
  if (!videos.length) return false;
  videoResults.replaceChildren();
  videos.forEach(video => {
    if (!/^[A-Za-z0-9_-]{11}$/.test(video.id || '')) return;
    const card = document.createElement('article');
    card.className = 'video-card';
    const creator = document.createElement('span');
    creator.textContent = `${video.creator} · VIDEO REVIEW`;
    const thumbLink = document.createElement('a');
    thumbLink.className = 'video-thumbnail-link';
    thumbLink.href = video.watchUrl;
    thumbLink.target = '_blank';
    thumbLink.rel = 'noopener noreferrer';
    thumbLink.setAttribute('aria-label', `Watch ${video.title} on YouTube`);
    const thumbnail = document.createElement('img');
    thumbnail.className = 'video-thumbnail';
    thumbnail.alt = `Video thumbnail: ${video.title}`;
    thumbnail.loading = 'eager';
    thumbnail.fetchPriority = 'high';
    thumbnail.referrerPolicy = 'strict-origin-when-cross-origin';
    thumbnail.decoding = 'async';
    const thumbnailCandidates = [...new Set([`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`, `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`, video.thumbnail, `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`, `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`, `https://i.ytimg.com/vi/${video.id}/sddefault.jpg`, `https://i.ytimg.com/vi/${video.id}/0.jpg`].filter(Boolean))];
    let thumbnailAttempt = 0;
    thumbnail.addEventListener('error', () => {
      thumbnailAttempt += 1;
      if (thumbnailAttempt < thumbnailCandidates.length) thumbnail.src = thumbnailCandidates[thumbnailAttempt];
      else if (!thumbnail.dataset.localFallback) {
        thumbnail.dataset.localFallback = 'true';
        thumbnail.alt = `Velocitrak preview artwork for ${video.title}; the original YouTube thumbnail could not be loaded.`;
        thumbnail.src = makeVideoSearchArtwork(video.title, video.creator);
        thumbLink.classList.add('thumbnail-unavailable');
      } else thumbnail.removeAttribute('src');
    });
    thumbnail.src = thumbnailCandidates[0];
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
  if (!videoResults.children.length) return false;
  document.getElementById('video-caption-note').textContent = 'Each image is the video’s YouTube thumbnail and opens its direct watch page. Captions depend on the creator; turn on CC in YouTube when available.';
  return true;
}

let activeVideoQuery = '';
const youtubeChannelCache = new Map();
const youtubePublicKey = typeof window.CHASSIS_YOUTUBE_API_KEY === 'string' ? window.CHASSIS_YOUTUBE_API_KEY.trim() : '';

async function youtubeApiRequest(endpoint, params, apiKey) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  url.searchParams.set('key', apiKey);
  Object.entries(params).forEach(([name, value]) => url.searchParams.set(name, value));
  const response = await fetch(url);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `YouTube returned ${response.status}.`);
  return data;
}

async function youtubeChannelId(handle, apiKey) {
  if (youtubeChannelCache.has(handle)) return youtubeChannelCache.get(handle);
  const data = await youtubeApiRequest('channels', { part: 'id', forHandle: handle, maxResults: '1' }, apiKey);
  const id = data.items?.[0]?.id;
  if (!id) throw new Error(`Could not find the ${handle} YouTube channel.`);
  youtubeChannelCache.set(handle, id);
  return id;
}

const youtubeMakeWords = new Set(['maruti','suzuki','hyundai','kia','honda','mahindra','toyota','tata','mg','audi','bmw','mercedes','benz','volkswagen','vw','skoda','renault','nissan','citroen','jeep','volvo','jaguar','land','rover','porsche','ferrari','lamborghini','ford','faisal','khan','moto','octane','car','cars','review','reviews','india','new','launch','test','drive','variant','facelift']);
function youtubeTargetTerms(query) {
  return String(query).toLowerCase().match(/[a-z0-9]+/g)?.filter(word => word.length >= 2 && !youtubeMakeWords.has(word) && !/^20\d{2}$/.test(word)) || [];
}
function youtubeResultMatches(query, title) {
  const terms = youtubeTargetTerms(query);
  return !terms.length || terms.some(term => String(title || '').toLowerCase().includes(term));
}

async function browserYoutubeVideos(query, apiKey) {
  const channels = [
    { handle: 'FasBeam', name: 'Faisal Khan' },
    { handle: 'motoroctane', name: 'MotorOctane' }
  ];
  const channelIndex = [...String(query).toLowerCase()].reduce((total, char) => total + char.charCodeAt(0), 0) % channels.length;
  const channel = channels[channelIndex];
  const channelId = await youtubeChannelId(channel.handle, apiKey);
  const data = await youtubeApiRequest('search', {
    part: 'snippet', type: 'video', channelId, q: `${query} car review`,
    maxResults: '10', regionCode: 'IN', safeSearch: 'moderate'
  }, apiKey);
  return (data.items || []).filter(item => item.id?.videoId && youtubeResultMatches(query, item.snippet?.title)).slice(0, 4).map(item => ({
    id: item.id.videoId, title: item.snippet?.title || `${query} review`, creator: channel.name,
    channel: item.snippet?.channelTitle || channel.name, publishedAt: item.snippet?.publishedAt || '',
    thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
    watchUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(item.id.videoId)}`
  }));
}

const youtubeCachePrefix = 'velocitrak:youtube:v1:';
let youtubeApiCooldownUntil = 0;

function readCachedYoutubeVideos(query) {
  try {
    const entry = JSON.parse(localStorage.getItem(youtubeCachePrefix + query.trim().toLowerCase()) || 'null');
    if (entry && Number.isFinite(entry.savedAt) && Array.isArray(entry.videos) && Date.now() - entry.savedAt < 7 * 24 * 60 * 60 * 1000) return entry;
  } catch { /* Storage may be disabled or contain an older format. */ }
  return null;
}

function saveCachedYoutubeVideos(query, videos) {
  try {
    localStorage.setItem(youtubeCachePrefix + query.trim().toLowerCase(), JSON.stringify({ savedAt: Date.now(), videos }));
  } catch { /* The visible search fallback does not depend on browser storage. */ }
}

async function loadVideos(query) {
  activeVideoQuery = query;
  finderVideos.hidden = false;
  const cachedEntry = readCachedYoutubeVideos(query);
  const cachedVideos = cachedEntry?.videos || [];
  if (cachedVideos.length && renderCaptionedVideos(cachedVideos)) {
    document.getElementById('video-caption-note').textContent = 'Showing saved YouTube results while Velocitrak checks for fresh videos.';
  } else {
    renderFallbackVideoLinks(query);
  }
  const cacheAge = cachedEntry ? Date.now() - cachedEntry.savedAt : Infinity;
  const refreshAfter = cachedVideos.length ? 6 * 60 * 60 * 1000 : 15 * 60 * 1000;
  if (!youtubePublicKey || cacheAge < refreshAfter || Date.now() < youtubeApiCooldownUntil) return;
  try {
    const videos = await browserYoutubeVideos(query, youtubePublicKey);
    if (activeVideoQuery !== query) return;
    saveCachedYoutubeVideos(query, videos);
    if (renderCaptionedVideos(videos)) return;
    if (!cachedVideos.length) renderFallbackVideoLinks(query);
    document.getElementById('video-caption-note').textContent = 'No matching videos were returned by Faisal Khan or MotorOctane for this search. The creator search cards still open YouTube results.';
  } catch {
    youtubeApiCooldownUntil = Date.now() + 60 * 1000;
    if (activeVideoQuery !== query) return;
    if (!cachedVideos.length) renderFallbackVideoLinks(query);
    document.getElementById('video-caption-note').textContent = cachedVideos.length
      ? 'YouTube could not refresh the saved results. They remain available; try again later.'
      : 'YouTube search is temporarily unavailable. The search cards stay visible and open the matching creator results directly.';
  }
}

async function searchCar(query) {
  const term = String(query || '').trim();
  if (!term) return;
  const requestId = ++searchRequestId;
  finderResult.hidden = false;
  finderStatus.textContent = 'Searching the India-market car directory for ' + term + '…';
  finderVideos.hidden = true;
  const vehicle = window.chassisResolveCar?.(term);
  const make = window.chassisResolveMake?.(term);
  if (!vehicle && make) {
    renderMakeDirectory(make);
    return;
  }
  if (!vehicle) {
    renderNoCarResult(term);
    return;
  }

  let article = null;
  try {
    const articles = await wikipediaOverview(vehicle.fullName);
    const titleOf = value => normalized(value);
    const modelNames = [vehicle.model.name, ...(vehicle.model.aliases || [])].map(titleOf).filter(value => value.length >= 2);
    const makeNames = [vehicle.make.make, ...(vehicle.make.aliases || [])].map(titleOf).filter(value => value.length >= 2);
    article = articles.find(item => {
      const title = titleOf(item.title);
      const extract = titleOf(item.extract).slice(0, 1800);
      const hasModel = modelNames.some(name => (' ' + title + ' ').includes(' ' + name + ' ') || (' ' + extract + ' ').includes(' ' + name + ' '));
      const hasMake = makeNames.some(name => (' ' + title + ' ').includes(' ' + name + ' ') || (' ' + extract + ' ').includes(' ' + name + ' '));
      return hasModel && hasMake;
    }) || null;
  } catch { /* Keep exact directory information and source links available. */ }
  if (requestId !== searchRequestId) return;
  renderWikipediaResult(article, vehicle.fullName, vehicle);
  await appendRichCarDetails(article, vehicle.fullName, vehicle, term);
  if (requestId !== searchRequestId) return;
  finderStatus.textContent = article
    ? vehicle.fullName + ' matched. Power and photos are shown only when their public records pass make/model checks; confirm the year and trim with the manufacturer.'
    : vehicle.fullName + ' is in the India-market directory. No exact encyclopedia match was found, so Velocitrak did not substitute another car.';
  loadVideos(vehicle.fullName);
}

searchForm.addEventListener('submit', event => {
  event.preventDefault();
  searchCar(searchInput.value);
});
searchInput.addEventListener('keydown', event => {
  if (event.key !== 'Enter' || event.isComposing) return;
  event.preventDefault();
  searchForm.requestSubmit();
});
document.querySelectorAll('[data-car-search]').forEach(button => button.addEventListener('click', () => {
  searchInput.value = button.dataset.carSearch;
  searchCar(button.dataset.carSearch);
}));

finderResult.addEventListener('click', event => {
  const modelPick = event.target.closest('[data-directory-car]');
  if (modelPick) {
    searchInput.value = modelPick.dataset.directoryCar;
    searchCar(modelPick.dataset.directoryCar);
    return;
  }
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
  prompt.textContent = 'Search another included model reference and add it to compare.';
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

