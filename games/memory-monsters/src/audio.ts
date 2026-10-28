import { GameAudio } from "@game-lab/game-audio";

export function createMemoryAudio(storage: Pick<Storage,"getItem"|"setItem">|undefined):GameAudio{
  return new GameAudio({
    cues:{ reveal:[.16,0,650,.004,.025,.08,0,1,45], flip:[.2,0,480,.004,.04,.1,0,1,60], match:[.28,0,720,.004,.08,.22,0,1,140], retry:[.12,0,340,.006,.08,.12,0,1,-45], finish:[.3,0,590,.008,.12,.32,0,1,180] },
    music:{main:["./audio/bach-bwv846.webm","./audio/bach-bwv846.mp3"]},
    voice:{"zh-Hant":{
      listen:["./audio/voice/zh-Hant-listen.webm","./audio/voice/zh-Hant-listen.mp3"],
      choose:["./audio/voice/zh-Hant-choose.webm","./audio/voice/zh-Hant-choose.mp3"],
      matched:["./audio/voice/zh-Hant-matched.webm","./audio/voice/zh-Hant-matched.mp3"],
      again:["./audio/voice/zh-Hant-again.webm","./audio/voice/zh-Hant-again.mp3"],
      complete:["./audio/voice/zh-Hant-complete.webm","./audio/voice/zh-Hant-complete.mp3"]
    }}
  },storage);
}
