import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const budget = JSON.parse(readFileSync(resolve("config/game-js-budget.json"), "utf8"));
const gamesRoot = resolve("games");
const outputRoot = resolve("apps/portal/out/play");

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const filename = join(directory, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  });
}

const expected = readdirSync(gamesRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(gamesRoot, entry.name, "package.json")))
  .filter((entry) => Boolean(JSON.parse(readFileSync(join(gamesRoot, entry.name, "package.json"), "utf8")).scripts?.build))
  .map((entry) => entry.name);

let failed = false;
for (const slug of expected) {
  const gameOutput = join(outputRoot, slug);
  if (!existsSync(join(gameOutput, "index.html"))) {
    console.error(`${slug}: built game is missing from the portal output`);
    failed = true;
    continue;
  }
  const javascript = filesIn(gameOutput).filter((filename) => /\.(?:m?js)$/.test(filename) && !filename.endsWith("/sw.js"));
  if (javascript.length === 0) {
    console.error(`${slug}: no game JavaScript found`);
    failed = true;
    continue;
  }
  const gzipBytes = javascript.reduce((total, filename) => total + gzipSync(readFileSync(filename), { level: 9 }).length, 0);
  const allowance = budget.exceptions[slug]?.maxGzipBytes ?? budget.defaultGzipBytes;
  const status = gzipBytes <= allowance ? "OK" : "OVER BUDGET";
  console.log(`${slug}: ${gzipBytes} / ${allowance} gzip bytes (${status})`);
  if (gzipBytes > allowance) failed = true;
}
for (const slug of Object.keys(budget.exceptions)) {
  if (!expected.includes(slug)) {
    console.error(`${slug}: stale JavaScript budget exception`);
    failed = true;
  }
}
if (failed) process.exitCode = 1;
