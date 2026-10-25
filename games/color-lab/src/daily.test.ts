import { describe, expect, it } from "vitest";
import { dailyLevel, decodeChallenge, encodeChallenge, utcDay } from "./daily";
import { applyMove, cloneBoard, isSolved, LEVELS, solve, type Move } from "./rules";

describe("daily challenge", () => {
  it("uses UTC so the same date has the same puzzle worldwide", () => {
    expect(utcDay(new Date("2026-10-26T23:59:59Z"))).toBe("2026-10-26");
    expect(dailyLevel("2026-10-26")).toBe(dailyLevel("2026-10-26"));
    expect(dailyLevel("2026-10-26")).toBeGreaterThanOrEqual(1);
    expect(dailyLevel("2026-10-26")).toBeLessThanOrEqual(LEVELS.length);
  });

  it("round-trips a completed solution and rejects forged or broken paths", () => {
    const level = 1;
    let board = cloneBoard(LEVELS[level - 1].tubes);
    const steps: Move[] = [];
    while (!isSolved(board)) {
      const move = solve(board)?.first;
      if (!move) throw new Error("Expected a solution");
      board = applyMove(board, move);
      steps.push(move);
    }
    const payload = encodeChallenge({ level, moves: steps.length, steps, date: null });
    expect(decodeChallenge(`#${payload}`)).toEqual({ level, moves: steps.length, steps, date: null });
    const tampered = new URLSearchParams(payload);
    tampered.set("challenge", tampered.get("challenge")!.replace(`:${steps.length}:`, `:${steps.length - 1}:`));
    expect(decodeChallenge(`#${tampered}`)).toBeNull();
    expect(decodeChallenge("#challenge=1%3A-%3A1%3A1%3A44")).toBeNull();
  });

  it("binds a daily link to the date's puzzle", () => {
    const date = "2026-10-26";
    const level = dailyLevel(date);
    let board = cloneBoard(LEVELS[level - 1].tubes);
    const steps: Move[] = [];
    while (!isSolved(board)) {
      const move = solve(board)?.first;
      if (!move) throw new Error("Expected a solution");
      board = applyMove(board, move);
      steps.push(move);
    }
    const payload = encodeChallenge({ date, level, moves: steps.length, steps });
    expect(decodeChallenge(`#${payload}`)?.date).toBe(date);
    const wrongDay = new URLSearchParams(payload);
    wrongDay.set("challenge", wrongDay.get("challenge")!.replace(date, "2026-10-27"));
    if (dailyLevel(date) !== dailyLevel("2026-10-27")) expect(decodeChallenge(`#${wrongDay}`)).toBeNull();
  });
  it("accepts a completed challenge copied from the game UI", () => {
    expect(decodeChallenge("#challenge=1%3A2026-10-25%3A16%3A6%3A032123413403")).not.toBeNull();
  });
});
