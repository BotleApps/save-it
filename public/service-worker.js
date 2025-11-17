const CACHE_NAME = 'save-it-v2';
const RUNTIME_CACHE = 'save-it-runtime-v2';
const IMAGE_CACHE = 'save-it-images-v2';
const OFFLINE_PAGE = '/offline.html';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/favicon.ico',
  '/icon-180.png',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json',
];

// Maximum cache sizes
const MAX_RUNTIME_CACHE_SIZE = 100;
const MAX_IMAGE_CACHE_SIZE = 50;

// Utility: Trim cache to max size
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    const deletePromises = keys
      .slice(0, keys.length - maxItems)
      .map((key) => cache.delete(key));
    await Promise.all(deletePromises);
    console.log(`[SW] Trimmed ${cacheName} to ${maxItems} items`);
  }
}

// Utility: Check if response is valid
function isValidResponse(response) {
  return response && response.status === 200 && response.type !== 'error';
}

// Install event - precache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.error('[SW] Precache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    (async () => {
      // Delete old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
      
      // Trim caches to max size
      await trimCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
      await trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
      
      console.log('[SW] Caches cleaned and trimmed');
    })()
  );
  
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle external images
  if (request.destination === 'image' && url.origin !== location.origin) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          if (isValidResponse(response)) {
            const cache = await caches.open(IMAGE_CACHE);
            cache.put(request, response.clone());
            await trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
          }
          return response;
        } catch (error) {
          console.log('[SW] External image fetch failed:', url.href);
          // Return placeholder or cached version
          return new Response('', { status: 404, statusText: 'Not Found' });
        }
      })()
    );
    return;
  }

  // Skip other cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network-first strategy for API calls (with cache fallback)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          if (isValidResponse(response)) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          console.log('[SW] API fetch failed, serving from cache:', url.pathname);
          const cached = await caches.match(request);
          if (cached) return cached;
          throw error;
        }
      })()
    );
    return;
  }

  // Cache-first strategy for app shell and assets
  event.respondWith(
    (async () => {
      // Check cache first
      const cached = await caches.match(request);
      if (cached) {
        // Fetch in background to update cache
        fetch(request)
          .then((response) => {
            if (isValidResponse(response)) {
              caches.open(RUNTIME_CACHE).then((cache) => {
                cache.put(request, response);
              });
            }
          })
          .catch(() => {});
        return cached;
      }

      // Not in cache, fetch from network
      try {
        const response = await fetch(request);
        
        if (!isValidResponse(response)) {
          return response;
        }

        // Cache the response
        const cache = await caches.open(RUNTIME_CACHE);
        cache.put(request, response.clone());
        await trimCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);

        return response;
      } catch (error) {
        console.error('[SW] Fetch failed:', error);
        
        // For navigation requests, show offline page
        if (request.mode === 'navigate') {
          const offlinePage = await caches.match(OFFLINE_PAGE);
          if (offlinePage) return offlinePage;
          
          // Fallback to cached index
          const cachedIndex = await caches.match('/');
          if (cachedIndex) return cachedIndex;
        }
        
        throw error;
      }
    })()
  );
});

// Background sync - sync data when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);
  if (event.tag === 'sync-links') {
    event.waitUntil(
      (async () => {
        try {
          // Notify clients that sync is happening
          const clients = await self.clients.matchAll();
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_START',
              tag: event.tag,
            });
          });
          
          console.log('[SW] Sync completed successfully');
          
          // Notify clients that sync completed
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              tag: event.tag,
            });
          });
        } catch (error) {
          console.error('[SW] Sync failed:', error);
        }
      })()
    );
  }
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
