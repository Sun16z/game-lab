import { describe, expect, it } from "vitest";
import { getStreakPraise } from "./index";
import { praisePhrases } from "./runtime.generated";

describe("shared locale voice", () => {
  it("uses Taiwan wording only for an explicit Taiwan language tag", () => {
    expect(getStreakPraise("zh-Hant", 3, "zh-TW")).toBe("太神啦！");
    expect(getStreakPraise("zh-Hant", 3, "zh-HK")).toBe("太厲害了！");
  });
  it("rotates at each three-perfect milestone and falls back safely", () => {
    expect(getStreakPraise("en", 3)).toBe("You're on fire!");
    expect(getStreakPraise("en", 6)).toBe("That was so clean!");
    expect(getStreakPraise("xx", 3)).toBe("You're on fire!");
  });
  it("keeps every shipped phrase short and nonempty", () => {
    for (const phrases of Object.values(praisePhrases)) {
      expect(phrases).toHaveLength(2);
      for (const phrase of phrases) {
        expect(phrase.trim()).toBe(phrase);
        expect([...phrase].length).toBeLessThanOrEqual(28);
      }
    }
  });
});
