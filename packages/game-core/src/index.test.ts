import { describe, expect, it } from "vitest";
import { createRun, transitionRun } from "./index";

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
