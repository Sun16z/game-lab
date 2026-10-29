export interface SteeringEvent{key:string;down:boolean;playing:boolean;formFocused:boolean}
export function steeringChange(e:SteeringEvent){const key=e.key.toLowerCase();if(!['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s'].includes(key))return null;if(!e.down)return{key,held:false};return e.playing&&!e.formFocused?{key,held:true}:null}
/** Dragging is relative: touching anywhere never teleports the jet. */
export function relativeTarget(startShip:number,startPointer:number,pointer:number){return Math.max(24,Math.min(456,startShip+pointer-startPointer))}

export interface Point{x:number;y:number}
/** Relative XY motion with an above-finger target. Simulation applies its speed cap. */
export function dragTarget(ship:Point,start:Point,pointer:Point):Point{return{x:relativeTarget(ship.x,start.x,pointer.x),y:Math.max(280,Math.min(560,ship.y+pointer.y-start.y,pointer.y-75))}}
export function releasePointer(active:number|null,event:number){return active===event?null:active}
