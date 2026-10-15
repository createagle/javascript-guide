export const name = 'money-simple.js (toFixed)';

const SYMBOLS = { USD: '$', EUR: '€', JPY: '¥', CNY: '¥' };

export function formatMoney(amount, currency) {
  return `${SYMBOLS[currency] ?? `${currency} `}${amount.toFixed(2)}`;
}
