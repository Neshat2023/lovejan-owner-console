// Minimal service worker: enables installability without caching anything,
// so deploys are always picked up immediately.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
