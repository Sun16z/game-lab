export type Theme = "classic" | "neon" | "cosmos";
export type Achievement = "ten_layers" | "five_perfect" | "hundred_layers";

export interface Progress {
  totalLayers: number;
  selectedTheme: Theme;
  achievements: Achievement[];
}

export const themeThresholds: Record<Theme, number> = { classic: 0, neon: 10, cosmos: 30 };
export const achievementOrder: Achievement[] = ["ten_layers", "five_perfect", "hundred_layers"];

export function isThemeUnlocked(theme: Theme, totalLayers: number): boolean {
  return totalLayers >= themeThresholds[theme];
}

export function advanceProgress(previous: Progress, layers: number, longestCombo: number): { progress: Progress; gained: Achievement[]; unlocked: Theme[] } {
  const totalLayers = previous.totalLayers + Math.max(0, Math.floor(layers));
  const reached = achievementOrder.filter((achievement) =>
    achievement === "ten_layers" ? layers >= 10
      : achievement === "five_perfect" ? longestCombo >= 5 : layers >= 100
  );
  const gained = reached.filter((achievement) => !previous.achievements.includes(achievement));
  const unlocked = (["neon", "cosmos"] as Theme[]).filter((theme) =>
    !isThemeUnlocked(theme, previous.totalLayers) && isThemeUnlocked(theme, totalLayers)
  );
  return {
    progress: { totalLayers, selectedTheme: previous.selectedTheme, achievements: [...previous.achievements, ...gained] },
    gained,
    unlocked
  };
}

const KEY = "game-lab:G001:progress";
export function loadProgress(storage: Pick<Storage, "getItem"> | undefined): Progress {
  try {
    const value = JSON.parse(storage?.getItem(KEY) ?? "null") as Partial<Progress> | null;
    const totalLayers = Number.isSafeInteger(value?.totalLayers) && (value?.totalLayers ?? -1) >= 0 ? value!.totalLayers! : 0;
    const selectedTheme = value?.selectedTheme;
    const theme: Theme = selectedTheme === "neon" || selectedTheme === "cosmos" ? selectedTheme : "classic";
    const achievements = Array.isArray(value?.achievements)
      ? achievementOrder.filter((item) => value.achievements?.includes(item)) : [];
    return { totalLayers, selectedTheme: isThemeUnlocked(theme, totalLayers) ? theme : "classic", achievements };
  } catch {
    return { totalLayers: 0, selectedTheme: "classic", achievements: [] };
  }
}

export function saveProgress(storage: Pick<Storage, "setItem"> | undefined, progress: Progress): void {
  try { storage?.setItem(KEY, JSON.stringify(progress)); } catch { /* Optional local progress. */ }
}
