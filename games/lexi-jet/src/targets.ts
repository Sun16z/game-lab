import type {Question} from './content-types';
export interface PhraseToken{text:string;mark:boolean}
/** Keep actual sentence context: no invented article and no ambiguous bare homograph. */
export function phraseTokens(q:Question):PhraseToken[]{
 const before=q.before.trim().split(/\s+/).filter(Boolean),after=q.after.trim().split(/\s+/).filter(Boolean);
 if(q.reason==='adjective')return[{text:q.target,mark:true},{text:q.describes??after[0]??'',mark:false}].filter(t=>t.text);
 const prefix=before.slice(-2).map(text=>({text,mark:false}));
 return[...prefix,{text:q.target,mark:true},...(q.reason==='verb'?after.slice(0,2).map(text=>({text,mark:false})):[])];
}

import type {Flight,WordTarget} from './rules';
type AimState=Pick<Flight,'x'|'y'|'targets'>;
/** The HUD and cannon share the same above-jet clearance and alignment rule. */
export function closestShootableTarget(state:AimState):WordTarget|undefined{return state.targets.filter(t=>Math.abs(t.x-state.x)<47&&t.y<state.y-35).sort((a,b)=>b.y-a.y)[0]}
export function contextTarget(state:AimState):WordTarget|undefined{return closestShootableTarget(state)??state.targets.filter(t=>t.y<state.y-35).sort((a,b)=>Math.abs(a.x-state.x)-Math.abs(b.x-state.x)||b.y-a.y)[0]}
export const TARGET_ENTRY_Y=65,TARGET_MIN_GAP=110,MAX_LANE_TARGETS=3;
/** Two normal slots leave one guardian slot; arrivals wait rather than erase existing words. */
export function laneHasRoom(targets:readonly WordTarget[],x:number,boss:boolean):boolean{const lane=targets.filter(t=>Math.abs(t.x-x)<47);return lane.length<(boss?MAX_LANE_TARGETS:MAX_LANE_TARGETS-1)&&lane.every(t=>Math.abs(t.y-TARGET_ENTRY_Y)>=TARGET_MIN_GAP)}
/** Guardian lane changes obey the same queue contract as their first arrival. */
export function guardianLaneX(target:WordTarget,targets:readonly WordTarget[],destination:number):number{return destination===target.x||laneHasRoom(targets.filter(t=>t.id!==target.id),destination,true)?destination:target.x}
