// The hero advances only when its active film ends or the visitor uses Next/Previous.
const heroFilms = [
  { src: 'assets/videos/bmw-7-series.mp4', title: 'BMW 7 Series' },
  { src: 'assets/videos/mercedes-s-class.mp4', title: 'Mercedes-Benz S-Class' },
  { src: 'assets/videos/chassis-film.mp4', title: 'Supplied film 03' }
];
const heroVideo = document.querySelector('.hero-video');
const ambientCanvas = document.querySelector('.ambient-canvas');
const ambientContext = ambientCanvas?.getContext('2d', { alpha: false });
const heroVideoCount = document.getElementById('hero-video-count');
const heroVideoTitle = document.getElementById('hero-video-title');
const heroVideoProgress = document.getElementById('hero-video-progress');
const heroToggle = document.querySelector('[data-video-toggle]');
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
  heroToggle.textContent = heroVideo.paused ? '▶' : 'Ⅱ';
  heroToggle.setAttribute('aria-label', heroVideo.paused ? 'Play film' : 'Pause film');
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
  heroVideoTitle.textContent = `${film.title} · Supplied film`;
  heroVideoProgress.style.width = '0%';
  heroVideo.play().then(() => {
    if (loadId !== filmLoadId || heroVideo.paused) return;
    window.clearInterval(ambientTimer);
    ambientTimer = window.setInterval(paintAmbientFrame, 90);
    updateFilmControls();
  }).catch(() => {
    if (loadId !== filmLoadId) return;
    updateFilmControls();
    heroVideoTitle.textContent = `${film.title} · Press play to begin`;
  });
}

heroVideo?.addEventListener('ended', () => showFilm(currentFilm + 1));
heroVideo?.addEventListener('timeupdate', updateFilmControls);
heroVideo?.addEventListener('play', () => {
  window.clearInterval(ambientTimer);
  ambientTimer = window.setInterval(paintAmbientFrame, 90);
  updateFilmControls();
});
heroVideo?.addEventListener('pause', () => { window.clearInterval(ambientTimer); paintAmbientFrame(); updateFilmControls(); });
document.querySelector('[data-video-prev]')?.addEventListener('click', () => showFilm(currentFilm - 1));
document.querySelector('[data-video-next]')?.addEventListener('click', () => showFilm(currentFilm + 1));
heroToggle?.addEventListener('click', () => {
  if (heroVideo.paused) heroVideo.play().catch(() => updateFilmControls());
  else heroVideo.pause();
});
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

// Revenue-model UI only: never sends, stores, looks up, or charges for the entered registration.
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
  detail.textContent = 'Chassis has no live challan or insurance connection, so it did not check or store the registration. Enter it again only after opening the official service.';
  reportResult.append(heading, detail);
  document.getElementById('record-action-grid').hidden = false;
});

const input = document.getElementById('car-photo');
const preview = document.getElementById('preview-image');
const scanButton = document.getElementById('scan-car');
const scanMatch = document.getElementById('scan-match');
let localUrl;
input.addEventListener('change', () => {
  const file = input.files && input.files[0];
  if (!file) return;
  scanMatch.hidden = true;
  document.getElementById('scan-kicker').textContent = 'PHOTO CHECK · READY';
  document.getElementById('result-title').textContent = 'Ready to check this photo';
  document.getElementById('scan-disclaimer').textContent = 'A positive result means a car-shaped object was detected. It is not an exact make/model identification.';
  scanButton.disabled = true;
  if (!file.type.startsWith('image/')) {
    document.getElementById('result-title').textContent = 'invalid input';
    document.getElementById('scan-kicker').textContent = 'PHOTO CHECK · INVALID FILE';
    return;
  }
  if (file.size > 15 * 1024 * 1024) {
    document.getElementById('result-title').textContent = 'Image is too large';
    document.getElementById('scan-disclaimer').textContent = 'Choose an image smaller than 15 MB and try again.';
    return;
  }
  if (localUrl) URL.revokeObjectURL(localUrl);
  localUrl = URL.createObjectURL(file);
  preview.onload = () => { scanButton.disabled = false; };
  preview.src = localUrl;
  preview.hidden = false;
  document.querySelector('.preview-empty').hidden = true;
  document.getElementById('result-title').textContent = 'Ready to check this photo';
});

const scanMake = document.getElementById('scan-make');
const scanModel = document.getElementById('scan-model');
const indiaDirectory = window.CHASSIS_INDIA_DIRECTORY || [];
indiaDirectory.forEach(make => scanMake.add(new Option(make.make, make.make)));
scanMake.addEventListener('change', () => {
  scanModel.replaceChildren(new Option(scanMake.value ? 'Choose a model' : 'Choose manufacturer first', ''));
  const make = window.chassisResolveMake?.(scanMake.value);
  (make?.models || []).forEach(model => scanModel.add(new Option(model.name, model.name)));
  scanModel.disabled = !make;
  document.getElementById('scan-open-profile').disabled = true;
});
scanModel.addEventListener('change', () => { document.getElementById('scan-open-profile').disabled = !scanModel.value; });
document.getElementById('scan-open-profile').addEventListener('click', () => {
  if (!scanMake.value || !scanModel.value) return;
  document.getElementById('car-search-input').value = `${scanMake.value} ${scanModel.value}`;
  document.getElementById('car-search-form').requestSubmit();
  document.getElementById('find-cars').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

function resizeScanImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, 1400 / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext('2d', { alpha: false });
      if (!context) { reject(new Error('This browser could not prepare the photo.')); return; }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('This photo could not be compressed.')); return; }
        if (blob.size > 8 * 1024 * 1024) { reject(new Error('This photo is still too large to send securely.')); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
        reader.onerror = () => reject(new Error('This photo could not be read.'));
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.82);
    };
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This image could not be opened.')); };
    image.src = url;
  });
}

function suggestDirectoryVehicle(result) {
  const clues = [
    ...(result.logos || []).map(item => ({ text: item.text, score: Number(item.score || 0) + 0.05 })),
    ...(result.webEntities || []).map(item => ({ text: item.text, score: Number(item.score || 0) })),
    ...(result.bestGuesses || []).map(text => ({ text, score: 0.35 }))
  ].filter(item => item.text).sort((a, b) => b.score - a.score);
  const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const clue of clues) {
    const normalizedClue = normalize(clue.text);
    for (const make of indiaDirectory) {
      const makeName = normalize(make.make);
      const makeAliases = [make.make, ...(make.aliases || [])].map(normalize).filter(Boolean);
      const matchedMake = makeAliases.find(alias => alias.length > 2 && normalizedClue.includes(alias));
      if (!matchedMake) continue;
      const model = (make.models || []).find(item => {
        const candidate = normalize(item.name);
        return candidate.length > 1 && normalizedClue.includes(candidate);
      });
      return { make: make.make, model: model?.name || '', clue: clue.text, score: clue.score };
    }
  }
  return null;
}

function renderScanEvidence(result, suggestion) {
  const target = document.getElementById('scan-evidence');
  target.replaceChildren();
  const labels = [...(result.labels || []).map(item => item.text), ...(result.logos || []).map(item => item.text), ...(result.bestGuesses || [])].filter(Boolean).slice(0, 8);
  if (suggestion) {
    const title = document.createElement('strong');
    title.textContent = `Possible match: ${suggestion.make}${suggestion.model ? ` ${suggestion.model}` : ''}`;
    const note = document.createElement('small');
    note.textContent = `Google Vision visual clue: “${suggestion.clue}”. This suggestion can be wrong; confirm it below.`;
    target.append(title, note);
  } else if (labels.length) {
    const note = document.createElement('small');
    note.textContent = `Visual clues: ${[...new Set(labels)].join(' · ')}. No exact India-market make and model match was found.`;
    target.append(note);
  }
  const links = document.createElement('div');
  links.className = 'scan-web-links';
  (result.webMatches || []).slice(0, 3).forEach(match => {
    const link = document.createElement('a');
    link.href = match.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = `${match.title || 'View a similar-image result'} ↗`;
    links.append(link);
  });
  if (links.childElementCount) target.append(links);
  target.hidden = target.childElementCount === 0;
}

let vehicleDetector;
scanButton.addEventListener('click', async () => {
  if (!preview.src || scanButton.disabled) return;
  scanButton.disabled = true;
  scanMatch.hidden = true;
  document.getElementById('scan-kicker').textContent = 'PHOTO CHECK · RUNNING';
  document.getElementById('result-title').textContent = 'Checking for a car…';
  document.getElementById('scan-evidence').hidden = true;
  document.getElementById('scan-disclaimer').textContent = 'Preparing the selected photo…';
  try {
    const cloud = window.chassisCloud;
    if (cloud?.configured && cloud.user?.emailVerified) {
      document.getElementById('scan-disclaimer').textContent = 'Sending a compressed, temporary copy to Google Cloud Vision for vehicle, logo and public web-match analysis…';
      const result = await cloud.identifyCar(await resizeScanImage(input.files[0]));
      if (!result?.isCar) {
        document.getElementById('scan-kicker').textContent = 'PHOTO CHECK · COMPLETE';
        document.getElementById('result-title').textContent = 'invalid input';
        document.getElementById('scan-disclaimer').textContent = 'Google Cloud Vision did not find enough evidence that this image contains a car. Try a clear photo with the car fully visible.';
        renderScanEvidence(result || {}, null);
        return;
      }
      const suggestion = suggestDirectoryVehicle(result);
      document.getElementById('scan-kicker').textContent = 'PHOTO CHECK · POSSIBLE VEHICLE MATCH';
      document.getElementById('result-title').textContent = suggestion?.model
        ? `Possible match · ${suggestion.make} ${suggestion.model}`
        : suggestion?.make ? `Possible make · ${suggestion.make}` : 'Car detected · confirm the model';
      document.getElementById('scan-disclaimer').textContent = result.note || 'Cloud Vision can suggest labels, logos and visually related web results. It does not certify vehicle identity. Verify the exact year, variant and specification with the manufacturer.';
      renderScanEvidence(result, suggestion);
      if (suggestion) {
        scanMake.value = suggestion.make;
        scanMake.dispatchEvent(new Event('change'));
        if (suggestion.model && [...scanModel.options].some(option => option.value === suggestion.model)) {
          scanModel.value = suggestion.model;
          scanModel.dispatchEvent(new Event('change'));
        }
      }
    } else {
      if (!window.cocoSsd) throw new Error('The on-device detector did not load. Check your connection and try again.');
      vehicleDetector ||= await window.cocoSsd.load({ base: 'mobilenet_v2' });
      const detections = await vehicleDetector.detect(preview);
      const detected = detections.filter(item => item.class === 'car' && item.score >= 0.4).sort((a, b) => b.score - a.score)[0];
      if (!detected) {
        document.getElementById('scan-kicker').textContent = 'PHOTO CHECK · COMPLETE';
        document.getElementById('result-title').textContent = 'invalid input';
        document.getElementById('scan-disclaimer').textContent = 'No car was detected in this photo. Sign in after cloud setup for Vision labels and possible public-image matches.';
        return;
      }
      document.getElementById('scan-kicker').textContent = 'PHOTO CHECK · CAR DETECTED';
      document.getElementById('result-title').textContent = `Car detected · ${Math.round(detected.score * 100)}% detector confidence`;
      document.getElementById('scan-disclaimer').textContent = 'This on-device model detects the category “car”. It cannot distinguish make, model, trim or year. Choose the car below to open the site’s reference profile.';
    }
    scanMatch.hidden = false;
  } catch (error) {
    document.getElementById('scan-kicker').textContent = 'PHOTO CHECK · UNAVAILABLE';
    document.getElementById('result-title').textContent = 'Could not scan this image';
    document.getElementById('scan-disclaimer').textContent = error.message || 'The browser could not load the on-device car detector. Try again when connected to the internet.';
  } finally {
    scanButton.disabled = false;
  }
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

const referenceProfiles = [
  {
    image: 'assets/1.jpg', alt: 'User photo 1: possible Mercedes-AMG A-Class hatchback',
    title: 'Possible Mercedes-AMG A 45 S',
    summary: 'The first photo appears to show an AMG A-Class hatchback. The detailed figures and equipment below are a current Mercedes-Benz India A 45 S reference, not a confirmed identification of the photographed car.',
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

function normalized(value) { return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
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
    const summary = document.createElement('p'); summary.textContent = shortExcerpt(article.extract || 'Open the article for more information.', 920);
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
        const extract = document.createElement('p'); extract.textContent = shortExcerpt(article.extract || 'Open this related reference page.', 260);
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
  return { qid, label, description, rows, values, imageTitle, unitLabels: labelMap, source: `https://www.wikidata.org/wiki/${qid}` };
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

async function commonsFileImage(filename) {
  if (!filename) return null;
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'query', prop: 'imageinfo', titles: `File:${filename}`, iiprop: 'url|extmetadata', iiurlwidth: '1200', format: 'json', origin: '*' });
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = await response.json();
  const page = Object.values(data.query?.pages || {})[0];
  const info = page?.imageinfo?.[0];
  if (!info?.thumburl || !info?.descriptionurl) return null;
  const meta = info.extmetadata || {};
  return {
    title: page.title?.replace(/^File:/, '') || filename,
    image: info.thumburl,
    page: info.descriptionurl,
    licenseUrl: meta.LicenseUrl?.value || info.descriptionurl,
    license: cleanMetadata(meta.LicenseShortName?.value) || 'See file page',
    artist: cleanMetadata(meta.Artist?.value || meta.Credit?.value)
  };
}

function renderImageGallery(target, query, localImage, article, vehicle) {
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
    commonsVehicleImages(query, view.key).then(async images => {
      if (view.key === 'exterior' && !images.length) {
        const sourceImage = vehicle?.imageTitle || article?.pageimage;
        const sourced = await commonsFileImage(sourceImage).catch(() => null);
        if (sourced) images = [sourced];
      }
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
  renderImageGallery(galleryContainer, query, localImage, article, vehicle);
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
  document.getElementById('video-caption-note').textContent = 'The site-wide YouTube connection is unavailable right now. These creator-focused searches still open YouTube; direct video cards and thumbnails return when the site key is active.';
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
    thumbnail.loading = 'lazy';
    thumbnail.referrerPolicy = 'no-referrer';
    const thumbnailCandidates = [...new Set([video.thumbnail, `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`, `https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`, `https://i.ytimg.com/vi/${video.id}/sddefault.jpg`, `https://i.ytimg.com/vi/${video.id}/0.jpg`].filter(Boolean))];
    let thumbnailAttempt = 0;
    thumbnail.addEventListener('error', () => {
      thumbnailAttempt += 1;
      if (thumbnailAttempt < thumbnailCandidates.length) thumbnail.src = thumbnailCandidates[thumbnailAttempt];
      else { thumbnail.removeAttribute('src'); thumbLink.classList.add('thumbnail-unavailable'); }
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
  const groups = await Promise.all(channels.map(async channel => {
    const channelId = await youtubeChannelId(channel.handle, apiKey);
    const data = await youtubeApiRequest('search', {
      part: 'snippet', type: 'video', channelId, q: `${query} car review`,
      maxResults: '10', regionCode: 'IN', safeSearch: 'moderate'
    }, apiKey);
    return (data.items || []).filter(item => item.id?.videoId && youtubeResultMatches(query, item.snippet?.title)).slice(0, 3).map(item => ({
      id: item.id.videoId, title: item.snippet?.title || `${query} review`, creator: channel.name,
      channel: item.snippet?.channelTitle || channel.name, publishedAt: item.snippet?.publishedAt || '',
      thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url,
      watchUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(item.id.videoId)}`
    }));
  }));
  return groups.flat();
}

async function loadVideos(query) {
  activeVideoQuery = query;
  finderVideos.hidden = false;
  const browserKey = youtubePublicKey;
  if (browserKey) {
    try {
      const videos = await browserYoutubeVideos(query, browserKey);
      if (renderCaptionedVideos(videos)) return;
      renderFallbackVideoLinks(query);
      document.getElementById('video-caption-note').textContent = 'No matching videos from these channels were returned. Try the full model name or use the creator search links.';
      return;
    } catch (error) {
      renderFallbackVideoLinks(query);
      document.getElementById('video-caption-note').textContent = `YouTube is temporarily unavailable (${error.message}). Use the creator searches below; the site key is managed by Chassis.`;
      return;
    }
  }
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
  const requestId = ++searchRequestId;
  finderResult.hidden = false;
  finderStatus.textContent = `Searching for ${term}…`;
  finderVideos.hidden = true;
  const make = window.chassisResolveMake?.(term);
  const vehicle = window.chassisResolveCar?.(term);
  if (!vehicle && make) {
    renderMakeDirectory(make);
    return;
  }
  if (!vehicle) {
    renderNoCarResult(term);
    return;
  }
  const carName = vehicle.fullName;
  const localIndex = knownProfileIndex(carName) >= 0 ? knownProfileIndex(carName) : knownProfileIndex(term);
  if (localIndex >= 0) {
    renderKnownProfile(localIndex);
    const car = referenceProfiles[localIndex];
    let article = null;
    try { article = (await wikipediaOverview(car.title.replace(/^Possible\s+/i, '')))[0] || null; } catch { /* Keep the supplied photo profile and its source links available. */ }
    if (requestId !== searchRequestId) return;
    await appendRichCarDetails(article, car.title.replace(/^Possible\s+/i, ''), { image: car.image, alt: car.alt });
  } else {
    try {
      const articleResults = await wikipediaOverview(carName);
      if (requestId !== searchRequestId) return;
      const modelName = normalized(vehicle.model.name);
      const makeName = normalized(vehicle.make.make);
      const articles = articleResults.filter(article => {
        const title = normalized(article.title);
        return title.includes(modelName) || title.includes(makeName) && normalized(article.extract).includes(modelName);
      });
      renderWikipediaResult(articles, carName);
      await appendRichCarDetails(articles[0] || null, carName);
      if (requestId !== searchRequestId) return;
      finderStatus.textContent = articles.length ? `${vehicle.fullName} found in the India-market directory. Confirm model year, variant and specifications with the manufacturer.` : `${vehicle.fullName} is in the India-market directory, but no matching Wikipedia article was found. Public specs and photos may be limited.`;
    } catch {
      if (requestId !== searchRequestId) return;
      renderWikipediaResult(null, carName);
      await appendRichCarDetails(null, carName);
      if (requestId !== searchRequestId) return;
      finderStatus.textContent = `${vehicle.fullName} is in the India-market directory. Online references could not load just now.`;
    }
  }
  if (requestId === searchRequestId) loadVideos(carName);
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
