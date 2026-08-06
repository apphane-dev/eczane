/* Hand-written service worker for Nöbetçi Eczaneler.
 *
 * Strategy:
 *  - App shell (icons, manifest, favicon) is precached on install.
 *  - HTML navigations and JSON data: network-first, so online users always get
 *    the freshest on-duty pharmacy data; fall back to cache when offline.
 *  - Static assets under /_astro/ (hashed CSS/JS): stale-while-revalidate.
 *  - Map tiles / styles (openfreemap, maplibre demotiles) are NOT cached —
 *    they go straight to the network.
 */

const VERSION = "v2";
const SHELL_CACHE = `eczane-shell-${VERSION}`;
const RUNTIME_CACHE = `eczane-runtime-${VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/antalya",
  "/en/antalya",
  "/ru/antalya",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon.svg",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isMapRequest(url) {
  return (
    url.hostname.includes("openfreemap.org") ||
    url.hostname.includes("maplibre.org") ||
    url.hostname.includes("openstreetmap.org")
  );
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Let map tiles/styles go straight to the network — never intercept.
  if (isMapRequest(url)) return;

  // Cross-origin (e.g. CDNs): don't interfere.
  if (url.origin !== self.location.origin) return;

  // HTML navigations and JSON data: network-first for fresh duty data.
  if (
    request.mode === "navigate" ||
    request.destination === "document" ||
    url.pathname.endsWith(".json")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Hashed build assets: stale-while-revalidate.
  if (url.pathname.startsWith("/_astro/")) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
});
