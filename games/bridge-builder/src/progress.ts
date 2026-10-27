import { puzzles } from "./bridge-model";
export interface Progress { level: number; tests: number }
export function readProgress(raw:string|null):Progress|null{
  try{if(!raw||raw.length>128)return null;const v=JSON.parse(raw);if(v.version!==1||!Number.isInteger(v.level)||v.level<0||v.level>=puzzles.length||!Number.isInteger(v.tests)||v.tests<0||v.tests>100000)return null;return{level:v.level,tests:v.tests}}catch{return null}
}
