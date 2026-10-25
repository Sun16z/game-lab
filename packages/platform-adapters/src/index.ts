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
