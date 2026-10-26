export type Subject="math"|"english";
export type Grade="middle"|"upper";
export type Lane=0|1|2;
export type ObstacleKind="hurdle"|"barrier";
export interface Question{prompt:string;options:[string,string,string];correctLane:Lane}
export interface Obstacle{lane:Lane;kind:ObstacleKind}
export interface ScoreState{score:number;combo:number;bestCombo:number;shields:number;answered:number;correct:number;obstaclesCleared:number}

function hash(seed:string):number{let value=2166136261;for(const char of seed){value^=char.charCodeAt(0);value=Math.imul(value,16777619)}return value>>>0}
function generator(seed:string,index:number,salt=0){let value=(hash(seed)^Math.imul(index+1,2246822519)^salt)>>>0;return()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296}}
function shuffle<T>(values:T[],random:()=>number):T[]{for(let i=values.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}return values}
function choiceQuestion(prompt:string,answers:string[],correct:string,random:()=>number):Question{const options=shuffle([...answers],random) as [string,string,string];return{prompt,options,correctLane:options.indexOf(correct) as Lane}}

const ENGLISH_MIDDLE=[
  ["I ___ a book every night.",["read","drink","jump"],"read"],["The sun is very ___.",["bright","slow","hungry"],"bright"],
  ["We ___ soccer after school.",["play","cook","sleep"],"play"],["A bird can ___.",["fly","write","drive"],"fly"],
  ["She is my best ___.",["friend","window","breakfast"],"friend"],["Please ___ the door.",["open","sing","swim"],"open"],
  ["The ice is ___.",["cold","loud","tall"],"cold"],["I wear shoes on my ___.",["feet","ears","desk"],"feet"]
] as const;
const ENGLISH_UPPER=[
  ["Please ___ the light before leaving.",["turn off","look after","give up"],"turn off"],["Mia was tired, ___ she finished the race.",["but","because","before"],"but"],
  ["The word closest to 'rapid' is ___.",["fast","quiet","heavy"],"fast"],["If you protect something, you keep it ___.",["safe","empty","noisy"],"safe"],
  ["We should ___ water during a drought.",["save","waste","spill"],"save"],["Leo is interested ___ science.",["in","on","at"],"in"],
  ["The opposite of 'ancient' is ___.",["modern","narrow","gentle"],"modern"],["I have lived here ___ three years.",["for","since","from"],"for"]
] as const;

export function createQuestion(seed:string,index:number,subject:Subject,grade:Grade):Question{
  const random=generator(seed,index);
  if(subject==="english"){const bank=grade==="middle"?ENGLISH_MIDDLE:ENGLISH_UPPER;const item=bank[Math.floor(random()*bank.length)];return choiceQuestion(item[0],[...item[1]],item[2],random)}
  let a=0,b=0,answer=0,operator="+";const kind=Math.floor(random()*(grade==="middle"?3:4));
  if(kind===0){const max=grade==="middle"?100:1000;a=Math.floor(random()*(max+1));b=Math.floor(random()*(max-a+1));answer=a+b}
  else if(kind===1){const max=grade==="middle"?100:1000;a=Math.max(1,Math.floor(random()*(max+1)));b=Math.floor(random()*(a+1));answer=a-b;operator="−"}
  else if(kind===2){const max=grade==="middle"?9:12;a=2+Math.floor(random()*(max-1));b=2+Math.floor(random()*(max-1));answer=a*b;operator="×"}
  else{b=2+Math.floor(random()*11);answer=2+Math.floor(random()*11);a=b*answer;operator="÷"}
  const limit=grade==="middle"?100:1000;const candidates=new Set<number>([answer]);const offsets=[1,-1,2,-2,3,-3,5,-5,10,-10];shuffle(offsets,random);
  for(const offset of offsets){const value=answer+offset;if(value>=0&&value<=limit)candidates.add(value);if(candidates.size===3)break}for(let value=0;candidates.size<3;value++)candidates.add(value);
  return choiceQuestion(`${a} ${operator} ${b} = ?`,[...candidates].map(String),String(answer),random)
}

export function createObstacle(seed:string,index:number):Obstacle{const random=generator(seed,index,0x51f15e);return{lane:Math.floor(random()*3) as Lane,kind:random()>.48?"hurdle":"barrier"}}
export function initialScore():ScoreState{return{score:0,combo:0,bestCombo:0,shields:3,answered:0,correct:0,obstaclesCleared:0}}
export function resolveGate(state:ScoreState,chosen:Lane,question:Question,boosted=false):{state:ScoreState;correct:boolean;points:number}{const correct=chosen===question.correctLane;const combo=correct?state.combo+1:0;const points=correct?100+Math.min(200,(combo-1)*20)+(boosted?50:0):0;return{correct,points,state:{...state,score:state.score+points,combo,bestCombo:Math.max(state.bestCombo,combo),shields:Math.max(0,state.shields-(correct?0:1)),answered:state.answered+1,correct:state.correct+(correct?1:0)}}}
export function resolveObstacle(state:ScoreState,safe:boolean,boosted=false):ScoreState{return safe?{...state,score:state.score+(boosted?50:25),obstaclesCleared:state.obstaclesCleared+1}:{...state,combo:0,shields:Math.max(0,state.shields-1)}}
