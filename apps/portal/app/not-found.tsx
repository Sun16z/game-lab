"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Language = "zh-Hant" | "en" | "es" | "pt-BR" | "fr" | "ar" | "sw" | "id" | "hi";
type Copy = { title: string; message: string; home: string; language: string };

const copy: Record<Language, Copy> = {
  "zh-Hant": { title: "哎呀，走到迷路的小怪獸這裡了！", message: "這個頁面找不到。小怪獸帶你回遊戲首頁，繼續玩吧！", home: "回首頁", language: "語言" },
  en: { title: "Oops, you found a lost little monster!", message: "This page is missing. Follow our monster back to the games!", home: "Back to games", language: "Language" },
  es: { title: "¡Uy, encontraste un monstruito perdido!", message: "No encontramos esta página. ¡Volvamos a los juegos!", home: "Volver al inicio", language: "Idioma" },
  "pt-BR": { title: "Ops, você achou um monstrinho perdido!", message: "Esta página sumiu. Vamos voltar aos jogos!", home: "Voltar ao início", language: "Idioma" },
  fr: { title: "Oups, voici un petit monstre perdu !", message: "Cette page est introuvable. Retournons aux jeux !", home: "Retour à l’accueil", language: "Langue" },
  ar: { title: "عفوًا، وجدت وحشًا صغيرًا تائهًا!", message: "هذه الصفحة غير موجودة. لنعد إلى الألعاب!", home: "العودة للرئيسية", language: "اللغة" },
  sw: { title: "Lo, umemkuta jitu mdogo aliyepotea!", message: "Ukurasa huu haupatikani. Turudi kwenye michezo!", home: "Rudi mwanzo", language: "Lugha" },
  id: { title: "Ups, kamu menemukan monster kecil yang tersesat!", message: "Halaman ini tidak ditemukan. Ayo kembali bermain!", home: "Kembali ke beranda", language: "Bahasa" },
  hi: { title: "अरे, एक नन्हा राक्षस रास्ता भूल गया!", message: "यह पेज नहीं मिला। चलो खेलों पर वापस चलते हैं!", home: "होम पर जाएँ", language: "भाषा" }
};

const languageNames: Record<Language, string> = {
  "zh-Hant": "繁體中文", en: "English", es: "Español", "pt-BR": "Português (BR)",
  fr: "Français", ar: "العربية", sw: "Kiswahili", id: "Bahasa Indonesia", hi: "हिन्दी"
};

function matchLanguage(value: string | null | undefined): Language | null {
  if (!value) return null;
  const tag = value.toLowerCase();
  if (tag.startsWith("zh")) return "zh-Hant";
  if (tag.startsWith("pt")) return "pt-BR";
  for (const language of Object.keys(copy) as Language[]) {
    if (tag === language.toLowerCase() || tag.startsWith(`${language.toLowerCase()}-`)) return language;
  }
  return null;
}

function Monster() {
  return (
    <svg className="lostMonster" viewBox="0 0 260 250" role="img" aria-label="Friendly waving little monster">
      <ellipse cx="130" cy="230" rx="78" ry="12" fill="#071d27" opacity=".35" />
      <path d="M77 64 Q61 40 67 24 Q88 34 100 52 M159 51 Q178 25 195 28 Q196 47 182 67" fill="#7bdcc8" stroke="#195d68" strokeWidth="6" strokeLinejoin="round" />
      <path d="M65 112 Q37 98 28 122 Q23 141 50 151 M193 111 Q223 83 236 109 Q244 127 220 143" fill="none" stroke="#67c9c2" strokeWidth="24" strokeLinecap="round" />
      <path d="M59 128 Q57 56 129 52 Q200 50 203 129 L203 181 Q200 223 130 221 Q57 220 57 181Z" fill="#75d8c4" stroke="#1f7080" strokeWidth="7" />
      <ellipse cx="102" cy="119" rx="21" ry="27" fill="#fffdf2" /><ellipse cx="158" cy="119" rx="21" ry="27" fill="#fffdf2" />
      <circle cx="107" cy="124" r="8" fill="#173947" /><circle cx="153" cy="124" r="8" fill="#173947" />
      <ellipse cx="83" cy="157" rx="13" ry="7" fill="#f7a8a2" opacity=".72" /><ellipse cx="177" cy="157" rx="13" ry="7" fill="#f7a8a2" opacity=".72" />
      <path d="M112 163 Q130 179 148 163" fill="none" stroke="#22525d" strokeWidth="6" strokeLinecap="round" />
      <path d="M91 218 L87 232 M169 218 L173 232" stroke="#1f7080" strokeWidth="11" strokeLinecap="round" />
      <path d="M219 143 L225 157 M235 136 L246 139" stroke="#67c9c2" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

export default function NotFound() {
  const [language, setLanguage] = useState<Language>("zh-Hant");
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("game-lab:language"); } catch { /* Storage is optional. */ }
    const params = new URLSearchParams(location.search);
    const resolved = matchLanguage(params.get("lang")) ?? matchLanguage(saved)
      ?? navigator.languages.map(matchLanguage).find((value): value is Language => value !== null)
      ?? "en";
    setLanguage(resolved);
  }, []);
  const t = copy[language];
  const homeHref = `/?lang=${encodeURIComponent(language)}`;
  return (
    <main id="main-content" className="notFoundPage" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="notFoundStars" aria-hidden="true">✦　✧　✦</div>
      <div className="notFoundCard">
        <label className="notFoundLanguage">{t.language}
          <select value={language} onChange={(event) => {
            const selected = event.target.value as Language;
            setLanguage(selected);
            try { localStorage.setItem("game-lab:language", selected); } catch { /* Optional. */ }
          }}>
            {(Object.keys(copy) as Language[]).map((name) => <option key={name} value={name}>{languageNames[name]}</option>)}
          </select>
        </label>
        <Monster />
        <div className="notFoundCode">404</div>
        <h1>{t.title}</h1>
        <p>{t.message}</p>
        <Link className="notFoundHome" href={homeHref}>{t.home} <span aria-hidden="true">↗</span></Link>
      </div>
    </main>
  );
}
