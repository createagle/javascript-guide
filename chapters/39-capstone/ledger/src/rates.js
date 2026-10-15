// Exchange rates: fetched from the server, remembered for next time, never required.

const KEY = 'pocket-ledger:rates';
const NO_RATES = { base: 'USD', date: null, rates: { USD: 1 } };

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;   // storage blocked, or the saved value is broken
  }
}

/** @returns {Promise<{ base: string, date: string | null, rates: Record<string, number>, source: string }>} */
export async function loadRates(url = './data/rates.json') {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (typeof data?.rates?.USD !== 'number') throw new TypeError('Unexpected rates file');
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      // Not being able to remember the rates is fine
    }
    return { ...data, source: 'fetched' };
  } catch {
    const saved = readSaved();
    return saved ? { ...saved, source: 'saved' } : { ...NO_RATES, source: 'none' };
  }
}
