import { describe, expect, it } from "vitest";
import { paletteFor } from "./appearance";
import { startPhaseForLayer } from "./rules";

describe("seeded tower appearance", () => {
  it("keeps phase and palette stable for the same seed", () => {
    expect(Array.from({ length: 20 }, (_, layer) => startPhaseForLayer(layer, "same-seed")))
      .toEqual(Array.from({ length: 20 }, (_, layer) => startPhaseForLayer(layer, "same-seed")));
    expect(paletteFor("same-seed", "classic")).toEqual(paletteFor("same-seed", "classic"));
  });

  it("changes the seeded classic palette for a different seed", () => {
    expect(paletteFor("seed-a", "classic")).not.toEqual(paletteFor("seed-b", "classic"));
  });
});
