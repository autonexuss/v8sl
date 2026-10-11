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
function makeListingCard(record, remote = false) {
  const card = document.createElement('article'); card.className = 'saved-listing-card';
  const heading = document.createElement('div'); heading.className = 'saved-listing-heading';
  const title = document.createElement('strong'); title.textContent = `${record.year} ${record.make} ${record.model}`;
  const price = document.createElement('b'); price.textContent = inr(record.price);
  heading.append(title, price);
  const details = document.createElement('p'); details.textContent = `${record.city} · ${new Intl.NumberFormat('en-IN').format(record.km)} km · ${record.fuel} · ${record.transmission} · ${record.photos.length} photos · ${record.status === 'published' ? 'PUBLIC LISTING' : 'PRIVATE DRAFT'}`;
  const description = document.createElement('p'); description.textContent = record.description;
  const gallery = document.createElement('div'); gallery.className = 'saved-listing-gallery';
  record.photos.slice(0, 9).forEach(photo => {
    const image = document.createElement('img');
    if (photo.blob instanceof Blob) {
      const url = URL.createObjectURL(photo.blob); image.src = url; image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
    } else if (photo.url) image.src = photo.url;
    else if (photo.path && window.chassisCloud?.configured && window.chassisCloud.user?.emailVerified) {
      window.chassisCloud.getPrivateListingPhoto(photo.path).then(blob => {
        const url = URL.createObjectURL(blob);
        image.src = url;
        image.addEventListener('load', () => URL.revokeObjectURL(url), { once: true });
        image.addEventListener('error', () => URL.revokeObjectURL(url), { once: true });
      }).catch(() => { image.alt = `${photo.group} photo unavailable in private storage`; });
    }
    image.alt = `${photo.group} photo for ${record.make} ${record.model}`; image.loading = 'lazy'; gallery.append(image);
  });
  const actions = document.createElement('div'); actions.className = 'listing-card-actions';
  if (remote && record.status === 'published') {
    const interests = document.createElement('button'); interests.type = 'button'; interests.className = 'filter-reset'; interests.textContent = 'View buyer interest';
    interests.addEventListener('click', async () => {
      try {
        const people = await window.chassisCloud.listListingInterests(record.id);
        const box = document.getElementById('listing-interest'); box.hidden = false; box.replaceChildren();
        const heading = document.createElement('strong'); heading.textContent = people.length ? `Interested buyers · ${people.length}` : 'No interested buyers yet'; box.append(heading);
        people.forEach(person => { const row = document.createElement('p'); row.textContent = person.fromEmail || 'Buyer email unavailable'; box.append(row); });
      } catch (error) { setCloudStatus(`Could not load buyer interest: ${error.message}`, true); }
    });
    actions.append(interests);
  }
  const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'filter-reset'; remove.textContent = remote ? 'Delete listing' : 'Delete private draft';
  remove.addEventListener('click', async () => {
    if (remote && !window.confirm('Delete this listing, remove its public photos and unpublish it?')) return;
    try {
      if (remote && window.chassisCloud?.configured) await window.chassisCloud.deleteListing(record.id);
      await deleteListingRecord(record.id);
      await renderSavedListings(); await refreshMarketplace();
    } catch (error) { setCloudStatus(`Could not delete the listing: ${error.message}`, true); }
  });
  actions.append(remove);
  card.append(heading, details, description, gallery, actions);
  return card;
}
async function renderSavedListings() {
  savedListings.replaceChildren();
  try {
    const localRecords = (await readListingRecords()).sort((a, b) => b.createdAt - a.createdAt);
    let remoteRecords = [];
    if (window.chassisCloud?.configured && window.chassisCloud.user?.emailVerified) {
      try { remoteRecords = await window.chassisCloud.listMyListings(); }
      catch (error) { const syncError = document.createElement('p'); syncError.className = 'saved-listing-empty'; syncError.textContent = `Cloud listings could not load: ${error.message}`; savedListings.append(syncError); }
    }
    const remoteById = new Map(remoteRecords.map(record => [record.id, record]));
    const records = localRecords.map(record => ({ ...record, status: remoteById.get(record.id)?.status || 'draft' }));
    for (const record of remoteRecords) if (!localRecords.some(local => local.id === record.id)) records.push(record);
    if (!records.length && !savedListings.childElementCount) { const empty = document.createElement('p'); empty.className = 'saved-listing-empty'; empty.textContent = 'Your saved drafts and listings will appear here.'; savedListings.append(empty); return; }
    records.forEach(record => savedListings.append(makeListingCard(record, remoteById.has(record.id) || record.photos.every(photo => Boolean(photo.url)))));
  } catch (error) { const msg = document.createElement('p'); msg.className = 'saved-listing-empty'; msg.textContent = `Private photo storage is unavailable: ${error.message}`; savedListings.append(msg); }
}

const marketplace = document.getElementById('marketplace-listings');
async function refreshMarketplace() {
  marketplace.replaceChildren();
  if (!window.chassisCloud?.configured) {
    const note = document.createElement('p'); note.textContent = 'Public listings will appear after Firebase is configured.'; marketplace.append(note); return;
  }
  try {
    const records = await window.chassisCloud.listPublicListings();
    if (!records.length) { const note = document.createElement('p'); note.textContent = 'No cars have been published yet. Choose “Publish this listing publicly” when saving a car.'; marketplace.append(note); return; }
    records.forEach(record => {
      const card = document.createElement('article'); card.className = 'marketplace-card';
      const photo = document.createElement('img'); photo.src = record.photos?.[0]?.url || ''; photo.alt = `${record.year} ${record.make} ${record.model}`; photo.loading = 'lazy';
      const body = document.createElement('div'); body.className = 'marketplace-card-body';
      const title = document.createElement('h4'); title.textContent = `${record.year} ${record.make} ${record.model}`;
      const price = document.createElement('strong'); price.textContent = inr(record.price);
      const summary = document.createElement('p'); summary.textContent = `${record.city} · ${new Intl.NumberFormat('en-IN').format(record.km)} km · ${record.fuel} · ${record.transmission}`;
      const description = document.createElement('p'); description.textContent = record.description;
      const photos = document.createElement('div'); photos.className = 'marketplace-thumbs';
      (record.photos || []).slice(1, 6).forEach(item => { const image = document.createElement('img'); image.src = item.url; image.alt = `${item.group} photo`; image.loading = 'lazy'; photos.append(image); });
      body.append(title, price, summary, description, photos);
      if (window.chassisCloud.user?.uid === record.ownerUid) {
        const owner = document.createElement('small'); owner.textContent = 'Your public listing'; body.append(owner);
      } else {
        const interested = document.createElement('button'); interested.type = 'button'; interested.className = 'button button-light'; interested.textContent = 'I’m interested';
        interested.addEventListener('click', async () => {
          const user = window.chassisCloud.user;
          if (!user?.emailVerified) { setCloudStatus('Sign in and verify your email to contact a seller.'); document.getElementById('personal-garage').scrollIntoView({ behavior: 'smooth' }); return; }
          if (!window.confirm(`Share ${user.email} with the seller of this car so they can contact you?`)) return;
          try { await window.chassisCloud.sendInterest(record); interested.disabled = true; interested.textContent = 'Interest sent ✓'; }
          catch (error) { setCloudStatus(error.message, true); }
        });
        body.append(interested);
      }
      card.append(photo, body); marketplace.append(card);
    });
  } catch (error) { const note = document.createElement('p'); note.textContent = `Marketplace is temporarily unavailable: ${error.message}`; marketplace.append(note); }
}
document.getElementById('refresh-marketplace').addEventListener('click', refreshMarketplace);
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
  const publish = document.getElementById('listing-publish').checked;
  const cloud = window.chassisCloud;
  if (publish && (!cloud?.configured || !cloud.user?.emailVerified)) {
    setCloudStatus('Sign in with a verified account and configure Firebase before publishing a public listing.', true);
    document.getElementById('personal-garage').scrollIntoView({ behavior: 'smooth' });
    return;
  }
  if (!record.make || !record.model || !record.year || !record.city || !record.description || !(record.price > 0) || record.km < 0) return;
  try {
    await saveListingRecord(record);
    if (cloud?.configured && cloud.user?.emailVerified) await cloud.saveListing(record, publish);
    await renderSavedListings();
    await refreshMarketplace();
    listingForm.reset(); photoPreview.replaceChildren();
    document.getElementById('listing-model').disabled = true; document.getElementById('listing-year').disabled = true;
    const status = document.createElement('p'); status.className = 'listing-saved-status'; status.textContent = publish ? 'Listing published. Buyers can view the car photos and send interest; your email remains private until they choose to share theirs.' : cloud?.configured && cloud.user?.emailVerified ? 'Private listing draft and photos synced to your Chassis account.' : 'Private listing draft and photos saved in this browser on this device.';
    savedListings.prepend(status);
  } catch (error) { window.alert(`The listing was saved locally if browser storage succeeded, but cloud upload or publication failed. ${error.message}`); }
});
renderSavedListings();
refreshMarketplace();

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
const cloudStatus = document.getElementById('cloud-status');
const accountForm = document.getElementById('account-form');
const accountSignedIn = document.getElementById('account-signed-in');
const accountCreate = document.getElementById('account-create');
const accountHeading = document.getElementById('account-heading');
let syncingCloudUid = '';
function setCloudStatus(message, error = false) {
  cloudStatus.textContent = message;
  cloudStatus.classList.toggle('is-error', error);
}
function syncPrivateList(key, list) {
  if (!writeLocalList(key === 'serviceNotes' ? serviceKey : key === 'reminders' ? reminderKey : garageKey, list)) return false;
  const cloud = window.chassisCloud;
  if (cloud?.configured && cloud.user?.emailVerified) {
    cloud.savePrivateList(key, list).catch(error => setCloudStatus(`Saved on this device; cloud sync failed: ${error.message}`, true));
  }
  return true;
}
async function initializeCloudData() {
  const cloud = window.chassisCloud;
  if (!cloud?.configured || !cloud.user?.emailVerified) return;
  if (syncingCloudUid === cloud.user.uid) return;
  syncingCloudUid = cloud.user.uid;
  const collections = [
    ['garage', garageKey], ['serviceNotes', serviceKey], ['reminders', reminderKey]
  ];
  try {
    const ownerKey = 'chassis-local-private-owner-uid';
    const existingOwner = localStorage.getItem(ownerKey);
    const mayMigrateLocalData = !existingOwner || existingOwner === cloud.user.uid;
    if (existingOwner && existingOwner !== cloud.user.uid) {
      for (const [, localKey] of collections) writeLocalList(localKey, []);
    }
    for (const [collection, localKey] of collections) {
      const remote = await cloud.fetchPrivateList(collection);
      const local = readLocalList(localKey);
      if (remote === null) await cloud.savePrivateList(collection, mayMigrateLocalData ? local : []);
      else writeLocalList(localKey, remote);
      cloud.watchPrivateList(collection, incoming => {
        if (!Array.isArray(incoming)) return;
        writeLocalList(localKey, incoming);
        if (collection === 'garage') renderGarage();
        if (collection === 'serviceNotes') renderPrivateList(serviceKey, 'service-list', ['date', 'odometer', 'note']);
        if (collection === 'reminders') renderReminders();
      });
    }
    localStorage.setItem(ownerKey, cloud.user.uid);
    setCloudStatus('Signed in · private garage, reminders and service notes sync across devices.');
    renderGarage(); renderReminders();
    renderPrivateList(serviceKey, 'service-list', ['date', 'odometer', 'note']);
    await renderSavedListings();
    await refreshMarketplace();
  } catch (error) {
    syncingCloudUid = '';
    setCloudStatus(`Your local data is safe, but cloud sync could not finish: ${error.message}`, true);
  }
}
function updateAccountUI(user) {
  const cloud = window.chassisCloud;
  const ready = Boolean(cloud?.configured);
  for (const button of accountForm.querySelectorAll('button')) button.disabled = !ready;
  accountForm.querySelectorAll('input').forEach(input => { input.disabled = !ready; });
  if (!ready) {
    accountForm.hidden = false; accountSignedIn.hidden = true;
    accountHeading.textContent = 'Sync your garage across devices';
    return;
  }
  if (user?.emailVerified) {
    accountForm.hidden = true; accountSignedIn.hidden = false;
    document.getElementById('account-email-display').textContent = user.email;
    accountHeading.textContent = 'Your account is connected';
  } else {
    accountForm.hidden = false; accountSignedIn.hidden = true;
    accountHeading.textContent = 'Sync your garage across devices';
  }
}

window.addEventListener('chassis-cloud-ready', event => {
  setCloudStatus(event.detail.message, !event.detail.enabled && Boolean(window.CHASSIS_FIREBASE_CONFIG?.projectId));
  updateAccountUI(window.chassisCloud?.user);
  if (window.chassisCloud?.configured) refreshMarketplace();
  if (window.chassisCloud?.user?.emailVerified) initializeCloudData();
});
window.addEventListener('chassis-auth-change', event => {
  const user = event.detail.user;
  if (!user?.emailVerified || user.uid !== syncingCloudUid) syncingCloudUid = '';
  updateAccountUI(user);
  if (user?.emailVerified) initializeCloudData();
  else if (user) setCloudStatus('Check your inbox and verify your email before syncing or scanning with Google Vision.');
  else if (window.chassisCloud?.configured) { setCloudStatus('Signed out · this device’s existing local data remains available.'); refreshMarketplace(); }
});
accountForm.addEventListener('submit', async event => {
  event.preventDefault();
  const cloud = window.chassisCloud;
  if (!cloud?.configured) return;
  try {
    await cloud.signIn(document.getElementById('account-email').value.trim(), document.getElementById('account-password').value);
    document.getElementById('account-password').value = '';
    setCloudStatus('Signed in. Loading your private account data…');
  } catch (error) { setCloudStatus(error.message, true); }
});
accountCreate.addEventListener('click', async () => {
  const cloud = window.chassisCloud;
  if (!cloud?.configured) return;
  try {
    await cloud.signUp(document.getElementById('account-email').value.trim(), document.getElementById('account-password').value);
    setCloudStatus('Account created. Verify the email Google sent you, then sign in.');
    document.getElementById('account-password').value = '';
  } catch (error) { setCloudStatus(error.message, true); }
});
document.getElementById('account-reset').addEventListener('click', async () => {
  const cloud = window.chassisCloud;
  const email = document.getElementById('account-email').value.trim();
  if (!cloud?.configured || !email) { setCloudStatus('Enter your account email first.', true); return; }
  try { await cloud.resetPassword(email); setCloudStatus('If an account exists for that address, password-reset instructions have been sent.'); }
  catch (error) { setCloudStatus(error.message, true); }
});
document.getElementById('account-signout').addEventListener('click', async () => {
  try { await window.chassisCloud.signOut(); setCloudStatus('Signed out · local data remains on this device.'); }
  catch (error) { setCloudStatus(error.message, true); }
});
document.getElementById('enable-device-notifications').addEventListener('click', async event => {
  const button = event.currentTarget;
  button.disabled = true;
  try {
    await window.chassisCloud.enableDeviceNotifications();
    button.textContent = 'Device notifications enabled ✓';
    setCloudStatus('This device can receive due-reminder and buyer-interest alerts.');
  } catch (error) { setCloudStatus(error.message, true); }
  finally { button.disabled = false; }
});
document.getElementById('account-delete').addEventListener('click', async () => {
  const user = window.chassisCloud?.user;
  if (!user?.emailVerified) return;
  const approved = window.confirm(`Permanently delete the Chassis account for ${user.email}, its synced garage, service notes, reminders, device tokens, listing photos and published listings? This cannot be undone.`);
  if (!approved) return;
  try {
    await window.chassisCloud.deleteMyAccount();
    [garageKey, serviceKey, reminderKey].forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('chassis-local-private-owner-uid');
    const db = await listingDbReady;
    await new Promise((resolve, reject) => {
      const transaction = db.transaction('listingDrafts', 'readwrite');
      transaction.objectStore('listingDrafts').clear();
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
    });
    renderGarage(); renderReminders(); renderPrivateList(serviceKey, 'service-list', ['date', 'odometer', 'note']);
    await renderSavedListings(); await refreshMarketplace();
    setCloudStatus('Your Chassis account and synced data were deleted.');
  } catch (error) { setCloudStatus(error.message, true); }
});
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
