import { describe, expect, it } from "vitest";
import { chooseLanguage, copy, languages } from "./i18n";

describe("cloud game languages", () => {
  it("provides every control label in each supported language", () => {
    for (const language of languages) {
      expect(Object.keys(copy[language]).sort()).toEqual(Object.keys(copy.en).sort());
      for (const value of Object.values(copy[language])) expect(value.trim().length).toBeGreaterThan(0);
    }
  });
  it("selects locale variants and uses English for unknown locales", () => {
    expect(chooseLanguage("zh-TW")).toBe("zh-Hant");
    expect(chooseLanguage("pt-PT")).toBe("pt-BR");
    expect(chooseLanguage("ar-EG")).toBe("ar");
    expect(chooseLanguage("ja-JP")).toBe("en");
  });
});
