import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("knowledge/locale-voice/catalog.json", root), "utf8"));
const locales = new Set();
const output = {};
const approvedAudio = {};
for (const entry of catalog.entries) {
  if (!entry.locale || locales.has(entry.locale) || !Array.isArray(entry.phrases) || entry.phrases.length !== 2) {
    throw new Error(`Invalid voice entry: ${entry.locale}`);
  }
  if (entry.phrases.some((phrase) => typeof phrase.text !== "string" || !phrase.text.trim() || [...phrase.text].length > 28)) {
    throw new Error(`Invalid praise text: ${entry.locale}`);
  }
  const gameAudio = {};
  for (const [index, phrase] of entry.phrases.entries()) {
    if (!phrase.audio || typeof phrase.audio !== "object") throw new Error(`Missing audio metadata: ${entry.locale}/${index}`);
    for (const game of ["perfect-stack", "monster-math"]) {
      const clip = phrase.audio[game];
      if (!clip || typeof clip !== "object" || !["pending", "approved"].includes(clip.review)) throw new Error(`Invalid voice review: ${entry.locale}/${index}/${game}`);
      if (clip.review === "pending") {
        if (clip.files !== null || clip.source !== null || clip.license !== null) throw new Error(`Pending voice metadata must be empty: ${entry.locale}/${index}/${game}`);
        continue;
      }
      if (!Array.isArray(clip.files) || clip.files.length !== 2 || !clip.source || !clip.license) throw new Error(`Incomplete approved voice clip: ${entry.locale}/${index}/${game}`);
      for (const file of clip.files) {
        if (typeof file !== "string" || !file.startsWith(`games/${game}/public/audio/voice/`) || !existsSync(new URL(file, root))) {
          throw new Error(`Missing voice file: ${file}`);
        }
      }
      (gameAudio[game] ??= {})[`praise-${index}`] = clip.files.map((file) => `./${file.split("/public/")[1]}`);
    }
  }
  locales.add(entry.locale);
  output[entry.locale] = entry.phrases.map((phrase) => phrase.text);
  approvedAudio[entry.locale] = gameAudio;
}
const source = `// Generated from knowledge/locale-voice/catalog.json. Do not edit by hand.\nexport const praisePhrases = ${JSON.stringify(output, null, 2)} as const;\nexport const approvedPraiseAudio = ${JSON.stringify(approvedAudio, null, 2)} as const;\n`;
writeFileSync(new URL("packages/locale-voice/src/runtime.generated.ts", root), source);
