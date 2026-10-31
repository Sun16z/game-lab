import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, relative } from "node:path";

const game = process.argv[2];
if (!/^[a-z0-9-]+$/.test(game ?? "")) throw new Error("Expected game slug");
const dist = resolve("dist");
function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? filesIn(path) : [path];
  });
}
// Apply the shared preference before paint in every standalone game. Inject before
// hashing so the service worker precaches the exact HTML that was built.
const themeDir = resolve(import.meta.dirname, "../packages/game-theme");
const htmlPath = resolve(dist, "index.html");
const themeScript = readFileSync(resolve(themeDir, "theme.js"), "utf8");
const themeStyle = readFileSync(resolve(themeDir, "game.css"), "utf8");
const html = readFileSync(htmlPath, "utf8");
if (!html.includes("</head>")) throw new Error("Game HTML must contain </head>");
writeFileSync(htmlPath, html.replace(/<html(?=[\s>])/i, `<html data-game="${game}"`).replace("</head>", `<script>${themeScript}</script><style>${themeStyle}</style></head>`));

const files = filesIn(dist).filter((path) => !path.endsWith("/sw.js"));
// Audio enters the runtime cache after first playback, keeping install light.
const urls = ["./", ...files.map((path) => `./${relative(dist, path).replaceAll("\\", "/")}`).filter((url) => !url.startsWith("./audio/"))];
const hash = createHash("sha256");
for (const file of files) hash.update(readFileSync(file));
const cacheName = `${game}-${hash.digest("hex").slice(0, 12)}`;
writeFileSync(resolve(dist, "sw.js"), `const CACHE = ${JSON.stringify(cacheName)};
const FILES = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(${JSON.stringify(`${game}-`)}) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (!event.request.url.startsWith(self.registration.scope)) return;
  // Refresh the document on every online visit. A cached old HTML document must
  // not hide a new cast/layout release until the player refreshes twice.
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      if (response.status === 200) { const copy = response.clone(); event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy))); }
      return response;
    }).catch(async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(event.request)) || (await cache.match(self.registration.scope)) || Response.error();
    }));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.status === 200) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return response;
  })));
});
`);
