import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAmount, summarize, sortNewestFirst, moneyFormatter, validateEntry, today } from '../src/money.js';

test('parseAmount turns text into whole cents', () => {
  assert.equal(parseAmount('12'), 1200);
  assert.equal(parseAmount('12.5'), 1250);
  assert.equal(parseAmount(' 0,99 '), 99);
  for (const bad of ['', 'abc', '-5', '0', '1.999', '1e3']) assert.equal(parseAmount(bad), null, bad);
});

test('summarize adds up cents exactly', () => {
  const entries = [
    { type: 'expense', amount: 10, category: 'Food' },
    { type: 'expense', amount: 20, category: 'Fun' },
    { type: 'expense', amount: 15, category: 'Food' },
    { type: 'income', amount: 100, category: 'Salary' },
  ];
  assert.deepEqual(summarize(entries), {
    income: 100,
    expense: 45,
    balance: 55,
    byCategory: [['Food', 25], ['Fun', 20]],
  });
});

test('sortNewestFirst does not change the original list', () => {
  const entries = [
    { date: '2026-10-01', created: 1 },
    { date: '2026-10-03', created: 2 },
    { date: '2026-10-01', created: 3 },
  ];
  assert.deepEqual(sortNewestFirst(entries).map((e) => e.created), [2, 3, 1]);
  assert.equal(entries[0].created, 1);
});

test('moneyFormatter converts and formats', () => {
  assert.equal(moneyFormatter('USD', 1, 'en-US')(123456), '$1,234.56');
  assert.equal(moneyFormatter('JPY', 150, 'en-US')(1000), '¥1,500');
});

test('validateEntry rejects bad data from files', () => {
  const good = { id: 'a', type: 'expense', amount: 500, category: 'Food', date: '2026-10-15' };
  assert.equal(validateEntry(good).note, '');
  assert.throws(() => validateEntry({ ...good, amount: 4.5 }), TypeError);
  assert.throws(() => validateEntry({ ...good, category: 'Salary' }), TypeError);
  assert.throws(() => validateEntry({ ...good, date: '2026-13-01' }), TypeError);
  assert.throws(() => validateEntry(null), TypeError);
});

test('today uses the local date', () => {
  assert.equal(today(new Date(2026, 0, 5, 23, 30)), '2026-01-05');
});
