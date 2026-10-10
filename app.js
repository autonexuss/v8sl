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
    summary: 'The third photo appears to show a large Audi sedan and may be an A8 L. The A8 is Audi’s full-size luxury sedan family; its engine, output, dimensions and equipment change by generation, year and market.',
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
    articles.forEach((article, index) => {
      const card = document.createElement('article'); card.className = 'wiki-result-card';
      const label = document.createElement('span'); label.className = 'result-kicker'; label.textContent = `PUBLIC REFERENCE ${String(index + 1).padStart(2, '0')} · VERIFY YEAR & VARIANT`;
      const title = document.createElement('h3'); title.textContent = article.title;
      const summary = document.createElement('p'); summary.textContent = article.extract || 'Open the article for more information.';
      const articleLink = makeLink('Open Wikipedia article ↗', article.url);
      card.append(label, title, summary, articleLink);
      finderResult.append(card);
    });
  }
  const sources = document.createElement('article'); sources.className = 'wiki-result-card source-result-card';
  const sourceTitle = document.createElement('h3'); sourceTitle.textContent = `More sources for ${query}`;
  const note = document.createElement('p'); note.textContent = 'Wikipedia is a general reference. These searches open other websites; prices, listings and specifications are not imported into Chassis.';
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
  summaryUrl.searchParams.set('prop', 'extracts|info|pageimages');
  summaryUrl.searchParams.set('exintro', '1');
  summaryUrl.searchParams.set('explaintext', '1');
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
      url: article.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(article.title.replaceAll(' ', '_'))}`
    }));
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
    const frame = document.createElement('iframe');
    frame.src = video.embedUrl;
    frame.title = `${video.title} — video captions enabled`;
    frame.loading = 'lazy';
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    const title = document.createElement('strong');
    title.textContent = video.title;
    card.append(creator, frame, title, makeLink('Watch on YouTube ↗', video.watchUrl));
    videoResults.append(card);
  });
  document.getElementById('video-caption-note').textContent = 'These videos were returned by YouTube search with its closed-caption filter. Captions are requested in the embedded player; choose a language with CC if needed.';
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
  } else {
    try {
      const articles = await wikipediaOverview(term);
      renderWikipediaResult(articles, term);
      finderStatus.textContent = articles.length ? `${articles.length} public reference results found. Confirm exact model year and variant with the manufacturer.` : 'No matching article preview found; direct source searches are ready.';
    } catch {
      renderWikipediaResult(null, term);
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

