export const name = 'money-intl.js (Intl.NumberFormat)';

export function formatMoney(amount, currency, locale) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}
