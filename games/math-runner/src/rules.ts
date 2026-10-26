export type Mode = "warmup" | "city";
export type Lane = 0 | 1 | 2;
export interface Question { a:number; b:number; operator:"+"|"−"; answer:number; options:[number,number,number]; correctLane:Lane }
export interface ScoreState { score:number; combo:number; bestCombo:number; shields:number; answered:number; correct:number }

function hash(seed:string):number{let value=2166136261;for(const char of seed){value^=char.charCodeAt(0);value=Math.imul(value,16777619)}return value>>>0}
function generator(seed:string,index:number){let value=(hash(seed)^Math.imul(index+1,2246822519))>>>0;return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296}}
function shuffle<T>(values:T[],random:()=>number):T[]{for(let i=values.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}return values}

export function createQuestion(seed:string,index:number,mode:Mode):Question{
  const random=generator(seed,index);const max=mode==="warmup"?20:100;const addition=random()>.46;let a:number,b:number,answer:number,operator:"+"|"−";
  if(addition){a=Math.floor(random()*(max+1));b=Math.floor(random()*(max-a+1));answer=a+b;operator="+"}
  else{a=Math.max(1,Math.floor(random()*(max+1)));b=Math.floor(random()*(a+1));answer=a-b;operator="−"}
  const candidates=new Set<number>([answer]);const offsets=[1,-1,2,-2,3,-3,5,-5,10,-10];
  shuffle(offsets,random);for(const offset of offsets){const value=answer+offset;if(value>=0&&value<=max)candidates.add(value);if(candidates.size===3)break}
  for(let value=0;candidates.size<3&&value<=max;value++)candidates.add(value);
  const options=shuffle([...candidates],random) as [number,number,number];
  return{a,b,operator,answer,options,correctLane:options.indexOf(answer) as Lane}
}

export function initialScore():ScoreState{return{score:0,combo:0,bestCombo:0,shields:3,answered:0,correct:0}}
export function resolveGate(state:ScoreState,chosen:Lane,question:Question):{state:ScoreState;correct:boolean;points:number}{
  const correct=chosen===question.correctLane;const combo=correct?state.combo+1:0;const points=correct?100+Math.min(200,(combo-1)*20):0;
  return{correct,points,state:{score:state.score+points,combo,bestCombo:Math.max(state.bestCombo,combo),shields:Math.max(0,state.shields-(correct?0:1)),answered:state.answered+1,correct:state.correct+(correct?1:0)}}
}
