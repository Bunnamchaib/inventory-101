const STATIC_CACHE = "chem-static-v3";
const APP_SHELL_FILES = [
  "./",
  "./index.html",
  "./javascript.html",
  "./stylesheet.html",
  "./manifest.webmanifest",
  "./app-icon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(function (cache) {
      return cache.addAll(APP_SHELL_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.map(function (key) {
          if (key !== STATIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(request).then(function (response) {
        const responseClone = response.clone();
        caches.open(STATIC_CACHE).then(function (cache) {
          cache.put(request, responseClone);
        });
        return response;
      }).catch(function () {
        return caches.match(request);
      })
    );
  }
});
