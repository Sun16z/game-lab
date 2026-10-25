import type { AudioChannel, GameAudio } from "./index";

const copy = {
  "zh-Hant": { button: "聲音設定", sfx: "音效", music: "配樂", voice: "配音", quiet: "安靜模式", unavailable: "此語言配音待審聽" },
  en: { button: "Sound settings", sfx: "Effects", music: "Music", voice: "Voice", quiet: "Quiet mode", unavailable: "Voice pending review" },
  es: { button: "Ajustes de sonido", sfx: "Efectos", music: "Música", voice: "Voz", quiet: "Modo tranquilo", unavailable: "Voz pendiente de revisión" },
  "pt-BR": { button: "Configurações de som", sfx: "Efeitos", music: "Música", voice: "Voz", quiet: "Modo silencioso", unavailable: "Voz em revisão" },
  fr: { button: "Réglages du son", sfx: "Effets", music: "Musique", voice: "Voix", quiet: "Mode calme", unavailable: "Voix à vérifier" },
  ar: { button: "إعدادات الصوت", sfx: "المؤثرات", music: "الموسيقى", voice: "الصوت", quiet: "الوضع الهادئ", unavailable: "الصوت قيد المراجعة" },
  sw: { button: "Mipangilio ya sauti", sfx: "Athari", music: "Muziki", voice: "Sauti", quiet: "Hali tulivu", unavailable: "Sauti inasubiri ukaguzi" },
  id: { button: "Pengaturan suara", sfx: "Efek", music: "Musik", voice: "Suara", quiet: "Mode tenang", unavailable: "Suara menunggu tinjauan" },
  hi: { button: "ध्वनि सेटिंग", sfx: "प्रभाव", music: "संगीत", voice: "आवाज़", quiet: "शांत मोड", unavailable: "आवाज़ की जाँच बाकी" }
} as const;
export type AudioLanguage = keyof typeof copy;

export function mountAudioControls(button: HTMLButtonElement, audio: GameAudio, language: AudioLanguage): { updateLanguage: (language: AudioLanguage) => void } {
  const panel = document.createElement("div");
  panel.className = "audio-panel hidden";
  panel.id = `${button.id}-panel`;
  panel.setAttribute("role", "group");
  button.setAttribute("aria-controls", panel.id);
  button.setAttribute("aria-expanded", "false");
  button.parentElement?.append(panel);
  let current = language;
  const refresh = () => {
    const t = copy[current];
    const settings = audio.getSettings();
    button.textContent = settings.quiet ? "🔈" : !settings.sfx.enabled && !settings.music.enabled && !settings.voice.enabled ? "🔇" : "🔊";
    button.setAttribute("aria-label", t.button);
    button.title = t.button;
    panel.setAttribute("aria-label", t.button);
    panel.replaceChildren();
    for (const channel of ["sfx", "music", "voice"] as const) {
      const row = document.createElement("label");
      row.className = "audio-row";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = settings[channel].enabled;
      checkbox.addEventListener("change", () => { audio.setChannel(channel, checkbox.checked); refresh(); });
      const name = document.createElement("span");
      name.textContent = t[channel];
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = "0"; slider.max = "100"; slider.step = "5";
      slider.value = String(Math.round(settings[channel].volume * 100));
      slider.setAttribute("aria-label", `${t[channel]} ${Math.round(settings[channel].volume * 100)}%`);
      slider.addEventListener("input", () => { audio.setVolume(channel, Number(slider.value) / 100); slider.setAttribute("aria-label", `${t[channel]} ${slider.value}%`); });
      row.append(checkbox, name, slider);
      panel.append(row);
    }
    const quiet = document.createElement("label");
    quiet.className = "audio-row audio-quiet";
    const quietBox = document.createElement("input");
    quietBox.type = "checkbox";
    quietBox.checked = settings.quiet;
    quietBox.addEventListener("change", () => { audio.setQuiet(quietBox.checked); refresh(); });
    const quietName = document.createElement("span");
    quietName.textContent = t.quiet;
    quiet.append(quietBox, quietName);
    panel.append(quiet);
    if (!audio.hasVoice(current)) {
      const note = document.createElement("small");
      note.className = "audio-note";
      note.textContent = t.unavailable;
      panel.append(note);
    }
  };
  button.addEventListener("click", () => {
    audio.unlock();
    const opening = panel.classList.contains("hidden");
    panel.classList.toggle("hidden", !opening);
    button.setAttribute("aria-expanded", String(opening));
  });
  document.addEventListener("pointerdown", (event) => {
    if (!button.parentElement?.contains(event.target as Node)) {
      panel.classList.add("hidden");
      button.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { panel.classList.add("hidden"); button.setAttribute("aria-expanded", "false"); }
  });
  refresh();
  return { updateLanguage(next) { current = next; refresh(); } };
}
