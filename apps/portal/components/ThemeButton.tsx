"use client";
import { useEffect, useState } from "react";
import { Desktop, Moon, Sun } from "@phosphor-icons/react";

type Mode = "system" | "light" | "dark";
declare global { interface Window { gameLabTheme: { get(): Mode; set(mode: Mode): void } } }
const labels: Record<string, [string, string, string, string]> = {
  "zh": ["主題", "跟隨系統", "亮色", "暗色"], en: ["Theme", "System", "Light", "Dark"], es: ["Tema", "Sistema", "Claro", "Oscuro"],
  pt: ["Tema", "Sistema", "Claro", "Escuro"], fr: ["Thème", "Système", "Clair", "Sombre"], ar: ["المظهر", "النظام", "فاتح", "داكن"],
  sw: ["Mandhari", "Mfumo", "Angavu", "Giza"], id: ["Tema", "Sistem", "Terang", "Gelap"], hi: ["थीम", "सिस्टम", "हल्का", "गहरा"]
};
const modes: Mode[] = ["system", "light", "dark"];
export function ThemeButton() {
  const [mode, setMode] = useState<Mode>("system");
  const [lang, setLang] = useState("zh");
  useEffect(() => {
    const update = () => { setMode(window.gameLabTheme?.get() ?? "system"); setLang((new URLSearchParams(location.search).get("lang") || document.documentElement.lang || "zh").split("-")[0].toLowerCase()); };
    update(); window.addEventListener("game-lab:theme-change", update);
    const observer = new MutationObserver(update); observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => { observer.disconnect(); window.removeEventListener("game-lab:theme-change", update); };
  }, []);
  const index = modes.indexOf(mode), words = labels[lang] ?? labels.en;
  const Icon = mode === "system" ? Desktop : mode === "light" ? Sun : Moon;
  return <button className="themeButton" type="button" aria-label={`${words[0]}：${words[index + 1]}`} title={`${words[0]}：${words[index + 1]}`} onClick={() => window.gameLabTheme.set(modes[(index + 1) % 3])}><Icon size={22} aria-hidden="true" /><span className="srOnly">{words[0]}：{words[index + 1]}</span></button>;
}
