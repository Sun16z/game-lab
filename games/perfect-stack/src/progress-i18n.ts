import type { Language } from "./i18n";
import type { Achievement, Theme } from "./progress";

interface ProgressCopy {
  themeLabel: string;
  total: (layers: number) => string;
  unlocked: (name: string) => string;
  achievementLabel: string;
  themes: Record<Theme, string>;
  achievements: Record<Achievement, string>;
}

export const progressCopy: Record<Language, ProgressCopy> = {
  "zh-Hant": { themeLabel: "主題", total: (n) => `累積${n}層`, unlocked: (n) => `解鎖${n}！`, achievementLabel: "新成就", themes: { classic: "經典", neon: "霓虹", cosmos: "星際" }, achievements: { ten_layers: "初試啼聲", five_perfect: "神準五連擊", hundred_layers: "地心引力失效" } },
  en: { themeLabel: "Theme", total: (n) => `${n} total layers`, unlocked: (n) => `Unlocked: ${n}!`, achievementLabel: "New achievement", themes: { classic: "Classic", neon: "Neon", cosmos: "Cosmos" }, achievements: { ten_layers: "First Flight", five_perfect: "Five Perfects", hundred_layers: "Gravity Who?" } },
  es: { themeLabel: "Tema", total: (n) => `${n} pisos acumulados`, unlocked: (n) => `¡Desbloqueado: ${n}!`, achievementLabel: "Nuevo logro", themes: { classic: "Clásico", neon: "Neón", cosmos: "Cosmos" }, achievements: { ten_layers: "Primer vuelo", five_perfect: "Cinco perfectos", hundred_layers: "Sin gravedad" } },
  "pt-BR": { themeLabel: "Tema", total: (n) => `${n} andares no total`, unlocked: (n) => `Desbloqueado: ${n}!`, achievementLabel: "Nova conquista", themes: { classic: "Clássico", neon: "Neon", cosmos: "Cosmos" }, achievements: { ten_layers: "Primeiro voo", five_perfect: "Cinco perfeitos", hundred_layers: "Sem gravidade" } },
  fr: { themeLabel: "Thème", total: (n) => `${n} étages au total`, unlocked: (n) => `${n} débloqué !`, achievementLabel: "Nouveau succès", themes: { classic: "Classique", neon: "Néon", cosmos: "Cosmos" }, achievements: { ten_layers: "Premier envol", five_perfect: "Cinq parfaits", hundred_layers: "Sans gravité" } },
  ar: { themeLabel: "المظهر", total: (n) => `${n} طوابق بالمجموع`, unlocked: (n) => `تم فتح ${n}!`, achievementLabel: "إنجاز جديد", themes: { classic: "كلاسيكي", neon: "نيون", cosmos: "الفضاء" }, achievements: { ten_layers: "البداية", five_perfect: "خمس مرات مثالية", hundred_layers: "بلا جاذبية" } },
  sw: { themeLabel: "Mandhari", total: (n) => `Jumla ya ghorofa ${n}`, unlocked: (n) => `Umefungua: ${n}!`, achievementLabel: "Mafanikio mapya", themes: { classic: "Kawaida", neon: "Neon", cosmos: "Anga" }, achievements: { ten_layers: "Mwanzo mzuri", five_perfect: "Tano sahihi", hundred_layers: "Bila mvuto" } },
  id: { themeLabel: "Tema", total: (n) => `${n} tingkat terkumpul`, unlocked: (n) => `Terbuka: ${n}!`, achievementLabel: "Pencapaian baru", themes: { classic: "Klasik", neon: "Neon", cosmos: "Kosmos" }, achievements: { ten_layers: "Awal yang hebat", five_perfect: "Lima sempurna", hundred_layers: "Tanpa gravitasi" } },
  hi: { themeLabel: "थीम", total: (n) => `कुल ${n} मंज़िलें`, unlocked: (n) => `${n} अनलॉक हुआ!`, achievementLabel: "नई उपलब्धि", themes: { classic: "क्लासिक", neon: "नियॉन", cosmos: "अंतरिक्ष" }, achievements: { ten_layers: "पहली उड़ान", five_perfect: "पाँच परफ़ेक्ट", hundred_layers: "गुरुत्व से परे" } }
};
