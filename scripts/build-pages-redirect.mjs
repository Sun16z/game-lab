import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";

const source = resolve("apps/portal/out");
const output = resolve("apps/portal/redirect-out");
const site = "https://games.somewhen.life";
if (!existsSync(join(source, "index.html"))) throw new Error("Build the portal before creating Pages redirects");
rmSync(output, { recursive: true, force: true });

function slugs(directory) {
  const root = join(source, directory);
  return readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^[a-z0-9-]+$/.test(entry.name) && existsSync(join(root, entry.name, "index.html")))
    .map((entry) => entry.name);
}

function save(route, body) {
  const filename = join(output, route);
  mkdirSync(resolve(filename, ".."), { recursive: true });
  writeFileSync(filename, body);
}

function redirectPage(route) {
  const fallback = site + route;
  return `<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><link rel="canonical" href="${fallback}">
<script>
  const route = location.pathname.replace(/^\\/game-lab(?=\\/|$)/, "") || "/";
  location.replace("${site}" + route + location.search + location.hash);
</script>
<meta http-equiv="refresh" content="0;url=${fallback}"><title>Game Lab已搬家</title></head>
<body><p>Game Lab已搬到<a href="${fallback}">games.somewhen.life</a>。網址已搬家，紀錄需要重新開始。</p></body></html>\n`;
}

function retiringServiceWorker(game) {
  return `self.addEventListener("install", event => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith(${JSON.stringify(`${game}-`)})).map(key => caches.delete(key)));
  await self.registration.unregister();
  const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
  await Promise.all(windows.map(async client => {
    const url = new URL(client.url);
    if (!url.pathname.startsWith(self.registration.scope.replace(self.location.origin, ""))) return;
    const route = url.pathname.replace(/^\\/game-lab(?=\\/|$)/, "") || "/";
    try { await client.navigate(${JSON.stringify(site)} + route + url.search + url.hash); } catch {}
  }));
})()));
`;
}

save("index.html", redirectPage("/"));
save("404.html", redirectPage("/"));
save(".nojekyll", "");
for (const game of slugs("games")) save(`games/${game}/index.html`, redirectPage(`/games/${game}/`));
for (const game of slugs("play")) {
  save(`play/${game}/index.html`, redirectPage(`/play/${game}/`));
  save(`play/${game}/sw.js`, retiringServiceWorker(game));
}
console.log(`GitHub Pages redirects ready: ${slugs("games").length} game pages, ${slugs("play").length} playable games`);
