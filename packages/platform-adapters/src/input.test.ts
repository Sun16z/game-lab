import { describe, expect, it } from "vitest";
import { homeExitLabel, inputInstruction, learningBenefitText } from "./index";

describe("input instructions", () => {
  it("hides keyboard controls for touch-first devices", () => {
    expect(inputInstruction("Press Space", "Tap the screen", true)).toBe("Tap the screen");
    expect(inputInstruction("Press Space", "Tap the screen", false)).toBe("Press Space");
  });
  it("provides an exit label in every supported language", () => {
    for (const language of ["zh-Hant", "en", "es", "pt-BR", "fr", "ar", "sw", "id", "hi"]) {
      expect(homeExitLabel(language).length).toBeGreaterThan(5);
    }
  });
  it("provides learning benefits for every playable game in all nine languages", () => {
    const games = ["perfect-stack", "monster-math", "color-lab", "island-conquest", "memory-monsters", "math-runner"] as const;
    for (const language of ["zh-Hant", "en", "es", "pt-BR", "fr", "ar", "sw", "id", "hi"]) {
      for (const game of games) expect(learningBenefitText(game, language).length).toBeGreaterThan(20);
    }
  });
});
