// Pure functions for money and entries: no DOM, no storage, so they are easy to test (see test/money.test.js).
// Amounts are always whole cents (integers), never floating point dollars.

export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Housing', 'Shopping', 'Fun', 'Health', 'Other'];
export const INCOME_CATEGORIES = ['Salary', 'Bonus', 'Gift', 'Other'];

/**
 * '12.5' → 1250. Returns null for anything that is not a positive amount with at most 2 decimals.
 * @param {string} text
 * @returns {number | null}
 */
export function parseAmount(text) {
  const match = /^\s*(\d{1,9})(?:[.,](\d{1,2}))?\s*$/.exec(text);
  if (!match) return null;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  return cents > 0 ? cents : null;
}

/** '2026-10-15' → '2026-10' */
export const monthOf = (date) => date.slice(0, 7);

/** Today as 'YYYY-MM-DD' in local time (toISOString would give the UTC date). */
export function today(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Income, expense, balance and spending per category (largest first).
 * @param {Array<{ type: string, amount: number, category: string }>} entries
 */
export function summarize(entries) {
  let income = 0;
  let expense = 0;
  const byCategory = new Map();
  for (const { type, amount, category } of entries) {
    if (type === 'income') {
      income += amount;
    } else {
      expense += amount;
      byCategory.set(category, (byCategory.get(category) ?? 0) + amount);
    }
  }
  return { income, expense, balance: income - expense, byCategory: [...byCategory].sort((a, b) => b[1] - a[1]) };
}

/** Newest date first; on the same day, the entry added last comes first. */
export const sortNewestFirst = (entries) =>
  entries.toSorted((a, b) => b.date.localeCompare(a.date) || b.created - a.created);

/**
 * A function that formats cents (stored in US dollars) in another currency.
 * @param {string} currency  e.g. 'EUR'
 * @param {number} rate      how many units of currency one US dollar buys
 */
export function moneyFormatter(currency, rate = 1, locale = undefined) {
  const format = new Intl.NumberFormat(locale, { style: 'currency', currency });
  return (cents) => format.format((cents * rate) / 100);
}

const DATE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

/**
 * Checks data from outside (an imported file) and returns a clean entry, or throws a TypeError.
 * @param {unknown} value
 */
export function validateEntry(value) {
  if (typeof value !== 'object' || value === null) throw new TypeError('An entry must be an object');
  const { id, type, amount, category, note = '', date, created = 0 } = /** @type {Record<string, any>} */ (value);
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (typeof id !== 'string' || id === '') throw new TypeError('Missing id');
  if (type !== 'income' && type !== 'expense') throw new TypeError(`Unknown type: ${type}`);
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new TypeError(`Bad amount: ${amount}`);
  if (!categories.includes(category)) throw new TypeError(`Unknown category: ${category}`);
  if (typeof date !== 'string' || !DATE.test(date)) throw new TypeError(`Bad date: ${date}`);
  return { id, type, amount, category, note: String(note).slice(0, 200), date, created: Number(created) || 0 };
}

/** A month of made-up entries, for trying the app out. */
export function sampleEntries(month, makeId) {
  const rows = [
    ['01', 'income', 320000, 'Salary', 'October salary'],
    ['02', 'expense', 95000, 'Housing', 'Rent'],
    ['03', 'expense', 4250, 'Food', 'Groceries'],
    ['05', 'expense', 1280, 'Transport', 'Bus pass top-up'],
    ['08', 'expense', 6400, 'Fun', 'Concert tickets'],
    ['10', 'expense', 3875, 'Food', 'Dinner with friends'],
    ['12', 'expense', 2999, 'Shopping', 'Running shoes (sale)'],
    ['14', 'expense', 1850, 'Health', 'Pharmacy'],
    ['15', 'income', 15000, 'Gift', 'Birthday present'],
  ];
  return rows.map(([day, type, amount, category, note], i) => ({
    id: makeId(),
    type,
    amount,
    category,
    note,
    date: `${month}-${day}`,
    created: i,
  }));
}
