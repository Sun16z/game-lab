import { describe, expect, it } from "vitest";
import { boards, createGame, move, type State } from "./rules";

describe("island duo cooperation",()=>{
  it("rejects walls and closed bridges without spending a turn",()=>{
    const s=createGame(0);expect(move(s,"left")).toBe(s);
    expect(move(s,"toString" as never)).toBe(s);
    const before:State={...s,players:[{x:2,y:1},{x:0,y:3}],turn:0};
    expect(move(before,"right")).toBe(before);
  });
  it("opens a bridge after a friend activates its switch",()=>{
    const s=createGame(0),before:State={...s,players:[{x:2,y:1},{x:1,y:1}],activated:[0],turn:0};
    const after=move(before,"right");expect(after.players[0]).toEqual({x:3,y:1});expect(after.turn).toBe(1);
  });
  it("every board has a solution with alternating moves",()=>{
    for(let i=0;i<boards.length;i++){
      const start=createGame(i),queue=[start],seen=new Set<string>();let solved=false;
      for(let cursor=0;cursor<queue.length&&cursor<100000;cursor++){
        const s=queue[cursor],key=JSON.stringify([s.players,s.turn,s.activated.slice().sort(),s.collected.slice().sort()]);if(seen.has(key))continue;seen.add(key);
        if(s.won){solved=true;break;}
        for(const d of ["up","down","left","right"] as const){const next=move(s,d);if(next!==s)queue.push(next);}
      }
      expect(solved,`board ${i} must be solvable`).toBe(true);
    }
  });
});
