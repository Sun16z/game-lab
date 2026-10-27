export type Note=0|1|2|3;
export const melodies:readonly (readonly Note[])[]=[[0,1,0],[2,0,1,2],[3,1,2,0,3]];
export type State=Readonly<{round:number;position:number;errors:number;complete:boolean}>;
export const initialState=():State=>({round:0,position:0,errors:0,complete:false});
export function tap(s:State,note:Note):{state:State;correct:boolean;roundComplete:boolean}{
 if(s.complete||!Number.isInteger(note)||note<0||note>3)return{state:s,correct:false,roundComplete:false};
 if(melodies[s.round][s.position]!==note)return{state:{...s,errors:s.errors+1},correct:false,roundComplete:false};
 const position=s.position+1;if(position<melodies[s.round].length)return{state:{...s,position},correct:true,roundComplete:false};
 if(s.round===melodies.length-1)return{state:{...s,position,complete:true},correct:true,roundComplete:true};
 return{state:{...s,round:s.round+1,position:0},correct:true,roundComplete:true};
}
