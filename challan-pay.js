(() => {
  const form = document.getElementById('challan-pay-form');
  const amountInput = document.getElementById('challan-amount');
  const result = document.getElementById('challan-pay-result');
  const lookupForm = document.getElementById('challan-lookup-form');
  const challanReference = document.getElementById('challan-reference');
  const vehicleRegistration = document.getElementById('challan-vehicle');
  const lookupStatus = document.getElementById('challan-lookup-status');
  const officialLink = document.getElementById('challan-official-link');
  if (!form || !amountInput || !result) return;

  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  function addRow(label, value, total = false) {
    const row = document.createElement('div');
    row.className = `challan-pay-result-row${total ? ' is-total' : ''}`;
    const name = document.createElement('span');
    name.textContent = label;
    const amount = document.createElement('strong');
    amount.textContent = value;
    row.append(name, amount);
    result.append(row);
  }

  if (lookupForm && challanReference && vehicleRegistration && lookupStatus && officialLink) {
    lookupForm.addEventListener('submit', event => {
      event.preventDefault();
      if (!challanReference.value.trim() || !vehicleRegistration.value.trim()) {
        lookupStatus.textContent = 'Enter both details, then continue to the official portal. Autonexus will not submit them.';
        (!challanReference.value.trim() ? challanReference : vehicleRegistration).focus();
        return;
      }
      lookupStatus.textContent = 'Opening the official portal. Your details remain in this tab and were not sent; enter them again there to check the challan and pay if one is due.';
      officialLink.click();
    });
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const challanAmount = Number(amountInput.value);
    if (!Number.isFinite(challanAmount) || challanAmount <= 0 || challanAmount > 10000000) {
      result.replaceChildren();
      const message = document.createElement('span');
      message.textContent = 'Enter an amount from ₹1 to ₹1,00,00,000.';
      result.append(message);
      amountInput.focus();
      return;
    }
    const fee = Math.round(challanAmount * 0.01 * 100) / 100;
    result.replaceChildren();
    addRow('Amount entered', money.format(challanAmount));
    addRow('Illustrative convenience fee (₹10 per ₹1,000)', money.format(fee));
    addRow('Illustrative total (not charged here)', money.format(challanAmount + fee), true);
  });
})();
