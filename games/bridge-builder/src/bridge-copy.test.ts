import { describe, expect, it } from "vitest";
import { bridgeCopy } from "./bridge-copy";

describe("bridge redesign translations", () => {
  it("provides all new labels in every supported language", () => {
    const languages = ["zh-Hant", "en", "es", "pt-BR", "fr", "ar", "sw", "id", "hi"] as const;
    const keys = Object.keys(bridgeCopy.en);
    for (const language of languages) {
      expect(Object.keys(bridgeCopy[language]).sort()).toEqual([...keys].sort());
      for (const value of Object.values(bridgeCopy[language])) expect(value.trim()).not.toBe("");
    }
  });
});
