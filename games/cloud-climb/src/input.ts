export interface SteeringEvent {key:string;down:boolean;playing:boolean;formFocused:boolean}
/** Keyup always releases, including after focus moves into a form or play pauses. */
export function steeringChange(event:SteeringEvent):{key:string;held:boolean}|null {
 const key=event.key.toLowerCase();if(!['arrowleft','arrowright','a','d'].includes(key))return null;
 if(!event.down)return{key,held:false};
 return event.playing&&!event.formFocused?{key,held:true}:null;
}
