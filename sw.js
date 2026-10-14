const CACHE = "sunnah-library-v1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./data/index.json",
  "./data/books/demo.json"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok && event.request.mode === "navigate") {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put("./index.html", copy));
      }
      return response;
    }).catch(() =>
      caches.match(event.request).then(response =>
        response || caches.match("./index.html")
      )
    )
  );
});
