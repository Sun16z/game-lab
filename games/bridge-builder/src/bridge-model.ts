/** A deliberately simplified puzzle model, not a structural engineering simulation. */
export type Load = "light" | "medium" | "heavy";
export type Material = "wood" | "reinforced";
export interface Puzzle {
  width: number;
  load: Load;
  budget: number;
  blockedPiers: readonly number[];
  allowReinforced: boolean;
}
export interface Design {
  decks: readonly (Material | null)[];
  piers: readonly boolean[];
}
export type Evaluation =
  | { ok: false; reason: "invalid" | "gap" | "budget" | "blocked" | "material" }
  | { ok: false; reason: "span"; from: number; to: number; allowed: number }
  | { ok: true; cost: number };

// Bridge abutments at positions 0 and width are fixed supports. Pier indices
// denote interior support positions (index 0 is position 1).
export const puzzles: readonly Puzzle[] = [
  { width: 1, load: "light", budget: 0, blockedPiers: [], allowReinforced: false },
  { width: 4, load: "light", budget: 1, blockedPiers: [], allowReinforced: false },
  { width: 5, load: "light", budget: 1, blockedPiers: [], allowReinforced: false },
  { width: 4, load: "medium", budget: 1, blockedPiers: [], allowReinforced: false },
  { width: 3, load: "medium", budget: 3, blockedPiers: [], allowReinforced: true },
  { width: 4, load: "medium", budget: 4, blockedPiers: [], allowReinforced: true },
  { width: 5, load: "light", budget: 2, blockedPiers: [1], allowReinforced: true },
  { width: 5, load: "medium", budget: 4, blockedPiers: [1], allowReinforced: true },
  { width: 4, load: "heavy", budget: 3, blockedPiers: [], allowReinforced: true },
  { width: 5, load: "heavy", budget: 6, blockedPiers: [2], allowReinforced: true }
];

const capacity: Record<Material, Record<Load, number>> = {
  wood: { light: 3, medium: 2, heavy: 1 },
  reinforced: { light: 4, medium: 3, heavy: 2 }
};

export function emptyDesign(puzzle: Puzzle): Design {
  return { decks: Array(puzzle.width).fill(null), piers: Array(puzzle.width - 1).fill(false) };
}

/** One point per reinforced plank or pier; ordinary planks are free. */
export function designCost(design: Design): number {
  return design.decks.filter(d => d === "reinforced").length + design.piers.filter(Boolean).length;
}

export type Placement =
  | { ok: true; design: Design }
  | { ok: false; reason: "invalid" | "budget" | "blocked" | "material" };

/** Placing the same material again removes it; replacing it changes only that slot. */
export function placeDeck(puzzle: Puzzle, design: Design, index: number, material: Material): Placement {
  if (!Number.isInteger(index) || index < 0 || index >= puzzle.width || design.decks.length !== puzzle.width || design.piers.length !== puzzle.width - 1 || (material !== "wood" && material !== "reinforced")) return { ok: false, reason: "invalid" };
  if (material === "reinforced" && !puzzle.allowReinforced) return { ok: false, reason: "material" };
  const decks = design.decks.map((old, i) => i === index ? old === material ? null : material : old);
  const next = { ...design, decks };
  return designCost(next) > puzzle.budget ? { ok: false, reason: "budget" } : { ok: true, design: next };
}

export function placePier(puzzle: Puzzle, design: Design, index: number): Placement {
  if (!Number.isInteger(index) || index < 0 || index >= puzzle.width - 1 || design.decks.length !== puzzle.width || design.piers.length !== puzzle.width - 1) return { ok: false, reason: "invalid" };
  if (puzzle.blockedPiers.includes(index)) return { ok: false, reason: "blocked" };
  const next = { ...design, piers: design.piers.map((old, i) => i === index ? !old : old) };
  return designCost(next) > puzzle.budget ? { ok: false, reason: "budget" } : { ok: true, design: next };
}

export function evaluate(puzzle: Puzzle, design: Design): Evaluation {
  if (!Number.isInteger(puzzle.width) || puzzle.width < 1 || design.decks.length !== puzzle.width || design.piers.length !== puzzle.width - 1 || design.decks.some(d => d !== null && d !== "wood" && d !== "reinforced") || design.piers.some(p => typeof p !== "boolean")) return { ok: false, reason: "invalid" };
  if (design.decks.some(d => d === null)) return { ok: false, reason: "gap" };
  if (!puzzle.allowReinforced && design.decks.includes("reinforced")) return { ok: false, reason: "material" };
  if (puzzle.blockedPiers.some(i => design.piers[i])) return { ok: false, reason: "blocked" };
  const cost = designCost(design);
  if (cost > puzzle.budget) return { ok: false, reason: "budget" };
  const supports = [0, ...design.piers.flatMap((placed, i) => placed ? [i + 1] : []), puzzle.width];
  for (let i = 1; i < supports.length; i++) {
    const from = supports[i - 1], to = supports[i];
    const allowed = Math.min(...design.decks.slice(from, to).map(d => capacity[d!][puzzle.load]));
    if (to - from > allowed) return { ok: false, reason: "span", from, to, allowed };
  }
  return { ok: true, cost };
}
