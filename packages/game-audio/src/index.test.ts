import { describe, expect, it } from "vitest";
import { canPlayCue, channelGain, DEFAULT_AUDIO_SETTINGS, normalizeAudioSettings, readAudioSettings } from "./index";

describe("audio preferences and gain", () => {
  it("defaults to three enabled channels and clamps corrupt volumes", () => {
    expect(normalizeAudioSettings(null)).toEqual(DEFAULT_AUDIO_SETTINGS);
    expect(normalizeAudioSettings({ sfx: { enabled: false, volume: 9 }, music: { volume: -2 }, voice: { volume: "loud" } })).toMatchObject({
      sfx: { enabled: false, volume: 1 }, music: { enabled: true, volume: 0 }, voice: { enabled: true, volume: 0.8 }
    });
  });
  it("falls back safely if stored JSON is malformed", () => {
    expect(readAudioSettings({ get: () => "not-json", set: () => true })).toEqual(DEFAULT_AUDIO_SETTINGS);
  });
  it("caps master gain and ducks music while voice is active", () => {
    expect(channelGain(DEFAULT_AUDIO_SETTINGS, "sfx")).toBeCloseTo(0.49);
    expect(channelGain(DEFAULT_AUDIO_SETTINGS, "music", true)).toBeCloseTo(0.0735);
    expect(channelGain({ ...DEFAULT_AUDIO_SETTINGS, quiet: true }, "music")).toBe(0);
    expect(channelGain({ ...DEFAULT_AUDIO_SETTINGS, quiet: true }, "sfx")).toBeCloseTo(0.49);
  });
  it("limits repeated cues to one per 80 milliseconds", () => {
    expect(canPlayCue(undefined, 0)).toBe(true);
    expect(canPlayCue(100, 179)).toBe(false);
    expect(canPlayCue(100, 180)).toBe(true);
  });
});
