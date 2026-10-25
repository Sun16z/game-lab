import { describe, expect, it } from "vitest";
import { bestKeyForMode, loadMode, saveMode } from "./progress";
import { placeBlock, speedForLayer } from "./rules";

describe("child mode", () => {
  it("slows every layer by thirty percent", () => {
    for (const layer of [0, 5, 10, 20, 40]) {
      expect(speedForLayer(layer, "child")).toBeCloseTo(speedForLayer(layer) * 0.7);
    }
  });

  it("accepts a wider perfect window and smaller remaining overlap", () => {
    const target = { x: 100, width: 100 };
    expect(placeBlock(target, { x: 109, width: 100 }, 0).perfect).toBe(false);
    expect(placeBlock(target, { x: 109, width: 100 }, 0, "child").perfect).toBe(true);
    expect(placeBlock(target, { x: 188, width: 100 }, 0).success).toBe(false);
    expect(placeBlock(target, { x: 188, width: 100 }, 0, "child").success).toBe(true);
  });

  it("remembers mode and separates its record from standard play", () => {
    const items = new Map<string, string>();
    const storage = { getItem: (key: string) => items.get(key) ?? null, setItem: (key: string, value: string) => { items.set(key, value); } };
    expect(loadMode(storage)).toBe("standard");
    saveMode(storage, "child");
    expect(loadMode(storage)).toBe("child");
    expect(bestKeyForMode("standard")).toBe("G001:layers");
    expect(bestKeyForMode("child")).not.toBe(bestKeyForMode("standard"));
  });
});
