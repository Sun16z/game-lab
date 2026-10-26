import { GameAudio } from "@game-lab/game-audio";

export function createRunnerAudio(storage:Pick<Storage,"getItem"|"setItem">|undefined):GameAudio{return new GameAudio({
  cues:{move:[.12,0,440,.004,.02,.07,0,1,40],correct:[.24,0,690,.004,.06,.18,0,1,145],wrong:[.14,0,260,.006,.08,.14,0,1,-35],combo:[.25,0,820,.004,.08,.22,0,1,180],start:[.2,0,510,.005,.07,.18,0,1,90],finish:[.27,0,620,.006,.12,.3,0,1,150]},
  music:{main:["./audio/runner-loop.webm","./audio/runner-loop.mp3"]}
},storage)}
