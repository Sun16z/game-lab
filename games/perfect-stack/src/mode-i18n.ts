import type { Language } from "./i18n";

export const modeCopy: Record<Language, { label: string; standard: string; child: string }> = {
  "zh-Hant": { label: "模式", standard: "一般", child: "兒童" },
  en: { label: "Mode", standard: "Standard", child: "Kids" },
  es: { label: "Modo", standard: "Normal", child: "Infantil" },
  "pt-BR": { label: "Modo", standard: "Normal", child: "Infantil" },
  fr: { label: "Mode", standard: "Normal", child: "Enfant" },
  ar: { label: "الوضع", standard: "عادي", child: "للأطفال" },
  sw: { label: "Hali", standard: "Kawaida", child: "Watoto" },
  id: { label: "Mode", standard: "Biasa", child: "Anak" },
  hi: { label: "मोड", standard: "सामान्य", child: "बच्चों के लिए" }
};
