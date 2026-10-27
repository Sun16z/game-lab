import type { Language } from './i18n';

export function challengeTarget(value: string | null): number | undefined {
  if (!value || !/^\d{1,5}$/.test(value)) return undefined;
  const target = Number(value);
  return target > 0 && target <= 99999 ? target : undefined;
}
export const challengeCopy: Record<Language, (moves: number) => string> = {
  'zh-Hant': n => `朋友用了${n}次擺放服務完12位旅人，你能用不超過${n}次完成嗎？`,
  en: n => `A friend served 12 guests in ${n} placements. Can you match or beat that?`,
  es: n => `Una amistad atendió a 12 visitantes en ${n} movimientos. ¿Puedes igualarlo o mejorarlo?`,
  'pt-BR': n => `Um amigo serviu 12 visitantes em ${n} movimentos. Você consegue igualar ou superar?`,
  fr: n => `Un ami a servi 12 visiteurs en ${n} placements. Peux-tu égaler ou améliorer ce résultat ?`,
  ar: n => `قدّم صديق الطعام لـ12 ضيفاً في ${n} خطوات. هل تستطيع مجاراة هذا العدد أو تحسينه؟`,
  sw: n => `Rafiki amehudumia wageni 12 kwa hatua ${n}. Je, unaweza kufikia au kuboresha idadi hiyo?`,
  id: n => `Teman melayani 12 tamu dalam ${n} langkah. Bisakah kamu menyamai atau memperbaikinya?`,
  hi: n => `एक दोस्त ने ${n} बार सामग्री रखकर 12 मेहमानों को खाना परोसा। क्या आप इसे इतने या कम बार में कर सकते हैं?`
};
export const movesLabel: Record<Language, string> = {
  'zh-Hant':'擺放次數', en:'Placements', es:'Movimientos', 'pt-BR':'Movimentos', fr:'Placements', ar:'خطوات', sw:'Hatua', id:'Langkah', hi:'सामग्री रखी'
};
