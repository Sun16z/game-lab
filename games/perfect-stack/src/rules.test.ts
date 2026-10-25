import { describe, expect, it } from "vitest";
import { movingX, placeBlock, speedForLayer } from "./rules";

describe("perfect stack rules", () => {
  const target = { x: 130, width: 220 };

  it("keeps full width within the perfect tolerance", () => {
    expect(placeBlock(target, { x: 136, width: 220 }, 2)).toMatchObject({
      success: true, block: target, perfect: true, combo: 3, points: 200, repairedPx: 0
    });
  });

  it("repairs six pixels on every third perfect without exceeding the initial width", () => {
    const narrow = { x: 145, width: 190 };
    expect(placeBlock(narrow, narrow, 2)).toMatchObject({
      block: { x: 142, width: 196 }, combo: 3, repairedPx: 6
    });
    expect(placeBlock({ x: 130, width: 217 }, { x: 130, width: 217 }, 5)).toMatchObject({
      block: { x: 128.5, width: 220 }, repairedPx: 3
    });
  });

  it("clips overlap and resets combo", () => {
    expect(placeBlock(target, { x: 150, width: 220 }, 4)).toMatchObject({
      success: true, block: { x: 150, width: 200 }, combo: 0, points: 100, repairedPx: 0, deviationPx: 20
    });
  });

  it("ends when overlap is too narrow", () => {
    expect(placeBlock(target, { x: 334, width: 220 }, 0).success).toBe(false);
    expect(placeBlock(target, { x: 400, width: 220 }, 0).success).toBe(false);
  });

  it("caps combo bonus and speeds up every five layers", () => {
    expect(placeBlock(target, target, 20).points).toBe(350);
    expect(speedForLayer(4)).toBe(140);
    expect(speedForLayer(5)).toBeCloseTo(154);
  });

  it("moves identically regardless of frame count", () => {
    expect(movingX(1.25, 220, 140, false)).toBe(movingX(0.5 + 0.75, 220, 140, false));
    expect(movingX(0, 220, 140, true)).toBe(244);
  });
});
