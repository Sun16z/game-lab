import {describe,it,expect} from "vitest";
import {puzzles,initialState,rotate,matched,confirm,type State} from "./rules";
describe("shadow puzzles",()=>{
  it("rejects incorrect attempts and wraps rotations",()=>{const s=initialState();expect(confirm(s)).toBe(s);expect(rotate(s,-1).rotation).toBe(7);});
  it("has a reachable solution for each silhouette, including symmetry",()=>{for(let index=0;index<puzzles.length;index++){const p=puzzles[index];const s:State={index,rotation:p.target,moves:0,completed:false};expect(matched(s)).toBe(true);if(p.symmetry===4)expect(matched({...s,rotation:(p.target+4)%8})).toBe(true);expect(confirm(s).completed).toBe(index===puzzles.length-1)}});
  it("contains ten unique silhouettes",()=>{expect(puzzles.length).toBeGreaterThanOrEqual(10);expect(new Set(puzzles.map(p=>p.shape)).size).toBe(puzzles.length)});
});
