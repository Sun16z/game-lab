import { describe, expect, it } from "vitest";
import { INITIAL_WIDTH, movingX, placeBlock, speedForLayer, type Block } from "./rules";

// Monte Carlo playtest: a simulated player aims for the ideal drop moment and misses by a
// Gaussian timing error. Medians are checked against the difficulty targets.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function idealElapsed(target: Block, layer: number): number {
  const speed = speedForLayer(layer);
  const fromRight = layer % 2 === 1;
  const step = 0.001;
  let previous = movingX(0, target.width, speed, fromRight) - target.x;
  for (let t = step; t < 20; t += step) {
    const current = movingX(t, target.width, speed, fromRight) - target.x;
    if (previous === 0 || Math.sign(current) !== Math.sign(previous)) return t;
    previous = current;
  }
  return 0;
}

function simulateRun(sigmaMs: number, random: () => number): number {
  const gauss = () => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());
  let target: Block = { x: (480 - INITIAL_WIDTH) / 2, width: INITIAL_WIDTH };
  let combo = 0;
  for (let layer = 0; layer < 300; layer++) {
    const elapsed = Math.max(0, idealElapsed(target, layer) + gauss() * sigmaMs / 1000);
    const x = movingX(elapsed, target.width, speedForLayer(layer), layer % 2 === 1);
    const outcome = placeBlock(target, { x, width: target.width }, combo);
    if (!outcome.success || !outcome.block) return layer;
    target = outcome.block;
    combo = outcome.combo;
  }
  return 300;
}

function medianLayers(sigmaMs: number, runs = 400): number {
  const random = mulberry32(sigmaMs * 7919);
  const layers = Array.from({ length: runs }, () => simulateRun(sigmaMs, random)).sort((a, b) => a - b);
  return layers[Math.floor(runs / 2)];
}

describe("difficulty curve", () => {
  it("ends a typical run (50ms timing error) at 20-28 layers", () => {
    const median = medianLayers(50);
    expect(median).toBeGreaterThanOrEqual(20);
    expect(median).toBeLessThanOrEqual(28);
  });

  it("keeps a skill ceiling for precise players (25ms timing error)", () => {
    expect(medianLayers(25)).toBeGreaterThanOrEqual(45);
  });

  it("does not crush casual players (70ms timing error)", () => {
    const median = medianLayers(70);
    expect(median).toBeGreaterThanOrEqual(14);
    expect(median).toBeLessThanOrEqual(20);
  });
});
