import { describe, expect, it } from "vitest";
import { inputInstruction } from "./index";

describe("input instructions", () => {
  it("hides keyboard controls for touch-first devices", () => {
    expect(inputInstruction("Press Space", "Tap the screen", true)).toBe("Tap the screen");
    expect(inputInstruction("Press Space", "Tap the screen", false)).toBe("Press Space");
  });
});
