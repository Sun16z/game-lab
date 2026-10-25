import { describe, expect, it } from "vitest";
import { advanceProgress, loadProgress } from "./progress";

describe("local milestones", () => {
  it("unlocks themes from cumulative layers and achievements from a single run", () => {
    const base = { totalLayers: 8, selectedTheme: "classic" as const, achievements: [] };
    const first = advanceProgress(base, 10, 5);
    expect(first.unlocked).toEqual(["neon"]);
    expect(first.gained).toEqual(["ten_layers", "five_perfect"]);
    const next = advanceProgress(first.progress, 12, 0);
    expect(next.unlocked).toEqual(["cosmos"]);
    expect(next.gained).toEqual([]);
  });
  it("discards a tampered locked theme", () => {
    const storage = { getItem: () => JSON.stringify({ totalLayers: 1, selectedTheme: "cosmos", achievements: ["ten_layers"] }) };
    expect(loadProgress(storage).selectedTheme).toBe("classic");
  });
});
