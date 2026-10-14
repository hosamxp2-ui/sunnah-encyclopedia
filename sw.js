const CACHE_NAME = 'sunnah-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/dark-mode.css',
  '/js/app.js',
  '/js/data.js',
  '/js/ui.js',
  '/manifest.json'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية التخزين (Network First, Fallback to Cache)
self.addEventListener('fetch', event => {
  // تخطي غير GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // تخزين الاستجابة الجديدة
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // إذا فشل الشبكة، استخدم الكاش
        return caches.match(event.request)
          .then(response => response || new Response('أنت غير متصل بالإنترنت'));
      })
  );
});
