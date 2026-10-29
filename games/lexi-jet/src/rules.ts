import type {GradeBand} from './content-types';
import {questionBank} from './question-bank';
import {closestShootableTarget,laneHasRoom,guardianLaneX,TARGET_ENTRY_Y} from './targets';
export const STEP=1/60,WIDTH=480,HEIGHT=640,TELEGRAPH=1.2;
export const LANES=[100,240,380] as const;
export interface Selection{band:GradeBand;level:number;seed:number;timed:boolean}
export interface Challenge extends Selection{v:1;target:number}
export interface Wave{corridor:number;width:number;pattern:number;questionIds:readonly string[]}
export interface Route extends Selection{biome:number;duration:number;goal:number;waves:Wave[];deck:string[];review:boolean}
export interface Bubble{id:number;x:number;y:number;r:number;speed:number}
export interface WordTarget{id:number;questionId:string;x:number;y:number;boss:boolean;wrongAt:number}
export interface Shot{x:number;y:number;toX:number;toY:number;good:boolean;at:number}
export interface Flight{phase:'flight'|'won'|'lost';x:number;y:number;time:number;flightTime:number;waveMotion:number;wave:number;hp:number;bomb:number;bubbles:Bubble[];targets:WordTarget[];stars:number;collected:number[];correct:number;answered:number;combo:number;peakCombo:number;frenzy:number;waveDamaged:boolean;weapon:0|1|2;focus:boolean;invulnerable:number;missed:string[];nextSpawn:number;nextTarget:number;nextShot:number;bossHp:number;bossStarted:boolean;shot:Shot|null;hintId:string|null;hintUntil:number}
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
export function random(seed:number){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296}}
export function createRoute(selection:Selection,reviewIds:readonly string[]=[]):Route{
 const level=clamp(Math.trunc(selection.level),0,11),rng=random(selection.seed+level*109+(selection.band==='upper'?601:0));
 const pool=questionBank.filter(q=>q.band===selection.band&&q.kind==='pos'&&(!reviewIds.length||reviewIds.includes(q.id)));
 const ids=(pool.length?pool:questionBank.filter(q=>q.band===selection.band&&q.kind==='pos')).map(q=>q.id).sort();
 for(let i=ids.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[ids[i],ids[j]]=[ids[j],ids[i]]}
 const first=Math.floor(rng()*3),waves=Array.from({length:8},(_,i)=>({corridor:LANES[(first+i)%3],width:Math.max(142,174-level*2),pattern:(i+level)%4,questionIds:[ids[i%ids.length]]}));
 return{...selection,level,biome:Math.floor(level/4),duration:60+2*level,goal:selection.band==='middle'?8:10,waves,deck:ids,review:reviewIds.length>0};
}
export function initialFlight():Flight{return{phase:'flight',x:240,y:520,time:0,flightTime:0,waveMotion:0,wave:0,hp:5,bomb:1,bubbles:[],targets:[],stars:0,collected:[],correct:0,answered:0,combo:0,peakCombo:0,frenzy:0,waveDamaged:false,weapon:0,focus:false,invulnerable:0,missed:[],nextSpawn:3,nextTarget:0,nextShot:0,bossHp:2,bossStarted:false,shot:null,hintId:null,hintUntil:0}}
export function currentId(s:Flight,r:Route){return s.targets[0]?.questionId??r.deck[0]}
export function safeTarget(s:Flight,r:Route){return r.waves[s.wave].corridor}
export function bubblePattern(r:Route,wave:number):Bubble[]{const w=r.waves[wave],out:Bubble[]=[];for(let row=0;row<6;row++)for(let col=0;col<9;col++){
 const offset=w.pattern===0?0:w.pattern===1?(row%2?16:-16):w.pattern===2?Math.sin(row*1.5)*20:(row%3-1)*22;
 const x=28+col*53+offset;if(x<15||x>465||Math.abs(x-w.corridor)<w.width/2+30)continue;
 if(w.pattern===1&&(col+row)%3===0||w.pattern===2&&col%2!==row%2||w.pattern===3&&(col+row)%4===0)continue;
 out.push({id:row*10+col,x,y:85-row*(w.pattern===2?76:94),r:13+(wave+r.level)%4,speed:108+r.level*2+row*2+(w.pattern===3?8:0)})}return out}
export interface Control{direction?:number;directionY?:number;target?:number;targetY?:number;focus?:boolean;weapon?:0|1|2}
export function selectWeapon(s:Flight,weapon:number):Flight{return s.phase==='flight'&&[0,1,2].includes(weapon)?{...s,weapon:weapon as 0|1|2}:s}
export function focusSpeed(r:Route){return r.timed?.65:.4}
export function spawnTarget(s:Flight,r:Route,boss=false):Flight{const x=safeTarget(s,r);if(!laneHasRoom(s.targets,x,boss))return s;const questionId=r.deck[s.nextTarget%r.deck.length],target:WordTarget={id:s.nextTarget,questionId,x,y:TARGET_ENTRY_Y,boss,wrongAt:-10};return{...s,nextTarget:s.nextTarget+1,targets:[...s.targets,target]}}
/** Actual auto-fire resolution: wrong guns bounce, leave the word alive and can be corrected. */
export function fire(s:Flight,r:Route):Flight{
 if(s.phase!=='flight'||s.time<s.nextShot)return s;
 const target=closestShootableTarget(s);
 if(!target)return{...s,nextShot:s.time+.22,shot:{x:s.x,y:s.y-20,toX:s.x,toY:-20,good:true,at:s.time}};
 const q=questionBank.find(q=>q.id===target.questionId)!;const good=q.correct===s.weapon;
 const shot={x:s.x,y:s.y-20,toX:target.x,toY:target.y+30,good,at:s.time};
 if(!good){if(s.time-target.wrongAt<1.1)return{...s,nextShot:s.time+.3,shot};return{...s,nextShot:s.time+.3,shot,combo:0,answered:s.answered+1,targets:s.targets.map(t=>t.id===target.id?{...t,wrongAt:s.time}:t),missed:[...new Set([...s.missed,q.id])],hintId:q.id,hintUntil:s.time+2};}
 const combo=s.combo+1;let next:Flight={...s,nextShot:s.time+.3,shot,targets:s.targets.filter(t=>t.id!==target.id),correct:s.correct+1,answered:s.answered+1,combo,peakCombo:Math.max(s.peakCombo,combo),frenzy:combo%5===0?2.4:s.frenzy,bossHp:s.bossHp-(target.boss?1:0)};
 if(target.boss&&next.bossHp>0)next=spawnTarget(next,r,true);return next;
}
/** All mission clocks advance in focus. Only motion slows; manual pause lives outside this function. */
export function stepFlight(s:Flight,r:Route,input:Control={},dt=STEP):Flight{
 if(s.phase!=='flight')return s;dt=clamp(dt,0,.1);const speed=input.focus?focusSpeed(r):1,motion=dt*speed;
 let n:Flight={...s,time:s.time+dt,flightTime:s.flightTime+motion,waveMotion:s.waveMotion+motion,focus:!!input.focus,weapon:input.weapon??s.weapon,invulnerable:Math.max(0,s.invulnerable-dt),frenzy:Math.max(0,s.frenzy-dt)};
 const target=input.target??s.x+(input.direction??0)*240*dt,targetY=input.targetY??s.y+(input.directionY??0)*240*dt;
 n.x=clamp(s.x+clamp(target-s.x,-240*dt,240*dt),24,456);n.y=clamp(s.y+clamp(targetY-s.y,-240*dt,240*dt),280,560);
 const waveLength=r.duration/8,wave=Math.min(7,Math.floor(n.time/waveLength));
 if(wave!==s.wave){n.wave=wave;n.waveMotion=0;n.waveDamaged=false;n.bubbles=[];n.invulnerable=0}
 const elapsed=n.time-wave*waveLength,previous=s.time-wave*waveLength;
 if(elapsed>=TELEGRAPH&&previous<TELEGRAPH)n.bubbles=bubblePattern(r,wave);
 else if(wave===s.wave)n.bubbles=s.bubbles.map(b=>({...b,y:b.y+b.speed*motion})).filter(b=>b.y<690);
 const hit=n.bubbles.some(b=>Math.hypot(b.x-n.x,b.y-n.y)<b.r+14);
 if(hit&&!n.waveDamaged&&n.invulnerable===0){n.hp--;n.waveDamaged=true;n.invulnerable=1;n.combo=0}
 n.targets=s.targets.map(t=>({...t,x:t.boss?guardianLaneX(t,s.targets,safeTarget(n,r)):t.x,y:t.boss?TARGET_ENTRY_Y:t.y+38*motion})).filter(t=>t.y<620);
 if(n.time>=r.duration-15&&(!n.bossStarted||n.bossHp>0&&!n.targets.some(t=>t.boss))){const next=spawnTarget(n,r,true);if(next!==n)n={...next,bossStarted:true}}
 if(n.time>=n.nextSpawn&&n.time<r.duration-4){const next=spawnTarget(n,r);if(next!==n)n={...next,nextSpawn:n.time+3}}
 const starX=r.waves[wave].corridor<240?420:60,starY=65+75*Math.max(0,n.waveMotion-TELEGRAPH);
 if(!n.collected.includes(wave)&&Math.hypot(n.x-starX,n.y-starY)<29){n.stars++;n.collected=[...n.collected,wave]}
 n=fire(n,r);
 if(n.hp<=0)n.phase='lost';else if(n.time>=r.duration)n.phase=n.correct>=r.goal?'won':'lost';
 return n;
}
export function useBomb(s:Flight):Flight{return s.phase==='flight'&&s.bomb>0&&s.bubbles.length>0?{...s,bomb:0,bubbles:[],invulnerable:1}:s}
export function score(s:Flight){return Math.min(20000,s.correct*100+s.stars*25+s.peakCombo*10+(s.bossStarted&&s.bossHp===0?250:0))}
export function encodeChallenge(c:Challenge){return`lexi=${encodeURIComponent(JSON.stringify(c))}`}
export function decodeChallenge(hash:string):Challenge|null{try{if(!hash.startsWith('#lexi='))return null;const c=JSON.parse(decodeURIComponent(hash.slice(6)))as Challenge;if(c.v!==1||!['middle','upper'].includes(c.band)||!Number.isInteger(c.level)||c.level<0||c.level>11||!Number.isInteger(c.seed)||c.seed<1||c.seed>2147483647||typeof c.timed!=='boolean'||!Number.isInteger(c.target)||c.target<0||c.target>20000)return null;return{v:1,band:c.band,level:c.level,seed:c.seed,timed:c.timed,target:c.target}}catch{return null}}
