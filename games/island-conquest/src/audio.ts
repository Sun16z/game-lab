import { GameAudio } from "@game-lab/game-audio";

export function createIslandAudio(storage: Pick<Storage, "getItem" | "setItem"> | undefined): GameAudio {
  return new GameAudio({
    cues: {
      select: [0.2, 0, 520, 0.004, 0.025, 0.08, 0, 1, 25],
      rotate: [0.19, 0, 620, 0.004, 0.025, 0.08, 0, 1, 65],
      place: [0.25, 0, 410, 0.005, 0.06, 0.15, 0, 1, 60],
      link: [0.26, 0, 550, 0.005, 0.07, 0.19, 0, 1, 100],
      claim: [0.3, 0, 650, 0.005, 0.08, 0.25, 0, 1, 170],
      finish: [0.27, 0, 560, 0.008, 0.1, 0.28, 0, 1, 120]
    },
    music: { main: ["./audio/bach-bwv846.webm", "./audio/bach-bwv846.mp3"] }
  }, storage);
}
