/** World coordinates are logical pixels; feet y increases upward. Rendering never changes physics. */
export const WIDTH=480, STEP=1/120, GRAVITY=1000, JUMP=540, MAX_SPEED=225;
export type Difficulty='apprentice'|'standard';
export type CloudKind='normal'|'jelly'|'ice'|'moving'|'reward';
export type Biome=0|1|2|3;
export interface Cloud {id:number;x:number;y:number;w:number;kind:CloudKind;main:boolean;phase:number}
export interface Route {level:number;seed:number;biome:Biome;clouds:Cloud[];goal:number;endless:boolean}
export interface Climb {x:number;y:number;vx:number;vy:number;time:number;highest:number;checkpoint:number;lastCloud:number;landings:number;perfect:number;combo:number;stars:number;rescues:number;rescueAt:number;landedAt:number;status:'playing'|'won'|'fell';spent:number[];visited:number[]}
const paths=[
[240,240,225,250,220,260,235,275,245,280,250,240],
[240,205,170,205,245,285,250,210,175,215,250,280,250],
[240,280,320,275,235,195,230,275,315,275,230,200,240],
[240,205,165,200,245,285,325,280,235,190,230,270,240],
[240,280,315,275,230,185,155,200,245,290,330,285,240,210],
[240,200,160,200,245,290,325,280,235,190,150,195,240,280],
[240,280,320,280,235,190,150,190,235,280,325,285,240,200],
[240,200,155,195,240,285,330,290,245,200,155,195,240,285,250],
[240,285,330,285,240,195,150,195,240,285,330,285,240,195,240],
[240,195,150,195,240,285,330,285,240,195,150,195,240,285,330,285],
[240,285,330,285,240,195,150,195,240,285,330,285,240,195,150,195],
[240,195,150,195,240,285,330,285,240,195,150,195,240,285,330,285,240]
];
const gapPatterns=[
 [80,80,80,80], [80,88,80,84], [80,92,84,80,90],
 [82,94,86,80,92], [86,100,82,90,84], [88,82,102,86,92],
 [84,96,86,100,82], [90,82,98,86,94], [86,104,82,94,88],
 [90,100,84,96,82,92], [88,104,86,98,84,92], [84,98,90,82,106,86,92]
];
export function random(seed:number){let a=seed>>>0;return()=>{a+=0x6d2b79f5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function createRoute(level:number,seed=4103,difficulty:Difficulty='standard',endless=false):Route {
 const n=Math.max(0,Math.min(11,Math.trunc(level))),rng=random(seed+n*103),biome=Math.floor(n/3) as Biome;
 const clouds:Cloud[]=[];
 // Three authored acts reuse each route's distinct gesture, with a mirrored reply and a final variation.
 // Wide still-cloud landings separate the acts; no timer or waiting gate stretches play.
 const motif=n===0?paths[n].slice(0,10):paths[n];const points:number[]=[240];
 const rests=new Set<number>();
 for(let act=0;act<3;act++){
  for(const x of motif.slice(1))points.push(act===1?480-x:x);
  const tail=points.at(-1)!;for(const x of [tail+(240-tail)*.5,240,...(n===0?[]:[220,240,260,240,220,240])]){rests.add(points.length);points.push(x)}
 }

 let height=0;points.forEach((x,i)=>{if(i>0)height+=rests.has(i)?82:gapPatterns[n][(i-1)%gapPatterns[n].length];let kind:CloudKind='normal';if(i>2&&!rests.has(i)&&i<points.length-1){if(n>=2&&i%5===3)kind='jelly';else if(n>=5&&i%5===4)kind='ice';else if(n>=3&&i%5===2)kind='moving'}clouds.push({id:i,x,y:height,w:i===0||rests.has(i)?180:(difficulty==='apprentice'?135:118-n*1.8),kind,main:true,phase:rng()*6.28})});
 for(let i=3;i<points.length-1;i+=4){clouds.push({id:100+i,x:points[i]>240?points[i]-116:points[i]+116,y:clouds[i].y+27,w:62,kind:'reward',main:false,phase:0})}
 const route={level:n,seed,biome,clouds,goal:clouds[points.length-1].y,endless};
 return endless?extendRoute(route,3000,difficulty):route;
}
export function extendRoute(route:Route,above:number,difficulty:Difficulty):Route {
 if(!route.endless||route.goal>above+700)return route;const clouds=[...route.clouds];let y=route.goal,x=clouds.filter(c=>c.main).at(-1)!.x;let id=Math.max(...clouds.map(c=>c.id))+1;const rng=random(route.seed+Math.floor(y));
 while(y<above+1800){y+=86;x=Math.max(140,Math.min(340,x+(rng()>.5?45:-45)));const k=id%7;clouds.push({id:id++,x,y,w:difficulty==='apprentice'?128:94,kind:k===2?'moving':k===4?'ice':k===6?'jelly':'normal',main:true,phase:rng()*6.28})}
 return {...route,clouds:clouds.filter(c=>c.y>above-850),goal:y};
}
export function cloudX(cloud:Cloud,time:number){return cloud.x+(cloud.kind==='moving'?Math.sin(time*1.2+cloud.phase)*18:0)}
/** Telegraphable six-second cycle: still, right, still, left. */
export function windAt(time:number,biome:Biome){if(biome===0)return 0;const p=time%12;return p<3?0:p<6?26:p<9?0:-26}
export function initialClimb(route:Route):Climb {return{x:route.clouds[0].x,y:0,vx:0,vy:JUMP,time:0,highest:0,checkpoint:0,lastCloud:0,landings:0,perfect:0,combo:0,stars:0,rescues:1,rescueAt:-10,landedAt:-10,status:'playing',spent:[],visited:[0]}}
export function stepClimb(state:Climb,route:Route,input:number,difficulty:Difficulty,dt=STEP):Climb {
 if(state.status!=='playing')return state;
 const s={...state,spent:[...state.spent],visited:[...state.visited]};const steer=Math.max(-1,Math.min(1,Number.isFinite(input)?input:0));
 if(s.visited.length>256)s.visited=s.visited.filter(id=>route.clouds.some(c=>c.id===id));if(s.spent.length>128)s.spent=s.spent.filter(id=>route.clouds.some(c=>c.id===id));
 s.time+=dt;s.vx+=((steer*850)+windAt(state.time,route.biome))*dt;if(Math.abs(steer)<.01)s.vx*=Math.exp(-5*dt);s.vx=Math.max(-MAX_SPEED,Math.min(MAX_SPEED,s.vx));
 s.x=Math.max(16,Math.min(WIDTH-16,state.x+s.vx*dt));if(s.x===16||s.x===WIDTH-16)s.vx=0;
 s.vy=state.vy-GRAVITY*dt;s.y=state.y+(state.vy+s.vy)*.5*dt;
 // Sweep the descending feet against platform tops. Test horizontal position at exact crossing time.
 if(s.vy<0){let best:Cloud|undefined,bestT=Infinity;for(const c of route.clouds){if(s.spent.includes(c.id)||state.y<c.y||s.y>c.y||state.y===s.y)continue;const t=(state.y-c.y)/(state.y-s.y);if(t<0||t>1)continue;const px=state.x+(s.x-state.x)*t,cx=cloudX(c,state.time+dt*t);if(Math.abs(px-cx)<=c.w/2+11&&t<bestT){best=c;bestT=t}}
 if(best){s.y=best.y;s.vy=best.kind==='jelly'?JUMP*1.13:JUMP;s.lastCloud=best.id;s.landedAt=s.time;s.landings++;s.combo=Math.abs(s.x-cloudX(best,s.time))<=18?s.combo+1:0;if(!s.visited.includes(best.id)){s.visited.push(best.id);if(Math.abs(s.x-cloudX(best,s.time))<=18)s.perfect++;if(best.kind==='reward')s.stars++}if(best.kind==='ice')s.spent.push(best.id);if(best.main&&best.y>=route.clouds.find(c=>c.id===s.checkpoint)!.y)s.checkpoint=best.id;if(!route.endless&&best.main&&best.y>=route.goal)s.status='won';}}
 s.highest=Math.max(state.highest,s.y);
 if(s.y<Math.max(-180,s.highest-(difficulty==='apprentice'?490:430))){if(s.rescues>0){const c=route.clouds.find(c=>c.id===s.checkpoint)!;s.x=cloudX(c,s.time);s.y=c.y+16;s.vx=0;s.vy=JUMP;s.rescues--;s.rescueAt=s.time;}else s.status='fell'}
 return s;
}
export function score(s:Climb){return Math.floor(s.highest)+s.stars*80+s.perfect*20}
/** A steering-only controller: all completion proof uses the same public step function as the game. */
export function botInput(s:Climb,route:Route){const checkpoint=route.clouds.find(c=>c.id===s.checkpoint)!;const next=route.clouds.filter(c=>c.main&&c.y>checkpoint.y).sort((a,b)=>a.y-b.y)[0];if(!next)return 0;const target=cloudX(next,s.time+.25);const error=target-s.x;return Math.max(-1,Math.min(1,(error*7-s.vx)/90))}
export interface Challenge {v:1;seed:number;level:number;difficulty:Difficulty;target:number;endless:boolean}
export function encodeChallenge(c:Challenge){return encodeURIComponent(JSON.stringify(c))}
export function decodeChallenge(hash:string):Challenge|null {try{if(hash.length>400)return null;const c=JSON.parse(decodeURIComponent(hash.replace(/^#/,''))) as Challenge;return c.v===1&&Number.isInteger(c.seed)&&c.seed>=0&&c.seed<=2147483647&&Number.isInteger(c.level)&&c.level>=0&&c.level<12&&(c.difficulty==='standard'||c.difficulty==='apprentice')&&Number.isInteger(c.target)&&c.target>=0&&c.target<=10000000&&typeof c.endless==='boolean'?c:null}catch{return null}}
