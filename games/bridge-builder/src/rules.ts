export type Piece="deck"|"support";
export type Level=Readonly<{width:number;supports:number;maxSpan:number}>;
export const levels:readonly Level[]=[{width:1,supports:0,maxSpan:2},{width:3,supports:1,maxSpan:2},{width:5,supports:2,maxSpan:2}];
export type Board=Readonly<{level:number;decks:readonly boolean[];supports:readonly boolean[]}>;
export type TestResult=Readonly<{ok:boolean;reason:"ready"|"missing"|"unsupported"}>;
export function createBoard(level:number):Board{const index=Number.isInteger(level)&&level>=0&&level<levels.length?level:0;return{level:index,decks:Array(levels[index].width).fill(false),supports:Array(levels[index].width-1).fill(false)}}
export function setPiece(board:Board,piece:Piece,index:number):Board{if(!Number.isInteger(index))return board;const list=piece==="deck"?board.decks:piece==="support"?board.supports:undefined;if(!list||index<0||index>=list.length)return board;if(piece==="support"&&!list[index]&&list.filter(Boolean).length>=levels[board.level].supports)return board;const next=list.map((value,i)=>i===index?!value:value);return piece==="deck"?{...board,decks:next}:{...board,supports:next}}
export function testBridge(board:Board):TestResult{if(board.decks.some(value=>!value))return{ok:false,reason:"missing"};const anchors=[0,...board.supports.flatMap((placed,i)=>placed?[i+1]:[]),levels[board.level].width];return anchors.some((point,i)=>i>0&&point-anchors[i-1]>levels[board.level].maxSpan)?{ok:false,reason:"unsupported"}:{ok:true,reason:"ready"}}
