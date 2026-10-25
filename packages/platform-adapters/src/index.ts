export interface PlatformAdapter {
  readonly name: "portal" | "standalone" | "crazygames" | "poki";
  gameplayStart(): void;
  gameplayStop(): void;
  requestInterstitial(): Promise<"completed" | "skipped" | "unavailable">;
}

export const standaloneAdapter: PlatformAdapter = {
  name: "standalone",
  gameplayStart: () => undefined,
  gameplayStop: () => undefined,
  requestInterstitial: async () => "unavailable"
};

/** Pick the instruction that matches the primary input device. */
export function inputInstruction(keyboard: string, touch: string, coarsePointer: boolean): string {
  return coarsePointer ? touch : keyboard;
}

/** A shared query so every standalone game treats touch input the same way. */
export function touchPointerQuery(): MediaQueryList {
  return window.matchMedia("(pointer: coarse)");
}

const homeExitCopy = {
  "zh-Hant": "放棄本局，回首頁", en: "Leave game and go home", es: "Salir del juego e ir al inicio",
  "pt-BR": "Sair do jogo e voltar ao início", fr: "Quitter la partie et revenir à l’accueil",
  ar: "اترك اللعبة وعد إلى الرئيسية", sw: "Acha mchezo, rudi mwanzo",
  id: "Keluar dari permainan, kembali ke beranda", hi: "खेल छोड़ें, होम पर जाएँ"
} as const;

export type HomeExitLanguage = keyof typeof homeExitCopy;

export function homeExitLabel(language: string): string {
  return homeExitCopy[language as HomeExitLanguage] ?? homeExitCopy.en;
}

/** Keep this link outside game overlays so leaving is always possible. */
export function mountHomeExit(actions: HTMLElement, language: string): { updateLanguage: (language: string) => void } {
  const link = document.createElement("a");
  link.className = "home-exit";
  link.href = "/";
  link.target = "_top";
  link.innerHTML = '<span aria-hidden="true">⌂</span><span class="home-exit-text"></span>';
  actions.prepend(link);
  const updateLanguage = (nextLanguage: string): void => {
    const label = homeExitLabel(nextLanguage);
    link.setAttribute("aria-label", label);
    link.title = label;
    link.querySelector<HTMLElement>(".home-exit-text")!.textContent = label;
  };
  updateLanguage(language);
  return { updateLanguage };
}
