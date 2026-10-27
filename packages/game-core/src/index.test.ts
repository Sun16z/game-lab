import { describe, expect, it } from "vitest";
import { createRun, games, transitionRun } from "./index";

describe("run lifecycle", () => {
  it("records start and end once", () => {
    const ready = createRun("G001", "seed-1", "run-1");
    const playing = transitionRun(ready, "PLAYING", "2026-10-25T00:00:00Z");
    const result = transitionRun(playing, "RESULT", "2026-10-25T00:01:00Z");
    expect(result.startedAt).toBe("2026-10-25T00:00:00Z");
    expect(result.endedAt).toBe("2026-10-25T00:01:00Z");
    expect(() => transitionRun(result, "PLAYING", "2026-10-25T00:02:00Z")).toThrow();
  });
});

describe("game catalog", () => {
  it("keeps the 20 original ideas and lists candidate games separately", () => {
    expect(games.filter((game) => game.id.startsWith("G"))).toHaveLength(20);
    expect(new Set(games.map((game) => game.id)).size).toBe(games.length);
    expect(new Set(games.map((game) => game.slug)).size).toBe(games.length);
    expect(games.filter((game) => game.status === "playable").map((game) => game.id)).toEqual(["G001", "G002", "G003", "G004", "G018", "C001", "C002"]);
  });
});
