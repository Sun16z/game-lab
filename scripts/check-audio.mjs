import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, relative, extname, join } from "node:path";

const root = resolve(import.meta.dirname, "..");
const catalog = JSON.parse(readFileSync(resolve(root, "knowledge/audio/credits.json"), "utf8"));
const audioExtensions = new Set([".webm", ".mp3", ".ogg", ".wav", ".m4a"]);
const seen = new Set();
const failures = [];
const voiceSizes = new Map();

function walk(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const files = [
  ...readdirSync(resolve(root, "games"), { withFileTypes: true }).filter((entry) => entry.isDirectory()).flatMap((entry) => walk(resolve(root, "games", entry.name, "public"))),
  ...walk(resolve(root, "apps/portal/public")).filter((path) => !path.includes("/public/play/"))
].filter((path) => audioExtensions.has(extname(path).toLowerCase())).map((path) => relative(root, path).replaceAll("\\", "/"));
const fileSet = new Set(files);
for (const credit of catalog.files ?? []) {
  if (!credit.file || seen.has(credit.file)) { failures.push(`Duplicate or missing credit path: ${credit.file}`); continue; }
  seen.add(credit.file);
  if (!fileSet.has(credit.file)) failures.push(`Credited file does not exist under public/: ${credit.file}`);
  if (!credit.sourceUrl || !credit.author || !credit.license || !/^\d{4}-\d{2}-\d{2}$/.test(credit.obtainedAt ?? "") || typeof credit.modified !== "boolean") {
    failures.push(`Incomplete credit: ${credit.file}`);
  }
  if (fileSet.has(credit.file)) {
    const size = statSync(resolve(root, credit.file)).size;
    if (credit.kind === "music" && size > 600_000) failures.push(`Music exceeds 600KB: ${credit.file}`);
    if (credit.kind === "voice") {
      if (!credit.locale || !credit.game) failures.push(`Voice needs locale/game: ${credit.file}`);
      const key = `${credit.game}:${credit.locale}`;
      voiceSizes.set(key, (voiceSizes.get(key) ?? 0) + size);
    }
  }
}
for (const file of files) if (!seen.has(file)) failures.push(`Uncredited public audio: ${file}`);
for (const [key, size] of voiceSizes) if (size > 300_000) failures.push(`Voice exceeds 300KB for ${key}: ${size}`);
if (failures.length) { for (const failure of failures) console.error(failure); process.exit(1); }
console.log(`Audio credits OK: ${files.length} files`);
