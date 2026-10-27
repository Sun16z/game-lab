import {describe,expect,it} from "vitest";
import {chooseLanguage,copy} from "./i18n";
describe("island interface languages",()=>{
  it("has readable text for every required field in all nine languages",()=>{for(const value of Object.values(copy))for(const key of Object.keys(copy.en) as (keyof typeof copy.en)[])expect(value[key]?.trim()).toBeTruthy();});
  it("resolves variants and falls back to English",()=>{expect(chooseLanguage("zh-TW")).toBe("zh-Hant");expect(chooseLanguage("pt-PT")).toBe("pt-BR");expect(chooseLanguage("ar-EG")).toBe("ar");expect(chooseLanguage("ja")).toBe("en");});
});
