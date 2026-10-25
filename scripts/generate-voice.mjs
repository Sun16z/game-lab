import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const catalog = JSON.parse(readFileSync(new URL("knowledge/locale-voice/catalog.json", root), "utf8"));
const locales = new Set();
const output = {};
for (const entry of catalog.entries) {
  if (!entry.locale || locales.has(entry.locale) || !Array.isArray(entry.phrases) || entry.phrases.length !== 2) {
    throw new Error(`Invalid voice entry: ${entry.locale}`);
  }
  if (entry.phrases.some((phrase) => typeof phrase !== "string" || !phrase.trim() || [...phrase].length > 28)) {
    throw new Error(`Invalid praise text: ${entry.locale}`);
  }
  locales.add(entry.locale);
  output[entry.locale] = entry.phrases;
}
const source = `// Generated from knowledge/locale-voice/catalog.json. Do not edit by hand.\nexport const praisePhrases = ${JSON.stringify(output, null, 2)} as const;\n`;
writeFileSync(new URL("packages/locale-voice/src/runtime.generated.ts", root), source);
