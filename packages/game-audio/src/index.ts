import { createLocalPreferenceStorage, type PreferenceStorage } from "@game-lab/game-storage";
import type { Howl } from "howler";

export type AudioChannel = "sfx" | "music" | "voice";
export type ChannelSetting = { enabled: boolean; volume: number };
export type AudioSettings = Record<AudioChannel, ChannelSetting> & { quiet: boolean };
export type SoundCue = readonly number[];
type ZzfxEngine = { volume: number; audioContext: AudioContext; play: (...parameters: number[]) => AudioBufferSourceNode };
export type AudioManifest = {
  cues: Record<string, SoundCue>;
  music?: Record<string, readonly string[]>;
  voice?: Record<string, Record<string, readonly string[]>>;
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  sfx: { enabled: true, volume: 0.7 },
  music: { enabled: true, volume: 0.35 },
  voice: { enabled: true, volume: 0.8 },
  quiet: false
};
const STORAGE_KEY = "audio:v1";
const MASTER_GAIN = 0.7;
const CUE_INTERVAL_MS = 80;

function boundedVolume(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : fallback;
}

export function normalizeAudioSettings(value: unknown): AudioSettings {
  const candidate = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const channel = (name: AudioChannel): ChannelSetting => {
    const source = candidate[name] && typeof candidate[name] === "object" ? candidate[name] as Record<string, unknown> : {};
    return {
      enabled: typeof source.enabled === "boolean" ? source.enabled : DEFAULT_AUDIO_SETTINGS[name].enabled,
      volume: boundedVolume(source.volume, DEFAULT_AUDIO_SETTINGS[name].volume)
    };
  };
  return { sfx: channel("sfx"), music: channel("music"), voice: channel("voice"), quiet: candidate.quiet === true };
}

export function readAudioSettings(storage: PreferenceStorage): AudioSettings {
  try { return normalizeAudioSettings(JSON.parse(storage.get(STORAGE_KEY) ?? "null")); }
  catch { return normalizeAudioSettings(null); }
}

export function channelGain(settings: AudioSettings, channel: AudioChannel, voiceActive = false): number {
  if (!settings[channel].enabled || (settings.quiet && channel !== "sfx")) return 0;
  return MASTER_GAIN * settings[channel].volume * (channel === "music" && voiceActive ? 0.3 : 1);
}

export function canPlayCue(lastPlayedAt: number | undefined, now: number): boolean {
  return lastPlayedAt === undefined || now - lastPlayedAt >= CUE_INTERVAL_MS;
}

export class GameAudio {
  private readonly storage: PreferenceStorage;
  private settings: AudioSettings;
  private unlocked = false;
  private active = false;
  private zzfx: ZzfxEngine | null = null;
  private howlerModule: Promise<typeof import("howler")> | null = null;
  private musicHowl: Howl | null = null;
  private voiceHowl: Howl | null = null;
  private track: string | null = null;
  private voiceActive = false;
  private lastPlayed = new Map<string, number>();
  private generation = 0;

  constructor(private readonly manifest: AudioManifest, localStorage: Pick<Storage, "getItem" | "setItem"> | undefined) {
    this.storage = createLocalPreferenceStorage(localStorage);
    this.settings = readAudioSettings(this.storage);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.stopVoice();
      this.syncMusic();
    });
  }

  getSettings(): AudioSettings { return structuredClone(this.settings); }
  hasVoice(locale: string): boolean { return Object.keys(this.manifest.voice?.[locale] ?? {}).length > 0; }

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    // ZzFX does not ship TypeScript declarations; Vite still bundles this lazy import.
    // @ts-expect-error upstream package has no declaration file
    void import("zzfx").then(({ ZZFX }: { ZZFX: ZzfxEngine }) => { this.zzfx = ZZFX; }).catch(() => undefined);
    this.howlerModule = import("howler");
  }

  play(cue: string, semitones = 0): boolean {
    if (!this.unlocked || channelGain(this.settings, "sfx") === 0 || !this.zzfx) return false;
    const preset = this.manifest.cues[cue];
    if (!preset) return false;
    const now = performance.now();
    if (!canPlayCue(this.lastPlayed.get(cue), now)) return false;
    this.lastPlayed.set(cue, now);
    try {
      this.zzfx.volume = channelGain(this.settings, "sfx") * 0.3;
      if (this.zzfx.audioContext.state === "suspended") void this.zzfx.audioContext.resume();
      const parameters = [...preset];
      if (parameters[2]) parameters[2] *= Math.pow(2, semitones / 12);
      this.zzfx.play(...parameters);
      return true;
    } catch { return false; }
  }

  music(track: string | null): void {
    if (this.track === track && this.musicHowl) return;
    this.track = track;
    this.generation += 1;
    this.musicHowl?.stop();
    this.musicHowl?.unload();
    this.musicHowl = null;
    if (track) void this.startMusic(track, this.generation);
  }

  private async startMusic(track: string, generation: number): Promise<void> {
    const src = this.manifest.music?.[track];
    if (!this.unlocked || !src?.length || !this.howlerModule || channelGain(this.settings, "music") === 0) return;
    try {
      const { Howl } = await this.howlerModule;
      if (this.generation !== generation || this.track !== track) return;
      const howl = new Howl({ src: [...src], loop: true, volume: 0, preload: false, html5: true });
      this.musicHowl = howl;
      howl.once("load", () => {
        if (this.generation !== generation || this.musicHowl !== howl || !this.active || document.hidden || channelGain(this.settings, "music") === 0) return;
        howl.play();
        howl.fade(0, channelGain(this.settings, "music", this.voiceActive), 350);
      });
      howl.load();
    } catch { /* Sound is optional. */ }
  }

  async say(cue: string, locale: string): Promise<boolean> {
    const src = this.manifest.voice?.[locale]?.[cue];
    if (!this.unlocked || !src?.length || !this.howlerModule || channelGain(this.settings, "voice") === 0) return false;
    try {
      const { Howl } = await this.howlerModule;
      this.voiceHowl?.stop();
      this.voiceHowl?.unload();
      const howl = new Howl({ src: [...src], volume: channelGain(this.settings, "voice"), preload: false });
      this.voiceHowl = howl;
      howl.once("load", () => {
        if (this.voiceHowl !== howl || channelGain(this.settings, "voice") === 0) return;
        this.voiceActive = true;
        this.updateMusicVolume();
        howl.play();
      });
      const finish = () => {
        if (this.voiceHowl !== howl) return;
        this.voiceActive = false;
        this.updateMusicVolume();
        howl.unload();
        this.voiceHowl = null;
      };
      howl.once("end", finish);
      howl.once("loaderror", finish);
      howl.once("playerror", finish);
      howl.load();
      return true;
    } catch { return false; }
  }

  setChannel(channel: AudioChannel, enabled: boolean): void {
    this.settings = { ...this.settings, [channel]: { ...this.settings[channel], enabled } };
    this.persist();
    if (channel === "music") this.syncMusic();
    if (channel === "voice" && !enabled) this.stopVoice();
  }

  setVolume(channel: AudioChannel, volume: number): void {
    this.settings = { ...this.settings, [channel]: { ...this.settings[channel], volume: boundedVolume(volume, this.settings[channel].volume) } };
    this.persist();
    if (channel === "music") this.syncMusic();
    if (channel === "voice" && this.voiceHowl) this.voiceHowl.volume(channelGain(this.settings, "voice"));
  }

  setQuiet(quiet: boolean): void {
    this.settings = { ...this.settings, quiet };
    this.persist();
    this.syncMusic();
    if (quiet) this.stopVoice();
  }

  resume(): void { this.active = true; this.syncMusic(); }
  pause(): void {
    this.active = false;
    this.syncMusic();
    this.stopVoice();
  }

  private syncMusic(): void {
    const gain = channelGain(this.settings, "music", this.voiceActive);
    const howl = this.musicHowl;
    if (gain === 0 || !this.active || document.hidden) {
      if (howl?.playing()) {
        howl.fade(howl.volume(), 0, 180);
        window.setTimeout(() => {
          if (this.musicHowl === howl && (!this.active || document.hidden || channelGain(this.settings, "music", this.voiceActive) === 0)) howl.pause();
        }, 190);
      }
      return;
    }
    if (!howl && this.track) { this.music(this.track); return; }
    if (howl && howl.state() === "loaded") {
      if (!howl.playing()) howl.play();
      howl.fade(howl.volume(), gain, 350);
    }
  }

  private updateMusicVolume(): void {
    const howl = this.musicHowl;
    if (howl?.playing()) howl.fade(howl.volume(), channelGain(this.settings, "music", this.voiceActive), 150);
  }
  private stopVoice(): void {
    this.voiceHowl?.stop(); this.voiceHowl?.unload(); this.voiceHowl = null;
    this.voiceActive = false;
    this.updateMusicVolume();
  }
  private persist(): void { this.storage.set(STORAGE_KEY, JSON.stringify(this.settings)); }
}
