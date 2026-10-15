// Storage: a small promise wrapper around IndexedDB, and an in-memory stand-in with the same methods.

const DB_NAME = 'pocket-ledger';
const VERSION = 1;
const STORE = 'entries';

/** Turns an IDBRequest into a promise. */
function request(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Resolves when a transaction has been committed, rejects if it fails or is aborted. */
function done(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error ?? new DOMException('Transaction aborted', 'AbortError'));
  });
}

export async function openStorage() {
  const open = indexedDB.open(DB_NAME, VERSION);
  open.onupgradeneeded = () => {
    // Runs the first time, and whenever VERSION goes up: create or migrate the stores here
    const store = open.result.createObjectStore(STORE, { keyPath: 'id' });
    store.createIndex('date', 'date');
  };
  const db = await request(open);
  // Another tab opened a newer version: step aside so its upgrade can run
  db.onversionchange = () => db.close();

  // Runs fn in one transaction and waits until the transaction is committed
  async function run(mode, fn) {
    const tx = db.transaction(STORE, mode);
    const result = fn(tx.objectStore(STORE));
    await done(tx);
    return result;
  }

  return {
    getAll: () => run('readonly', (store) => request(store.getAll())),
    put: (entry) => run('readwrite', (store) => void store.put(entry)),
    delete: (id) => run('readwrite', (store) => void store.delete(id)),
    putAll: (entries) => run('readwrite', (store) => entries.forEach((entry) => store.put(entry))),
    clear: () => run('readwrite', (store) => void store.clear()),
  };
}

/** Used when IndexedDB is not available (some private browsing modes): works, but forgets on reload. */
export function memoryStorage() {
  const items = new Map();
  return {
    getAll: async () => [...items.values()],
    put: async (entry) => void items.set(entry.id, entry),
    delete: async (id) => void items.delete(id),
    putAll: async (entries) => entries.forEach((entry) => items.set(entry.id, entry)),
    clear: async () => items.clear(),
  };
}
