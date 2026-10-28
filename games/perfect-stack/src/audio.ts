import { GameAudio } from "@game-lab/game-audio";
import { getApprovedPraiseVoice } from "@game-lab/locale-voice";

export function createStackAudio(storage: Pick<Storage, "getItem" | "setItem"> | undefined): GameAudio {
  return new GameAudio({
    cues: {
      drop: [0.35, 0, 330, 0.005, 0.035, 0.09, 0, 1, -70],
      perfect: [0.3, 0, 520, 0.005, 0.05, 0.12, 0, 1, 30],
      bullseye: [0.3, 0, 680, 0.005, 0.06, 0.15, 0, 1, 65],
      finish: [0.22, 0, 290, 0.01, 0.07, 0.15, 0, 1, -65]
    },
    music: { main: ["./audio/mozart-k545.webm", "./audio/mozart-k545.mp3"] },
    voice: getApprovedPraiseVoice("perfect-stack")
  }, storage);
}
