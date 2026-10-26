import { GameAudio } from "@game-lab/game-audio";

export function createRunnerAudio(storage:Pick<Storage,"getItem"|"setItem">|undefined):GameAudio{return new GameAudio({
  cues:{move:[.12,0,440,.004,.02,.07,0,1,40],jump:[.16,0,520,.004,.05,.12,0,1,130],boost:[.2,0,360,.004,.08,.24,0,1,230],clear:[.18,0,760,.004,.04,.15,0,1,110],hit:[.14,0,210,.006,.09,.17,0,1,-80],correct:[.24,0,690,.004,.06,.18,0,1,145],wrong:[.14,0,260,.006,.08,.14,0,1,-35],combo:[.25,0,820,.004,.08,.22,0,1,180],start:[.2,0,510,.005,.07,.18,0,1,90],finish:[.27,0,620,.006,.12,.3,0,1,150]},
  music:{main:["./audio/runner-loop.webm","./audio/runner-loop.mp3"]}
},storage)}
