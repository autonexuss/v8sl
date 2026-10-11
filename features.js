const inr = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.max(0, value));
window.chassisBindPlanner?.('emi');
window.chassisBindPlanner?.('mileage');
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
  const model = document.getElementById('listing-model').value.trim();
  const year = Number(document.getElementById('listing-year').value);
  const km = Number(document.getElementById('listing-km').value);
  const price = Number(document.getElementById('listing-price').value);
  if (!model || year < 1990 || year > new Date().getFullYear() || km < 0 || price <= 0) return;
  const draft = [
    `${year} ${model}`,
    `Asking price: ${inr(price)}`,
    `Odometer: ${new Intl.NumberFormat('en-IN').format(km)} km`,
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

