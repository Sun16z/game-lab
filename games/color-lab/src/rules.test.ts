import { describe, expect, it } from "vitest";
import { applyMove, isSolved, legalMove, LEVELS, solve, starsFor } from "./rules";

describe("color lab rules", () => {
  it("pours a contiguous top group and rejects incompatible colors", () => {
    const board = [[0, 1, 1], [1], [], [0], []] as const;
    expect(legalMove(board, 0, 1)).toEqual({ source: 0, target: 1, count: 2 });
    expect(legalMove(board, 0, 3)).toBeNull();
    expect(applyMove(board, { source: 0, target: 1, count: 2 })).toEqual([[0], [1, 1, 1], [], [0], []]);
    expect(board[0]).toEqual([0, 1, 1]);
  });
  it("has 30 distinct, solvable boards with verified minimum moves", () => {
    const keys = new Set<string>();
    for (const level of LEVELS) {
      expect(level.tubes).toHaveLength(5);
      expect(level.tubes.flat().filter((color) => color === 0)).toHaveLength(4);
      expect(level.tubes.flat().filter((color) => color === 1)).toHaveLength(4);
      expect(level.tubes.flat().filter((color) => color === 2)).toHaveLength(4);
      expect(isSolved(level.tubes)).toBe(false);
      expect(solve(level.tubes)?.moves).toBe(level.optimal);
      keys.add(level.tubes.map((tube) => tube.join("")).join("|"));
    }
    expect(keys.size).toBe(30);
  });
  it("awards fewer stars as moves grow", () => {
    expect(starsFor(5, 5)).toBe(3);
    expect(starsFor(7, 5)).toBe(2);
    expect(starsFor(8, 5)).toBe(1);
  });
});
