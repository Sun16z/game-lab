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
