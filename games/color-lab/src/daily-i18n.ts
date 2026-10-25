import type { Language } from "./i18n";

export const dailyCopy: Record<Language, {
  daily: string; today: (day: string) => string; replay: string; replaying: string;
  better: string; tied: string; keepTrying: string;
}> = {
  "zh-Hant": { daily: "今日題目", today: (day) => `今日題目 · ${day} · 全球同一題`, replay: "看朋友的解法", replaying: "正在播放朋友的解法…", better: "你贏了這場挑戰！", tied: "你們打成平手！", keepTrying: "再試一次，少一步就能超越朋友！" },
  en: { daily: "Daily puzzle", today: (day) => `Daily puzzle · ${day} · same puzzle worldwide`, replay: "Watch friend's solution", replaying: "Playing your friend's solution…", better: "You won this challenge!", tied: "It's a tie!", keepTrying: "Try again. One fewer move could beat your friend!" },
  es: { daily: "Reto diario", today: (day) => `Reto diario · ${day} · el mismo para todos`, replay: "Ver solución del amigo", replaying: "Reproduciendo la solución…", better: "¡Ganaste el reto!", tied: "¡Empate!", keepTrying: "¡Inténtalo de nuevo y supera a tu amigo!" },
  "pt-BR": { daily: "Desafio diário", today: (day) => `Desafio diário · ${day} · igual para todos`, replay: "Ver solução do amigo", replaying: "Mostrando a solução…", better: "Você venceu o desafio!", tied: "Empate!", keepTrying: "Tente de novo e supere seu amigo!" },
  fr: { daily: "Défi du jour", today: (day) => `Défi du jour · ${day} · même défi pour tous`, replay: "Voir la solution de l'ami", replaying: "Lecture de la solution…", better: "Tu as gagné ce défi !", tied: "Égalité !", keepTrying: "Réessaie avec moins de coups !" },
  ar: { daily: "لغز اليوم", today: (day) => `لغز اليوم · ${day} · نفس اللغز للجميع`, replay: "شاهد حل صديقك", replaying: "جارٍ عرض حل صديقك…", better: "فزت بالتحدي!", tied: "تعادلتما!", keepTrying: "حاول مجددًا بخطوات أقل!" },
  sw: { daily: "Fumbo la leo", today: (day) => `Fumbo la leo · ${day} · sawa duniani`, replay: "Tazama suluhisho la rafiki", replaying: "Inaonyesha suluhisho…", better: "Umeshinda changamoto!", tied: "Mmetoka sare!", keepTrying: "Jaribu tena kwa hatua chache!" },
  id: { daily: "Teka-teki harian", today: (day) => `Teka-teki harian · ${day} · sama di seluruh dunia`, replay: "Lihat solusi teman", replaying: "Memutar solusi teman…", better: "Kamu menang tantangan ini!", tied: "Seri!", keepTrying: "Coba lagi dengan langkah lebih sedikit!" },
  hi: { daily: "आज की पहेली", today: (day) => `आज की पहेली · ${day} · दुनिया भर में एक जैसी`, replay: "दोस्त का हल देखें", replaying: "दोस्त का हल दिखा रहे हैं…", better: "आप चुनौती जीत गए!", tied: "बराबरी हुई!", keepTrying: "कम चालों में फिर कोशिश करें!" }
};
