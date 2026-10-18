(() => {
  const form = document.getElementById('challan-pay-form');
  const amountInput = document.getElementById('challan-amount');
  const result = document.getElementById('challan-pay-result');
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
    addRow('Challan amount entered', money.format(challanAmount));
    addRow('Illustrative fee (1%)', money.format(fee));
    addRow('Example total if that fee applied', money.format(challanAmount + fee), true);
  });
})();
