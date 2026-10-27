import { describe, expect, it } from "vitest";
import { emptyDesign, evaluate, placeDeck, placePier, puzzles, type Design, type Puzzle } from "./bridge-model";

function solutions(puzzle: Puzzle): Design[] {
  const result: Design[] = [];
  // At most five deck slots: exhaust all wood/reinforced and pier positions.
  for (let decks = 0; decks < 2 ** puzzle.width; decks++) {
    for (let piers = 0; piers < 2 ** (puzzle.width - 1); piers++) {
      const design: Design = {
        decks: Array.from({ length: puzzle.width }, (_, i) => decks & (1 << i) ? "reinforced" : "wood"),
        piers: Array.from({ length: puzzle.width - 1 }, (_, i) => !!(piers & (1 << i)))
      };
      if (evaluate(puzzle, design).ok) result.push(design);
    }
  }
  return result;
}

describe("bridge design model", () => {
  it("uses riverbank supports for a short span and identifies gaps", () => {
    const p = puzzles[0];
    expect(evaluate(p, emptyDesign(p))).toEqual({ ok: false, reason: "gap" });
    expect(evaluate(p, { decks: ["wood"], piers: [] })).toEqual({ ok: true, cost: 0 });
  });
  it("identifies the unsupported span and improves when a pier is added", () => {
    const p = puzzles[1];
    expect(evaluate(p, { decks: Array(4).fill("wood"), piers: [false, false, false] })).toEqual({ ok: false, reason: "span", from: 0, to: 4, allowed: 3 });
    expect(evaluate(p, { decks: Array(4).fill("wood"), piers: [false, true, false] }).ok).toBe(true);
  });
  it("applies load, weakest material, restricted locations and budget", () => {
    const p: Puzzle = { width: 2, load: "heavy", budget: 2, blockedPiers: [0], allowReinforced: true };
    expect(evaluate(p, { decks: ["reinforced", "wood"], piers: [false] })).toMatchObject({ reason: "span", allowed: 1 });
    expect(evaluate(p, { decks: ["reinforced", "reinforced"], piers: [false] }).ok).toBe(true);
    expect(evaluate(p, { decks: ["wood", "wood"], piers: [true] })).toMatchObject({ reason: "blocked" });
    expect(evaluate({ ...p, budget: 1 }, { decks: ["reinforced", "reinforced"], piers: [false] })).toMatchObject({ reason: "budget" });
  });
  it("has at least one solution for every puzzle and multiple alternatives in later puzzles", () => {
    for (const p of puzzles) expect(solutions(p).length).toBeGreaterThan(0);
    for (const index of [5, 6, 7, 9]) expect(solutions(puzzles[index]).length).toBeGreaterThan(1);
  });
  it("allows reversible placements and enforces resource and terrain constraints", () => {
    const p: Puzzle = { width: 2, load: "heavy", budget: 1, blockedPiers: [0], allowReinforced: true };
    const board = emptyDesign(p);
    expect(placePier(p, board, 0)).toEqual({ ok: false, reason: "blocked" });
    const first = placeDeck(p, board, 0, "reinforced");
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(placeDeck(p, first.design, 1, "reinforced")).toEqual({ ok: false, reason: "budget" });
    expect(placeDeck(p, first.design, 0, "wood")).toMatchObject({ ok: true, design: { decks: ["wood", null] } });
    expect(placeDeck(p, first.design, 0, "reinforced")).toEqual({ ok: true, design: board });
  });
});
