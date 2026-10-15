// Wires the pieces together: storage → Ledger (state) → components (view), and events back the other way.
import { openStorage, memoryStorage } from './db.js';
import { Ledger } from './ledger.js';
import { loadRates } from './rates.js';
import { monthOf, moneyFormatter, sampleEntries, sortNewestFirst, summarize, today, validateEntry } from './money.js';
import './components/entry-form.js';
import './components/entry-list.js';
import './components/ledger-summary.js';

const $ = (id) => document.getElementById(id);
const view = { month: monthOf(today()), currency: 'USD', rates: { USD: 1 } };

function say(text) {
  $('message').textContent = text;
}

// ---- Storage: IndexedDB if we can, memory if we must ----
let storage;
try {
  storage = await openStorage();
} catch {
  storage = memoryStorage();
  say('This browser blocks IndexedDB here, so entries will be lost when you reload.');
}
const ledger = new Ledger(storage);

// ---- Render: one function turns the current state into what is on screen ----
function render() {
  const format = moneyFormatter(view.currency, view.rates[view.currency] ?? 1);
  const entries = ledger.entries.filter((entry) => monthOf(entry.date) === view.month);
  $('summary').format = format;
  $('summary').summary = summarize(entries);
  $('list').format = format;
  $('list').entries = sortNewestFirst(entries);
}
ledger.addEventListener('change', render);

// ---- Events from the components ----
document.addEventListener('entry-submit', async (event) => {
  try {
    const entry = await ledger.add(event.detail);
    view.month = $('month').value = monthOf(entry.date);   // show the month of the new entry
    render();
    say(`Added ${entry.category}.`);
  } catch (error) {
    say(`Could not save: ${error.message}`);
  }
});
document.addEventListener('entry-delete', async (event) => {
  try {
    await ledger.remove(event.detail.id);
    say('Entry deleted.');
  } catch (error) {
    say(`Could not delete: ${error.message}`);
  }
});

$('month').addEventListener('change', () => {
  view.month = $('month').value || monthOf(today());
  render();
});
$('currency').addEventListener('change', () => {
  view.currency = $('currency').value;
  render();
});

// ---- Tools: sample data, export, import, clear ----
$('tools').addEventListener('click', async (event) => {
  const action = event.target.closest('button')?.dataset.action;
  try {
    if (action === 'sample') {
      await ledger.merge(sampleEntries(view.month, Ledger.makeId));
      say('Added sample entries for this month.');
    } else if (action === 'export') {
      exportFile();
    } else if (action === 'clear') {
      const button = event.target.closest('button');
      if (button.dataset.armed) {
        await ledger.clear();
        say('All entries deleted.');
        disarm(button);
      } else {
        // Ask twice instead of using confirm(), which blocks the page
        button.dataset.armed = 'true';
        button.textContent = 'Click again to delete everything';
        setTimeout(() => disarm(button), 4000);
      }
    }
  } catch (error) {
    say(error.message);
  }
});

function disarm(button) {
  delete button.dataset.armed;
  button.textContent = 'Clear all';
}

function exportFile() {
  const blob = new Blob([JSON.stringify(ledger.entries, null, 2)], { type: 'application/json' });
  const link = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `pocket-ledger-${today()}.json`,
  });
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  say(`Exported ${ledger.entries.length} entries.`);
}

$('import').addEventListener('change', async () => {
  const [file] = $('import').files;
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data)) throw new TypeError('The file should contain a list of entries');
    const entries = data.map(validateEntry);   // never trust a file: check every entry
    await ledger.merge(entries);
    say(`Imported ${entries.length} entries.`);
  } catch (error) {
    say(`Import failed: ${error.message}`);
  } finally {
    $('import').value = '';
  }
});

// ---- Online status and the service worker ----
function showStatus() {
  const offline = !navigator.onLine;
  $('status').textContent = offline ? 'Offline · saved on this device' : $('status').dataset.ready ? 'Online · works offline' : 'Online';
  $('status').classList.toggle('offline', offline);
}
addEventListener('online', showStatus);
addEventListener('offline', showStatus);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(
    () => navigator.serviceWorker.ready.then(() => {
      $('status').dataset.ready = 'true';
      showStatus();
    }),
    // For example inside a third-party iframe, or a browser with storage blocked
    () => say('Offline mode is not available here. Open the app in its own tab to install it.'),
  );
}

// ---- Start ----
$('month').value = view.month;
showStatus();
render();
await ledger.load();

const rates = await loadRates();
view.rates = rates.rates;
$('currency').replaceChildren(...Object.keys(rates.rates).map((code) => new Option(code, code)));
$('currency').value = view.currency;
$('currency').title = rates.date ? `Sample exchange rates of ${rates.date}` : 'No exchange rates available';
render();
