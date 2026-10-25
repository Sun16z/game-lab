import { cpSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const slug of ["perfect-stack", "monster-math", "color-lab", "island-conquest"]) {
  const source = resolve(root, `games/${slug}/dist`);
  const target = resolve(root, `apps/portal/public/play/${slug}`);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, { recursive: true });
}
