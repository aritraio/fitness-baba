const CACHE_NAME = 'fitnessbaba-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/icon.svg',
  '/manifest.json',
  '/js/state.js',
  '/js/calc.js',
  '/js/api.js',
  '/js/ui.js',
  '/js/db.js',
  '/js/camera.js',
  '/js/onboarding.js',
  '/js/dashboard.js',
  '/js/overview.js',
  '/js/timeline.js',
  '/js/meals.js',
  '/js/exercise.js',
  '/js/bodyscan.js',
  '/js/skincare.js',
  '/js/alerts.js',
  '/js/cheat.js',
  '/js/coach.js',
  '/js/progress.js',
  '/js/auth.js',
  '/js/main.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  
  const url = new URL(e.request.url);
  // Only cache same-origin assets
  if (url.origin !== self.location.origin) return;

  // Skip Clerk auth or Supabase endpoint caching
  if (url.pathname.startsWith('/api/') || url.hostname.includes('clerk')) return;

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(e.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Return index.html as fallback for SPA routing if offline
        return caches.match('/index.html');
      });
    })
  );
});
