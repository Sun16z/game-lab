"use client";
import { useEffect, useState } from "react";
const copy: Record<string, string> = {
  zh: "我們使用Cloudflare Web Analytics統計瀏覽次數與來源；它不使用Cookie或本機儲存，也不以分析為目的辨識個人。",
  en: "We use Cloudflare Web Analytics to count page views and where visitors come from. It uses no cookies or local storage and does not identify individuals for analytics.",
  es: "Usamos Cloudflare Web Analytics para contar las visitas y saber de dónde llegan. No utiliza cookies ni almacenamiento local, ni identifica a las personas para el análisis.",
  pt: "Usamos o Cloudflare Web Analytics para contar visualizações e saber de onde vêm as visitas. Ele não usa cookies nem armazenamento local e não identifica pessoas para fins de análise.",
  fr: "Nous utilisons Cloudflare Web Analytics pour compter les visites et connaître leur provenance. Il n’utilise ni cookies ni stockage local et n’identifie pas les personnes à des fins d’analyse.",
  ar: "نستخدم Cloudflare Web Analytics لحساب مشاهدات الصفحات ومعرفة مصدر الزيارات. لا يستخدم ملفات تعريف الارتباط أو التخزين المحلي، ولا يحدد هوية الأفراد لأغراض التحليل.",
  sw: "Tunatumia Cloudflare Web Analytics kuhesabu mitazamo ya kurasa na kujua wageni wanakotoka. Haitumii vidakuzi wala hifadhi ya kifaa, na haiwatambui watu binafsi kwa uchanganuzi.",
  id: "Kami menggunakan Cloudflare Web Analytics untuk menghitung kunjungan halaman dan asal pengunjung. Layanan ini tidak memakai cookie atau penyimpanan lokal dan tidak mengenali identitas orang untuk analisis.",
  hi: "हम पेज व्यू और आगंतुक कहाँ से आए, यह जानने के लिए Cloudflare Web Analytics का उपयोग करते हैं। यह कुकी या स्थानीय स्टोरेज का उपयोग नहीं करता और विश्लेषण के लिए किसी व्यक्ति की पहचान नहीं करता।"
};
export function AnalyticsPrivacy({ className }: { className?: string }) {
  const [lang, setLang] = useState("zh");
  useEffect(() => {
    const language = new URLSearchParams(location.search).get("lang") || document.documentElement.lang || "zh";
    setLang(language.split("-")[0].toLowerCase());
  }, []);
  return <p className={className} lang={lang} dir={lang === "ar" ? "rtl" : undefined}>{copy[lang] || copy.en}</p>;
}
