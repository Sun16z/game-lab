export type Route=Readonly<{wind:number;target:number;tolerance:number}>;
export const routes:readonly Route[]=[{wind:-.4,target:12,tolerance:1.1},{wind:0,target:14.7,tolerance:1.1},{wind:.6,target:16.4,tolerance:1.1}];
export type State=Readonly<{index:number;throws:number;complete:boolean}>;
export const initialState=():State=>({index:0,throws:0,complete:false});
const speed=12,gravity=9.8;
export function safeAngle(value:number){return Math.max(20,Math.min(70,Number.isFinite(value)?value:40))}
export function flightDuration(angle:number){return 2*speed*Math.sin(safeAngle(angle)*Math.PI/180)/gravity}
export function position(angle:number,wind:number,time:number){const radians=safeAngle(angle)*Math.PI/180,t=Math.max(0,Math.min(flightDuration(angle),Number.isFinite(time)?time:0));return{x:speed*Math.cos(radians)*t+.5*wind*t*t,y:Math.max(0,speed*Math.sin(radians)*t-.5*gravity*t*t)}}
export function land(s:State,angle:number):{state:State;distance:number;success:boolean}{if(s.complete)return{state:s,distance:0,success:false};const route=routes[s.index],distance=position(angle,route.wind,flightDuration(angle)).x,success=Math.abs(distance-route.target)<=route.tolerance;return{state:{...s,throws:s.throws+1,index:success&&s.index<routes.length-1?s.index+1:s.index,complete:success&&s.index===routes.length-1},distance,success}}
