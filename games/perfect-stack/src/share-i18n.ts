import type { Language } from "./i18n";

export const shareTranslations: Record<Language, {
  challenge: (layers: number) => string; shareCard: string; downloadCard: string; copyLink: string; copied: string;
  downloaded: string; shareFailed: string; bestLabel: string;
}> = {
  "zh-Hant": { challenge: (n) => `我疊到${n}層，你能超過嗎？`, shareCard: "分享成績，挑戰朋友", downloadCard: "下載圖卡", copyLink: "複製遊戲連結", copied: "連結已複製", downloaded: "圖卡已下載", shareFailed: "分享失敗，請再試一次", bestLabel: "最佳" },
  en: { challenge: (n) => `I stacked ${n} layers. Can you beat me?`, shareCard: "Challenge a friend", downloadCard: "Download card", copyLink: "Copy game link", copied: "Link copied", downloaded: "Card downloaded", shareFailed: "Could not share. Try again.", bestLabel: "Best" },
  es: { challenge: (n) => `Llegué a ${n} pisos. ¿Puedes superarme?`, shareCard: "Retar a un amigo", downloadCard: "Descargar tarjeta", copyLink: "Copiar enlace", copied: "Enlace copiado", downloaded: "Tarjeta descargada", shareFailed: "No se pudo compartir. Inténtalo de nuevo.", bestLabel: "Récord" },
  "pt-BR": { challenge: (n) => `Cheguei a ${n} andares. Consegue me superar?`, shareCard: "Desafiar um amigo", downloadCard: "Baixar cartão", copyLink: "Copiar link", copied: "Link copiado", downloaded: "Cartão baixado", shareFailed: "Não foi possível compartilhar. Tente novamente.", bestLabel: "Recorde" },
  fr: { challenge: (n) => `J’ai atteint ${n} étages. Tu peux faire mieux ?`, shareCard: "Défier un ami", downloadCard: "Télécharger la carte", copyLink: "Copier le lien", copied: "Lien copié", downloaded: "Carte téléchargée", shareFailed: "Partage impossible. Réessayez.", bestLabel: "Record" },
  ar: { challenge: (n) => `وصلت إلى ${n} طوابق. هل يمكنك تجاوزي؟`, shareCard: "تحدَّ صديقًا", downloadCard: "تنزيل البطاقة", copyLink: "نسخ رابط اللعبة", copied: "تم نسخ الرابط", downloaded: "تم تنزيل البطاقة", shareFailed: "تعذرت المشاركة. حاول مجددًا.", bestLabel: "الأفضل" },
  sw: { challenge: (n) => `Nimefika ghorofa ${n}. Unaweza kunipita?`, shareCard: "Mpe rafiki changamoto", downloadCard: "Pakua kadi", copyLink: "Nakili kiungo", copied: "Kiungo kimenakiliwa", downloaded: "Kadi imepakuliwa", shareFailed: "Imeshindwa kushiriki. Jaribu tena.", bestLabel: "Bora" },
  id: { challenge: (n) => `Aku sampai ${n} tingkat. Bisa kalahkan skorku?`, shareCard: "Tantang teman", downloadCard: "Unduh kartu", copyLink: "Salin tautan", copied: "Tautan disalin", downloaded: "Kartu diunduh", shareFailed: "Gagal membagikan. Coba lagi.", bestLabel: "Terbaik" },
  hi: { challenge: (n) => `मैंने ${n} मंज़िलें बनाईं। क्या तुम मुझे हरा सकते हो?`, shareCard: "दोस्त को चुनौती दें", downloadCard: "कार्ड डाउनलोड करें", copyLink: "गेम लिंक कॉपी करें", copied: "लिंक कॉपी हो गया", downloaded: "कार्ड डाउनलोड हो गया", shareFailed: "शेयर नहीं हो पाया। फिर कोशिश करें।", bestLabel: "सर्वश्रेष्ठ" }
};
