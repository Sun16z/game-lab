import { praisePhrases } from "./runtime.generated";

export type VoiceLocale = keyof typeof praisePhrases;

export function getStreakPraise(uiLocale: string, combo: number, preferredLocale?: string): string {
  const locale = uiLocale === "zh-Hant" && preferredLocale?.toLowerCase().startsWith("zh-tw")
    ? "zh-TW" : uiLocale;
  const phrases = Object.prototype.hasOwnProperty.call(praisePhrases, locale)
    ? praisePhrases[locale as VoiceLocale]
    : praisePhrases.en;
  const milestone = Math.max(0, Math.floor(combo / 3) - 1);
  return phrases[milestone % phrases.length];
}
