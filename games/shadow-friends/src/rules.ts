export type Shape="bird"|"rabbit"|"butterfly"|"fish"|"cat"|"turtle"|"snail"|"whale"|"mushroom"|"duck";
export type Puzzle=Readonly<{shape:Shape; target:number; symmetry:number}>;
export const puzzles:readonly Puzzle[]=[
 {shape:"bird",target:1,symmetry:8},{shape:"rabbit",target:1,symmetry:8},{shape:"butterfly",target:2,symmetry:4},
 {shape:"fish",target:2,symmetry:8},{shape:"cat",target:2,symmetry:8},{shape:"turtle",target:3,symmetry:8},
 {shape:"snail",target:3,symmetry:8},{shape:"whale",target:3,symmetry:8},{shape:"mushroom",target:4,symmetry:8},{shape:"duck",target:4,symmetry:8}
];
export type State=Readonly<{index:number; rotation:number; moves:number; completed:boolean}>;
export const initialState=():State=>({index:0,rotation:0,moves:0,completed:false});
export function readProgress(raw:string|null):State|null{try{if(!raw||raw.length>128)return null;const v=JSON.parse(raw);if(v.version!==2||!Number.isInteger(v.index)||v.index<0||v.index>=puzzles.length||!Number.isInteger(v.moves)||v.moves<0||v.moves>100000)return null;return{index:v.index,rotation:0,moves:v.moves,completed:false}}catch{return null}}
export function rotate(s:State,step:number):State{if(s.completed||![-1,1].includes(step))return s;return {...s,rotation:(s.rotation+step+8)%8,moves:s.moves+1};}
export function matched(s:State):boolean{const p=puzzles[s.index];return !!p&&((s.rotation-p.target+8)%p.symmetry===0);}
export function confirm(s:State):State{if(s.completed||!matched(s))return s;if(s.index===puzzles.length-1)return {...s,completed:true};return {...s,index:s.index+1,rotation:0};}
