import { approvedPraiseAudio, praisePhrases } from "./runtime.generated";

export type VoiceLocale = keyof typeof praisePhrases;

function resolveLocale(uiLocale: string, preferredLocale?: string): VoiceLocale {
  const locale = uiLocale === "zh-Hant" && preferredLocale?.toLowerCase().startsWith("zh-tw")
    ? "zh-TW" : uiLocale;
  return Object.prototype.hasOwnProperty.call(praisePhrases, locale) ? locale as VoiceLocale : "en";
}

export function getStreakPraiseCue(combo: number): string {
  return `praise-${Math.max(0, Math.floor(combo / 3) - 1) % 2}`;
}

export function getApprovedPraiseVoice(game: "perfect-stack" | "monster-math"): Record<string, Record<string, readonly string[]>> {
  const result: Record<string, Record<string, readonly string[]>> = {};
  for (const [locale, games] of Object.entries(approvedPraiseAudio)) {
    const clips = (games as Record<string, Record<string, readonly string[]>>)[game];
    if (clips) result[locale] = clips;
  }
  return result;
}

export function getStreakPraise(uiLocale: string, combo: number, preferredLocale?: string): string {
  const phrases = praisePhrases[resolveLocale(uiLocale, preferredLocale)];
  const milestone = Math.max(0, Math.floor(combo / 3) - 1);
  return phrases[milestone % phrases.length];
}
