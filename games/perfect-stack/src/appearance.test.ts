import { describe, expect, it } from "vitest";
import { paletteFor } from "./appearance";
import { startPhaseForLayer } from "./rules";

describe("seeded tower appearance", () => {
  it("keeps phase and palette stable for the same seed", () => {
    const phases = Array.from({ length: 20 }, (_, layer) => startPhaseForLayer(layer, "same-seed"));
    expect(phases).toEqual(Array.from({ length: 20 }, (_, layer) => startPhaseForLayer(layer, "same-seed")));
    expect(phases).toEqual([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0,
      0.2889041128917597, 0.11866685544373468, 0.19237008118070661,
      0.4125858688610606, 0.13702565487474203
    ]);
    expect(paletteFor("same-seed", "classic")).toEqual({
      background: 0x91ced7,
      blocks: [0x9ec7b7, 0xdda577, 0xb3bf97, 0xe5bc72],
      accent: 0xffd575
    });
  });

  it("changes the seeded classic palette for a different seed", () => {
    expect(paletteFor("seed-a", "classic")).not.toEqual(paletteFor("seed-b", "classic"));
  });
});
