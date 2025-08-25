/**
 * Service Worker: Zero visual impact caching strategies
 * - HTML: Network First (fresh content)
 * - CSS/JS: Stale-While-Revalidate (fast + fresh)
 * - Images/Fonts: Cache First with expiration
 */
const VERSION = "v1";
const CORE_CACHE = `core-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// Limit for runtime cache entries (soft LRU)
const MAX_RUNTIME_ENTRIES = 120;

async function trimCache(cacheName, maxEntries) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxEntries) {
      // delete oldest first
      const toDelete = keys.slice(0, keys.length - maxEntries);
      await Promise.all(toDelete.map((req) => cache.delete(req)));
    }
  } catch (e) {
    // no-op
  }
}

// Core files to cache on install
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/services.html",
  "/gallery.html",
  "/contact.html",
  "/css/style.css",
  "/css/responsive.css",
  "/js/main.js",
  "/js/resource-prioritizer.js",
  "/js/image-optimizer.js",
  "/js/boost-performance.js",
  "/images/Updated.png",
  "/videos/test.mp4",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CORE_CACHE)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        if (self.registration.navigationPreload) {
          await self.registration.navigationPreload.enable();
        }
      } catch (e) {}

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![CORE_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

function fromNetwork(request, timeout) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(reject, timeout);

    // Use navigation preload response when available for navigations
    async function respondWithPreload(event) {
      try {
        const preload = await event.preloadResponse;
        if (preload) return preload;
      } catch (_) {}
      return null;
    }

    fetch(request).then((response) => {
      clearTimeout(timeoutId);
      resolve(response);
    }, reject);
  });
}

self.addEventListener("fetch", (event) => {
  // Short-circuit non-GET requests
  if (event.request.method !== "GET") return;
  const req = event.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if (url.origin !== location.origin) return;

  // Network First for documents (HTML)
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      (async () => {
        // Try navigation preload first
        const preload = await (event.preloadResponse || Promise.resolve(null));
        if (preload) {
          const copy = preload.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
          return preload;
        }
        // Fallback to network first with timeout
        try {
          const res = await fromNetwork(req, 3000);
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, copy));
          return res;
        } catch (_) {
          const cacheRes = await caches.match(req);
          return cacheRes || caches.match("/index.html");
        }
      })()
    );
    return;
  }

  // Stale-While-Revalidate for CSS/JS
  if (["style", "script"].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((networkRes) => {
            caches
              .open(RUNTIME_CACHE)
              .then((cache) => cache.put(req, networkRes.clone()))
              .then(() => trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES));
            return networkRes;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Cache First with basic soft-expiration for images/fonts
  if (["image", "font"].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) {
          // Revalidate in background
          fetch(req)
            .then((networkRes) => {
              caches
                .open(RUNTIME_CACHE)
                .then((cache) => cache.put(req, networkRes.clone()));
            })
            .catch(() => {});
          return cached;
        }
        return fetch(req).then((networkRes) => {
          caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(req, networkRes.clone()))
            .then(() => trimCache(RUNTIME_CACHE, MAX_RUNTIME_ENTRIES));
          return networkRes;
        });
      })
    );
    return;
  }

  // Default: Try cache, then network
  event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
