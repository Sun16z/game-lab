import { GameAudio } from "@game-lab/game-audio";

export function createColorAudio(storage: Pick<Storage, "getItem" | "setItem"> | undefined): GameAudio {
  return new GameAudio({
    cues: {
      select: [0.23, 0, 510, 0.005, 0.025, 0.08, 0, 1, 45],
      pour: [0.3, 0, 440, 0.006, 0.06, 0.14, 0, 1, -60],
      invalid: [0.19, 0, 300, 0.008, 0.035, 0.12, 0, 1, -45],
      undo: [0.2, 0, 360, 0.005, 0.04, 0.1, 0, 1, 45],
      hint: [0.24, 0, 660, 0.005, 0.07, 0.18, 0, 1, 85],
      win: [0.31, 0, 560, 0.005, 0.09, 0.25, 0, 1, 130]
    },
    music: { main: ["./audio/color-loop-v2.webm", "./audio/color-loop-v2.mp3"] }
  }, storage);
}
