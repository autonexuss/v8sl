const inr = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, value));
window.chassisBindPlanner?.('emi');
window.chassisBindPlanner?.('mileage');
window.chassisBindPlanner?.('value');
window.chassisBindPlanner?.('listing');
window.chassisBindPlanner?.('garage');
const emiForm = document.getElementById('emi-form');
function calculateEmi() {
  const price = Number(document.getElementById('emi-price').value);
  const down = Number(document.getElementById('emi-down').value);
  const annualRate = Number(document.getElementById('emi-rate').value);
  const years = Number(document.getElementById('emi-years').value);
  const result = document.getElementById('emi-result');
  const make = document.getElementById('emi-make').value;
  const model = document.getElementById('emi-model').value;
  const year = document.getElementById('emi-year').value;
  if (!make || !model || !year) {
    result.textContent = 'Choose a manufacturer, model and year from the India-market lists.';
    return;
  }
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
  const note = document.createElement('span'); note.textContent = `${year} ${make} ${model} · loan ${inr(principal)} · estimated total interest ${inr(emi * months - principal)}`;
  result.append(strong, note);
}
emiForm.addEventListener('submit', event => { event.preventDefault(); calculateEmi(); });
emiForm.addEventListener('input', calculateEmi);
emiForm.addEventListener('change', calculateEmi);
calculateEmi();

const mileageForm = document.getElementById('mileage-form');
const mileageResult = document.getElementById('mileage-result');
const mileageEnergy = document.getElementById('mileage-energy');
const mileageEfficiency = document.getElementById('mileage-efficiency');
const mileagePrice = document.getElementById('mileage-unit-price');
function updateMileageUnits() {
  const unit = mileageEnergy.value === 'cng' ? 'km/kg' : mileageEnergy.value === 'electric' ? 'km/kWh' : 'km/L';
  const priceUnit = mileageEnergy.value === 'cng' ? '₹ per kg' : mileageEnergy.value === 'electric' ? '₹ per kWh' : '₹ per litre';
  mileageEfficiency.closest('label').firstChild.textContent = `Efficiency (${unit})`;
  mileagePrice.closest('label').firstChild.textContent = `Local price (${priceUnit})`;
}
function calculateMileage() {
  const make = document.getElementById('mileage-make').value;
  const model = document.getElementById('mileage-model').value;
  const year = document.getElementById('mileage-year').value;
  const efficiency = Number(mileageEfficiency.value);
  const unitPrice = Number(mileagePrice.value);
  const monthlyDistance = Number(document.getElementById('mileage-distance').value);
  if (!make || !model || !year) {
    mileageResult.textContent = 'Choose a manufacturer, model and year from the India-market lists.';
    return;
  }
  if (!(efficiency > 0) || !(unitPrice > 0) || !(monthlyDistance > 0)) {
    mileageResult.textContent = 'Enter positive values for efficiency, local energy price and monthly distance.';
    return;
  }
  const unitsUsed = monthlyDistance / efficiency;
  const monthlyCost = unitsUsed * unitPrice;
  const annualCost = monthlyCost * 12;
  const per1000 = (1000 / efficiency) * unitPrice;
  const unitLabel = mileageEnergy.value === 'cng' ? 'kg' : mileageEnergy.value === 'electric' ? 'kWh' : 'L';
  mileageResult.replaceChildren();
  const stats = document.createElement('div'); stats.className = 'mileage-stats';
  [[`${inr(monthlyCost)} / month`, 'ESTIMATED MONTHLY COST'], [`${unitsUsed.toFixed(1)} ${unitLabel}`, 'ENERGY USED / MONTH'], [`${inr(per1000)} / 1,000 km`, 'RUNNING COST']].forEach(([value, label]) => {
    const item = document.createElement('div'); item.className = 'mileage-stat';
    const strong = document.createElement('strong'); strong.textContent = value;
    const small = document.createElement('small'); small.textContent = label;
    item.append(strong, small); stats.append(item);
  });
  const barWrap = document.createElement('div'); barWrap.className = 'mileage-bar-wrap';
  const bar = document.createElement('div'); bar.className = 'mileage-bar';
  const fill = document.createElement('i'); fill.style.width = `${Math.max(6, Math.min(100, monthlyCost / 100))}%`; bar.append(fill);
  const caption = document.createElement('small'); caption.textContent = `${year} ${make} ${model} · estimated annual spend ${inr(annualCost)} at your entered values`;
  barWrap.append(bar, caption); mileageResult.append(stats, barWrap);
}
mileageForm.addEventListener('submit', event => { event.preventDefault(); calculateMileage(); });
mileageForm.addEventListener('input', calculateMileage);
mileageForm.addEventListener('change', () => { updateMileageUnits(); calculateMileage(); });
updateMileageUnits();
calculateMileage();

const valueForm = document.getElementById('value-form');
const resaleResult = document.getElementById('value-result');
const resaleLinks = document.getElementById('resale-links');
valueForm.addEventListener('submit', event => {
  event.preventDefault();
  const make = document.getElementById('value-make').value;
  const model = document.getElementById('value-model').value;
  const year = document.getElementById('value-year').value;
  const city = document.getElementById('value-city').value.trim();
  const km = Number(document.getElementById('value-km').value);
  if (!make || !model || !year || !city || !Number.isFinite(km) || km < 0) return;
  const search = `${year} ${make} ${model} used car ${city} ${km} km`;
  const sources = [
    ['CarDekho used cars', `site:cardekho.com/used-cars ${search}`],
    ['CarWale used cars', `site:carwale.com/used-cars ${search}`],
    ['CARS24 listings', `site:cars24.com/buy-used-cars ${search}`],
    ['Spinny listings', `site:spinny.com ${search}`]
  ];
  resaleLinks.replaceChildren();
  sources.forEach(([label, query]) => {
    const link = document.createElement('a'); link.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = `${label} ↗`; resaleLinks.append(link);
  });
  resaleLinks.hidden = false;
  const low = Number(document.getElementById('value-low').value);
  const high = Number(document.getElementById('value-high').value);
  resaleResult.replaceChildren();
  if (low > 0 && high >= low) {
    const strong = document.createElement('strong'); strong.textContent = `${inr(low)} – ${inr(high)}`;
    const note = document.createElement('span'); note.textContent = `Your comparable listing prices · ${year} ${make} ${model} · ${city} · ${new Intl.NumberFormat('en-IN').format(km)} km. This is based on the prices you entered.`;
    resaleResult.append(strong, note);
  } else {
    const strong = document.createElement('strong'); strong.textContent = 'Live marketplace searches are ready';
    const note = document.createElement('span'); note.textContent = 'Review matching ads and photos, then enter the lowest and highest comparable asking prices to calculate a reference range.';
    resaleResult.append(strong, note);
  }
});

const listingForm = document.getElementById('listing-form');
const listingPhotoGroups = [
  ['exterior', document.getElementById('listing-exterior')],
  ['interior', document.getElementById('listing-interior')],
  ['odometer', document.getElementById('listing-odometer')]
];
const photoPreview = document.getElementById('listing-photo-preview');
const listingObjectUrls = [];
listingPhotoGroups.forEach(([group, input]) => input.addEventListener('change', () => {
  listingObjectUrls.forEach(url => URL.revokeObjectURL(url)); listingObjectUrls.length = 0;
  photoPreview.replaceChildren();
  listingPhotoGroups.forEach(([category, photoInput]) => [...photoInput.files].forEach(file => {
    const figure = document.createElement('figure'); figure.className = 'listing-photo-thumb';
    const image = document.createElement('img'); const url = URL.createObjectURL(file); listingObjectUrls.push(url); image.src = url; image.alt = `${category} listing photo preview`; image.loading = 'lazy';
    const caption = document.createElement('figcaption'); caption.textContent = `${category} · ${file.name}`;
    figure.append(image, caption); photoPreview.append(figure);
  }));
}));

const listingDbReady = new Promise((resolve, reject) => {
  if (!('indexedDB' in window)) { reject(new Error('This browser does not support persistent photo storage.')); return; }
  const request = indexedDB.open('chassis-private-vault-v1', 1);
  request.onupgradeneeded = () => {
    const db = request.result;
    if (!db.objectStoreNames.contains('listingDrafts')) db.createObjectStore('listingDrafts', { keyPath: 'id' });
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('Could not open private browser storage.'));
});
async function saveListingRecord(record) {
  const db = await listingDbReady;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('listingDrafts', 'readwrite');
    transaction.objectStore('listingDrafts').put(record);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Could not save this listing draft.'));
  });
}
async function readListingRecords() {
  const db = await listingDbReady;
  return new Promise((resolve, reject) => {
    const request = db.transaction('listingDrafts').objectStore('listingDrafts').getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Could not read saved listing drafts.'));
  });
}
async function deleteListingRecord(id) {
  const db = await listingDbReady;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('listingDrafts', 'readwrite'); transaction.objectStore('listingDrafts').delete(id);
    transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
  });
}
const savedListings = document.getElementById('saved-listings');
function makeListingCard(record) {
  const card = document.createElement('article'); card.className = 'saved-listing-card';
  const heading = document.createElement('div'); heading.className = 'saved-listing-heading';
  const title = document.createElement('strong'); title.textContent = `${record.year} ${record.make} ${record.model}`;
  const price = document.createElement('b'); price.textContent = inr(record.price);
  heading.append(title, price);
  const details = document.createElement('p'); details.textContent = `${record.city} · ${new Intl.NumberFormat('en-IN').format(record.km)} km · ${record.fuel} · ${record.transmission} · ${record.photos.length} photos · PRIVATE DRAFT`;
  const description = document.createElement('p'); description.textContent = record.description;
  const gallery = document.createElement('div'); gallery.className = 'saved-listing-gallery';
  record.photos.slice(0, 9).forEach(photo => {
    const image = document.createElement('img');
    if (photo.blob instanceof Blob) {
      const url = URL.createObjectURL(photo.blob); image.src = url; image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    } else if (photo.url) image.src = photo.url;
    image.alt = `${photo.group} photo for ${record.make} ${record.model}`; image.loading = 'lazy'; gallery.append(image);
  });
  const actions = document.createElement('div'); actions.className = 'listing-card-actions';
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'filter-reset'; remove.textContent = 'Delete private draft';
  remove.addEventListener('click', async () => {
    try { await deleteListingRecord(record.id); await renderSavedListings(); }
    catch (error) { window.alert(`Could not delete this private draft. ${error.message}`); }
  });
  actions.append(remove);
  card.append(heading, details, description, gallery, actions);
  return card;
}
async function renderSavedListings() {
  savedListings.replaceChildren();
  try {
    const records = (await readListingRecords()).sort((a, b) => b.createdAt - a.createdAt);
    if (!records.length) {
      const empty = document.createElement('p'); empty.className = 'saved-listing-empty'; empty.textContent = 'Your private listing drafts will appear here on this device.'; savedListings.append(empty); return;
    }
    records.forEach(record => savedListings.append(makeListingCard(record)));
  } catch (error) {
    const msg = document.createElement('p'); msg.className = 'saved-listing-empty'; msg.textContent = `Private draft storage is unavailable in this browser. ${error.message}`; savedListings.append(msg);
  }
}
listingForm.addEventListener('submit', async event => {
  event.preventDefault();
  const photoFiles = listingPhotoGroups.flatMap(([group, input]) => [...input.files].map(file => ({ group, name: file.name, type: file.type, blob: file })));
  if (!listingPhotoGroups.every(([, input]) => input.files.length) || photoFiles.length > 18 || photoFiles.some(photo => !photo.type.startsWith('image/') || photo.blob.size > 12 * 1024 * 1024)) {
    window.alert('Add at least one image for exterior, interior and odometer. Use no more than 18 photos total, each under 12 MB.'); return;
  }
  const record = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(), make: document.getElementById('listing-make').value, model: document.getElementById('listing-model').value,
    year: Number(document.getElementById('listing-year').value), fuel: document.getElementById('listing-fuel').value,
    km: Number(document.getElementById('listing-km').value), price: Number(document.getElementById('listing-price').value),
    transmission: document.getElementById('listing-transmission').value, city: document.getElementById('listing-city').value.trim(),
    description: document.getElementById('listing-description').value.trim(), photos: photoFiles
  };
  if (!record.make || !record.model || !record.year || !record.city || !record.description || !(record.price > 0) || record.km < 0) return;
  try {
    await saveListingRecord(record);
    await renderSavedListings();
    listingForm.reset(); photoPreview.replaceChildren();
    document.getElementById('listing-model').disabled = true; document.getElementById('listing-year').disabled = true;
    const status = document.createElement('p'); status.className = 'listing-saved-status'; status.textContent = 'Private draft and photos saved in this browser on this device. The listing has not been published or shared.';
    savedListings.prepend(status);
  } catch (error) { window.alert(`The private draft could not be saved in this browser. ${error.message}`); }
});
renderSavedListings();

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
function syncPrivateList(key, list) {
  const localKey = key === 'serviceNotes' ? serviceKey : key === 'reminders' ? reminderKey : garageKey;
  return writeLocalList(localKey, list);
}
function renderPrivateList(key, targetId, fields) {
  const target = document.getElementById(targetId);
  const entries = readLocalList(key);
  target.replaceChildren();
  entries.forEach((entry, index) => {
    const row = document.createElement('div'); row.className = 'private-item';
    const text = document.createElement('span'); text.textContent = fields.map(field => entry[field]).filter(Boolean).join(' · ');
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', 'Remove saved item');
    remove.addEventListener('click', () => { const next = readLocalList(key); next.splice(index, 1); syncPrivateList(key === serviceKey ? 'serviceNotes' : key, next); renderPrivateList(key, targetId, fields); });
    row.append(text, remove); target.append(row);
  });
  if (!entries.length) { const empty = document.createElement('small'); empty.textContent = 'Nothing saved yet.'; target.append(empty); }
}
const serviceKey = 'chassis-private-service-notes-v1';
const serviceDate = document.getElementById('service-date');
const localToday = () => { const date = new Date(); date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); return date.toISOString().slice(0, 10); };
serviceDate.value = localToday();
document.getElementById('service-form').addEventListener('submit', event => {
  event.preventDefault();
  const entry = { date: serviceDate.value, odometer: `${document.getElementById('service-odo').value} km`, note: document.getElementById('service-note').value.trim() };
  const entries = readLocalList(serviceKey); entries.unshift(entry);
  if (!syncPrivateList('serviceNotes', entries)) { window.alert('Browser storage is unavailable. Your note was not saved.'); return; }
  event.currentTarget.reset(); serviceDate.value = localToday();
  renderPrivateList(serviceKey, 'service-list', ['date', 'odometer', 'note']);
});
const reminderKey = 'chassis-private-reminders-v2';
const reminderForm = document.getElementById('reminder-form');
const reminderList = document.getElementById('reminder-list');
const reminderNotifyButton = document.getElementById('enable-reminder-notifications');
function renderReminders() {
  const entries = readLocalList(reminderKey);
  reminderList.replaceChildren();
  entries.forEach((entry, index) => {
    const row = document.createElement('div'); row.className = `private-item reminder-item${entry.date <= localToday() ? ' is-due' : ''}`;
    const text = document.createElement('span'); text.textContent = `${entry.date} · ${entry.type}${entry.title ? ` · ${entry.title}` : ''}${entry.date <= localToday() ? ' · DUE' : ''}`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = 'Remove'; remove.setAttribute('aria-label', 'Remove saved reminder');
    remove.addEventListener('click', () => { const next = readLocalList(reminderKey); next.splice(index, 1); syncPrivateList('reminders', next); renderReminders(); });
    row.append(text, remove); reminderList.append(row);
  });
  if (!entries.length) { const empty = document.createElement('small'); empty.textContent = 'Nothing saved yet.'; reminderList.append(empty); }
}
function checkDueReminders() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const entries = readLocalList(reminderKey);
  let changed = false;
  entries.forEach(entry => {
    if (entry.date <= localToday() && !entry.notified) {
      try {
        new Notification('Chassis reminder', { body: `${entry.type}${entry.title ? ` · ${entry.title}` : ''}`, tag: `chassis-${entry.id}` });
        entry.notified = true; changed = true;
      } catch { /* Browser notification service can be unavailable. */ }
    }
  });
  if (changed) syncPrivateList('reminders', entries);
}
reminderForm.addEventListener('submit', event => {
  event.preventDefault();
  const entries = readLocalList(reminderKey);
  entries.unshift({ id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`, type: document.getElementById('reminder-type').value, title: document.getElementById('reminder-title').value.trim(), date: document.getElementById('reminder-date').value, notified: false });
  if (!syncPrivateList('reminders', entries)) { window.alert('Browser storage is unavailable. Your reminder was not saved.'); return; }
  event.currentTarget.reset();
  renderReminders(); checkDueReminders();
});
reminderNotifyButton.addEventListener('click', async () => {
  if (!('Notification' in window)) { reminderNotifyButton.textContent = 'Browser alerts unavailable'; return; }
  const permission = await Notification.requestPermission();
  reminderNotifyButton.textContent = permission === 'granted' ? 'Browser alerts enabled ✓' : 'Browser alerts not allowed';
  checkDueReminders();
});
checkDueReminders(); window.setInterval(checkDueReminders, 60_000);

const garageKey = 'chassis-personal-garage-v1';
const garageForm = document.getElementById('garage-form');
const garageList = document.getElementById('garage-list');
function renderGarage() {
  const entries = readLocalList(garageKey);
  garageList.replaceChildren();
  if (!entries.length) { const empty = document.createElement('p'); empty.className = 'garage-empty'; empty.textContent = 'Add a car to create your private garage.'; garageList.append(empty); return; }
  entries.forEach((entry, index) => {
    const card = document.createElement('article'); card.className = 'garage-car';
    const name = document.createElement('div'); name.className = 'garage-car-name';
    const title = document.createElement('strong'); title.textContent = `${entry.year} ${entry.make} ${entry.model}`;
    const registration = document.createElement('span'); registration.textContent = entry.registration;
    name.append(title, registration);
    const check = document.createElement('a'); check.href = 'https://echallan.parivahan.gov.in/index/accused-challan'; check.target = '_blank'; check.rel = 'noopener noreferrer'; check.className = 'button button-light'; check.textContent = 'Check eChallan ↗';
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'filter-reset'; remove.textContent = 'Remove';
    remove.addEventListener('click', () => { const next = readLocalList(garageKey); next.splice(index, 1); syncPrivateList('garage', next); renderGarage(); });
    card.append(name, check, remove); garageList.append(card);
  });
}
garageForm.addEventListener('submit', event => {
  event.preventDefault();
  const make = document.getElementById('garage-make').value;
  const model = document.getElementById('garage-model').value;
  const year = document.getElementById('garage-year').value;
  const registration = document.getElementById('garage-registration').value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!make || !model || !year || registration.length < 6 || registration.length > 13) { window.alert('Choose a make, model and year, then enter a valid registration number.'); return; }
  const entries = readLocalList(garageKey);
  if (entries.some(entry => entry.registration === registration)) { window.alert('This vehicle is already in your garage.'); return; }
  entries.unshift({ make, model, year, registration });
  if (!syncPrivateList('garage', entries)) { window.alert('Browser storage is unavailable. Your vehicle was not saved.'); return; }
  garageForm.reset(); document.getElementById('garage-model').disabled = true; document.getElementById('garage-year').disabled = true; renderGarage();
});
renderPrivateList(serviceKey, 'service-list', ['date', 'odometer', 'note']);
renderReminders(); renderGarage();
