// Change this version identifier string (e.g., 'v1.1', 'v1.2') every time you modify your app files!
const CACHE_NAME = 'upces-static-v1.1'; 

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './server.html',
  './manifest.json'
];

// Installs assets into the storage cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Clears out any older, outdated file caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Forces immediate control of all open windows
  );
});

// Network-first strategy for critical app assets, falling back to cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      // If network works, duplicate the live response into our local cache
      if(response && response.status === 200 && event.request.method === 'GET') {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // If network fails (offline), pull files directly out of local storage cache
      return caches.match(event.request);
    })
  );
});

// Listens for the force-update signal broadcast from index.html
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
