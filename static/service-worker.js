const CACHE_NAME = "pwa-cache-v3"; // bumped from v2
const urlsToCache = [
  "/index.html", // explicitly cache index.html
  "/",
  "/static/css/style.css",
  "/static/js/main.js",
  "/static/js/script.js",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") {
    return event.respondWith(fetch(event.request));
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        console.log("Serving from cache:", event.request.url);
        return response;
      }
      console.log("Not in cache, fetching:", event.request.url);
      return fetch(event.request).catch(error => {
        console.error("Fetch failed for:", event.request.url, error);
        // If the request is for the main page, return a fallback page if available.
        if (event.request.url.endsWith("/")) {
          return caches.match("/");
        }
        throw error;
      });
    })
  );
});