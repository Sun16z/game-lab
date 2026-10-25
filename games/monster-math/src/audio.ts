import { GameAudio } from "@game-lab/game-audio";
import { getApprovedPraiseVoice } from "@game-lab/locale-voice";

export function createMonsterAudio(storage: Pick<Storage, "getItem" | "setItem"> | undefined): GameAudio {
  return new GameAudio({
    cues: {
      correct: [0.3, 0, 490, 0.005, 0.045, 0.11, 0, 1, 50],
      wrong: [0.2, 0, 310, 0.005, 0.035, 0.12, 0, 1, -60],
      boss: [0.32, 0, 370, 0.01, 0.065, 0.14, 0, 1, 70],
      victory: [0.3, 0, 660, 0.005, 0.07, 0.17, 0, 1, 45]
    },
    music: { main: ["./audio/monster-loop.webm", "./audio/monster-loop.mp3"] },
    voice: getApprovedPraiseVoice("monster-math")
  }, storage);
}
