import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { startPhaseForLayer } from "./rules";

describe("start phase variety", () => {
  it("varies noticeably between consecutive layers", () => {
    const phases = Array.from({ length: 20 }, (_, i) => startPhaseForLayer(15 + i, "run-seed-a"));
    const buckets = new Set(phases.map((p) => Math.floor(p / 0.05)));
    expect(buckets.size).toBeGreaterThanOrEqual(6);
    const bigJumps = phases.slice(1).filter((p, i) => Math.abs(p - phases[i]) >= 0.05).length;
    expect(bigJumps).toBeGreaterThanOrEqual(12);
  });

  it("differs between runs with different seeds", () => {
    const a = Array.from({ length: 10 }, (_, i) => startPhaseForLayer(20 + i, "seed-one"));
    const b = Array.from({ length: 10 }, (_, i) => startPhaseForLayer(20 + i, "seed-two"));
    expect(a).not.toEqual(b);
  });

  it("uses the phase everywhere main.ts positions the moving block for the current layer", () => {
    const source = readFileSync(new URL("./main.ts", import.meta.url), "utf8");
    const calls = source.match(/movingX\([^;]*this\.fromRight\(\)[^;]*\)/g) ?? [];
    expect(calls.length).toBeGreaterThanOrEqual(3);
    for (const call of calls) expect(call).toContain("startPhaseForLayer(");
  });
});
