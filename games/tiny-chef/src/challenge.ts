import type { Language } from './i18n';

export function challengeTarget(value: string | null): number | undefined {
  if (!value || !/^\d{1,5}$/.test(value)) return undefined;
  const target = Number(value);
  return target > 0 && target <= 99999 ? target : undefined;
}
export const challengeCopy: Record<Language, (moves: number) => string> = {
  'zh-Hant': n => `朋友用了${n}次擺放服務完四位旅人，你能用更少次數完成嗎？`,
  en: n => `A friend served four guests in ${n} placements. Can you do it in fewer?`,
  es: n => `Una amistad atendió a cuatro visitantes en ${n} movimientos. ¿Puedes hacerlo con menos?`,
  'pt-BR': n => `Um amigo serviu quatro visitantes em ${n} movimentos. Você consegue fazer em menos?`,
  fr: n => `Un ami a servi quatre visiteurs en ${n} placements. Peux-tu faire moins ?`,
  ar: n => `قدّم صديق الطعام لأربعة ضيوف في ${n} خطوات. هل تستطيع استخدام خطوات أقل؟`,
  sw: n => `Rafiki amehudumia wageni wanne kwa hatua ${n}. Je, unaweza kutumia chache?`,
  id: n => `Teman melayani empat tamu dalam ${n} langkah. Bisakah kamu memakai lebih sedikit?`,
  hi: n => `एक दोस्त ने ${n} बार सामग्री रखकर चार मेहमानों को खाना परोसा। क्या आप कम बार में कर सकते हैं?`
};
export const movesLabel: Record<Language, string> = {
  'zh-Hant':'擺放次數', en:'Placements', es:'Movimientos', 'pt-BR':'Movimentos', fr:'Placements', ar:'خطوات', sw:'Hatua', id:'Langkah', hi:'सामग्री रखी'
};
