export type Player = 0 | 1;
export type Position = Readonly<{ x: number; y: number }>;
export type Direction = "up" | "down" | "left" | "right";
export type Board = Readonly<{ width: number; height: number; walls: readonly Position[]; plates: readonly Position[]; gates: readonly Position[]; gems: readonly Position[]; starts: readonly [Position,Position]; exit: Position }>;
export type State = Readonly<{ board: Board; players: readonly [Position,Position]; turn: Player; activated: readonly number[]; collected: readonly number[]; moves: number; won: boolean }>;
const same = (a:Position,b:Position) => a.x===b.x && a.y===b.y;

/** Star switches permanently open their matching bridges for both friends. */
export const boards: readonly Board[] = [
  { width:6,height:5,starts:[{x:0,y:1},{x:0,y:3}],exit:{x:5,y:2},plates:[{x:1,y:1},{x:1,y:3}],gates:[{x:3,y:1},{x:3,y:3}],gems:[{x:4,y:1},{x:4,y:3}],walls:[{x:2,y:0},{x:2,y:2},{x:2,y:4},{x:3,y:0},{x:3,y:2},{x:3,y:4}] },
  { width:6,height:5,starts:[{x:0,y:0},{x:0,y:4}],exit:{x:5,y:2},plates:[{x:1,y:0},{x:1,y:4}],gates:[{x:3,y:0},{x:3,y:4}],gems:[{x:4,y:0},{x:4,y:4}],walls:[{x:2,y:1},{x:2,y:2},{x:2,y:3},{x:3,y:1},{x:3,y:2},{x:3,y:3}] }
];
export function createGame(index:number):State {
  const board=boards[((Math.trunc(index)%boards.length)+boards.length)%boards.length]??boards[0];
  return {board,players:[{...board.starts[0]},{...board.starts[1]}],turn:0,activated:[],collected:[],moves:0,won:false};
}
const delta:Record<Direction,Position>={up:{x:0,y:-1},down:{x:0,y:1},left:{x:-1,y:0},right:{x:1,y:0}};
export function move(state:State,direction:Direction):State {
  if(state.won || !Object.hasOwn(delta,direction))return state;
  const current=state.players[state.turn], step=delta[direction], target={x:current.x+step.x,y:current.y+step.y};
  if(target.x<0||target.y<0||target.x>=state.board.width||target.y>=state.board.height||state.board.walls.some(p=>same(p,target)))return state;
  const gate=state.board.gates.findIndex(p=>same(p,target));
  if(gate>=0 && !state.activated.includes(gate))return state;
  const players:[Position,Position]=[{...state.players[0]},{...state.players[1]}];players[state.turn]=target;
  const plate=state.board.plates.findIndex(p=>same(p,target));
  const activated=plate>=0&&!state.activated.includes(plate)?[...state.activated,plate]:state.activated;
  const found=state.board.gems.findIndex(p=>same(p,target));
  const collected=found>=0&&!state.collected.includes(found)?[...state.collected,found]:state.collected;
  const won=collected.length===state.board.gems.length&&players.every(p=>same(p,state.board.exit));
  return {...state,players,activated,collected,turn:state.turn===0?1:0,moves:state.moves+1,won};
}
