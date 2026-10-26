import{describe,expect,it}from"vitest";
import{createObstacle,createQuestion,initialScore,resolveGate,resolveObstacle}from"./rules";

describe("math runner rules",()=>{
  it("builds deterministic grade-level math and English questions",()=>{for(const subject of["math","english"]as const)for(const grade of["middle","upper"]as const)for(let index=0;index<80;index++){const q=createQuestion("runner",index,subject,grade);expect(createQuestion("runner",index,subject,grade)).toEqual(q);expect(new Set(q.options).size).toBe(3);expect(q.correctLane).toBeGreaterThanOrEqual(0);expect(q.correctLane).toBeLessThan(3);expect(q.prompt.length).toBeGreaterThan(3)}});
  it("scores gates, obstacles, boosts and shields",()=>{const q=createQuestion("score",0,"math","middle");let state=initialScore();state=resolveGate(state,q.correctLane,q,true).state;expect(state).toMatchObject({score:150,combo:1,shields:3});state=resolveObstacle(state,true,true);expect(state).toMatchObject({score:200,obstaclesCleared:1});state=resolveObstacle(state,false);expect(state).toMatchObject({combo:0,shields:2})});
  it("creates both obstacle types across all lanes",()=>{const seen=new Set<string>();for(let index=0;index<100;index++){const obstacle=createObstacle("course",index);seen.add(obstacle.kind);seen.add(String(obstacle.lane))}expect(seen).toEqual(new Set(["hurdle","barrier","0","1","2"]))});
});
