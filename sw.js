// Service Worker for Hidaya PWA
const CACHE_NAME = 'hidaya-v1.0.0';
const OFFLINE_URL = 'index.html';

// Resources to cache for offline use
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/prayer.html',
  '/duas.html',
  '/hijri.html',
  '/style.css',
  '/js/script.js',
  '/js/language.js',
  '/js/account.js',
  '/js/prayer.js',
  '/js/duas.js',
  '/js/hijri.js',
  '/js/notifications.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Duas data to cache (simplified - in production, cache actual API responses)
const DYNAMIC_CACHE_URLS = [
  'duas-data',
  'prayer-times'
];

// Install event - cache static resources
globalThis.addEventListener('install', event => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return globalThis.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
globalThis.addEventListener('activate', event => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return globalThis.clients.claim();
    })
  );
});

// Fetch event - serve from cache or network
globalThis.addEventListener('fetch', event => {
  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // Handle API requests for prayer times
  if (event.request.url.includes('/api/prayer-times') ||
      event.request.url.includes('/api/qibla') ||
      event.request.url.includes('/api/geocode') ||
      event.request.url.includes('/api/hijri-date')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(event.request)
          .then(response => {
            // Cache successful responses
            if (response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached version if available
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a successful response
            if (response?.status !== 200 || response?.type !== 'basic') {
              return response;
            }

            // Cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(error => {
            console.log('Fetch failed:', error);
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            // For other requests, return a basic error response
            return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
          });
      })
  );
});

// Background sync for prayer times updates
globalThis.addEventListener('sync', event => {
  if (event.tag === 'prayer-times-update') {
    event.waitUntil(updatePrayerTimesCache());
  }
});

// Update prayer times cache
async function updatePrayerTimesCache() {
  // Attempt to refresh cached prayer times (best-effort)
  console.log('Updating prayer times cache');

  try {
    const cache = await caches.open(CACHE_NAME);
    // Attempt to fetch a generic prayer-times resource; in real usage client would provide location
    const today = new Date().toISOString().slice(0,10);
    const url = `/api/prayer-times/${today}?latitude=0&longitude=0`;

    const response = await fetch(url);
    if (response?.ok) {
      await cache.put(url, response.clone());
      return true;
    }
  } catch (err) {
    console.warn('Failed to update prayer times cache:', err);
  }
  return false;
}

// Push notification event
globalThis.addEventListener('push', event => {
  const data = event.data?.json?.() ?? null;
  if (!data) return;

  const options = {
    body: data.body,
    icon: 'assets/icon-192x192.png',
    badge: 'assets/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: 'assets/icon-72x72.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: 'assets/icon-72x72.png'
      }
    ]
  };

  event.waitUntil(
    globalThis.registration.showNotification(data.title, options)
  );
});

// Notification click event
globalThis.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// Message event for communication with main thread
globalThis.addEventListener('message', event => {
  if (event.origin !== globalThis.location.origin) return;
  if (event.data?.type === 'SKIP_WAITING') {
    globalThis.skipWaiting();
  }
});