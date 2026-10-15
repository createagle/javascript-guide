// Service worker: keeps a copy of the app so it opens without a network.
// Change VERSION whenever a cached file changes, so visitors get the new files.
const VERSION = 'v1';
const CACHE = `pocket-ledger-${VERSION}`;

// The app shell: everything needed to start the app (paths are relative to this file)
const SHELL = [
  './',
  './index.html',
  './app.css',
  './manifest.webmanifest',
  './icon.svg',
  './data/rates.json',
  './src/main.js',
  './src/db.js',
  './src/ledger.js',
  './src/money.js',
  './src/rates.js',
  './src/components/entry-form.js',
  './src/components/entry-list.js',
  './src/components/ledger-summary.js',
  '../../../assets/demo.js',
  '../../../assets/style.css',
];

self.addEventListener('install', (event) => {
  // The new version is installed only if every file could be cached
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Delete the caches of older versions
    for (const key of await caches.keys()) {
      if (key.startsWith('pocket-ledger-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();   // control pages that are already open
  })());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin) return;   // let the browser handle it
  if (url.pathname.endsWith('/data/rates.json')) {
    event.respondWith(staleWhileRevalidate(event));
  } else {
    event.respondWith(cacheFirst(request));
  }
});

// The app shell: answer from the cache, go to the network only for files we do not have
async function cacheFirst(request) {
  const cached = await caches.match(request, { ignoreSearch: request.mode === 'navigate' });
  if (cached) return cached;
  try {
    return await fetch(request);
  } catch (error) {
    if (request.mode === 'navigate') return caches.match('./index.html');
    throw error;
  }
}

// Rates: answer at once from the cache, and refresh the cache in the background for next time
async function staleWhileRevalidate(event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request);
  const fresh = fetch(event.request).then((response) => {
    if (response.ok) cache.put(event.request, response.clone());
    return response;
  });
  if (!cached) return fresh;
  event.waitUntil(fresh.catch(() => {}));   // offline: keep using the cached copy
  return cached;
}
