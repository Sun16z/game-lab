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

import {cafeCopy,shapeNames,colorNames} from './cafe-i18n';
import {extra} from './cafe-extra';
it('translates every café label, twelve shapes, colors and extra controls across nine locales',()=>{for(const lang of languages){expect(Object.keys(cafeCopy[lang])).toEqual(Object.keys(cafeCopy.en));for(const value of Object.values(cafeCopy[lang]))expect(value?.trim().length).toBeGreaterThan(0);expect(shapeNames(lang)).toHaveLength(12);expect(colorNames(lang)).toHaveLength(4);for(const value of Object.values(extra(lang)))expect(value?.trim().length).toBeGreaterThan(0);}});
