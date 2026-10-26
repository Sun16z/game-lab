import { describe, expect, it } from "vitest";
import { chooseAiMove, createGame, legalMoves, playMove, winner, type Difficulty } from "./rules";

describe("island conquest rules", () => {
  it("creates mirrored terrain and rejects occupied cells", () => {
    const state = createGame("test-map");
    for (let index = 0; index < state.cells.length; index++) {
      expect(state.cells[index].terrain).toBe(state.cells[state.cells.length - 1 - index].terrain);
    }
    const move = legalMoves(state)[0];
    const next = playMove(state, move).state;
    expect(() => playMove(next, move)).toThrow();
    expect(state.cells[move.index].tile).toBeNull();
  });

  it("finishes 1,000 AI games with first-player win rate between 45% and 55%", () => {
    let firstWins = 0;
    let ties = 0;
    const difficulties: Difficulty[] = ["easy", "normal", "hard"];
    for (let game = 0; game < 1000; game++) {
      let state = createGame(`balance-${game}`);
      let turns = 0;
      while (!state.over && turns < 36) {
        const difficulty = difficulties[game % difficulties.length];
        state = playMove(state, chooseAiMove(state, difficulty, game)).state;
        turns++;
      }
      expect(state.over).toBe(true);
      expect(turns).toBeLessThanOrEqual(36);
      const result = winner(state);
      if (result === 0) firstWins++;
      else if (result === null) ties++;
    }
    const firstRate = (firstWins + ties / 2) / 1000;
    expect(firstRate).toBeGreaterThanOrEqual(0.45);
    expect(firstRate).toBeLessThanOrEqual(0.55);
  }, 30_000);
});
