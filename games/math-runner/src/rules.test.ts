import { describe,expect,it } from "vitest";
import { createQuestion,initialScore,resolveGate } from "./rules";

describe("arithmetic runner rules",()=>{
  it("creates deterministic, unique and bounded answer lanes",()=>{
    for(const mode of ["warmup","city"] as const)for(let index=0;index<200;index++){
      const question=createQuestion("runner-seed",index,mode);const limit=mode==="warmup"?20:100;
      expect(createQuestion("runner-seed",index,mode)).toEqual(question);
      expect(new Set(question.options).size).toBe(3);expect(question.options[question.correctLane]).toBe(question.answer);
      expect(question.options.every(value=>value>=0&&value<=limit)).toBe(true);expect(question.answer).toBeGreaterThanOrEqual(0);expect(question.answer).toBeLessThanOrEqual(limit);
    }
  });
  it("rewards streaks and spends one shield after a wrong gate",()=>{
    const question=createQuestion("score",0,"city");let score=initialScore();
    score=resolveGate(score,question.correctLane,question).state;expect(score).toMatchObject({score:100,combo:1,shields:3,correct:1});
    score=resolveGate(score,question.correctLane,question).state;expect(score).toMatchObject({score:220,combo:2,bestCombo:2});
    const wrong=((question.correctLane+1)%3) as 0|1|2;score=resolveGate(score,wrong,question).state;expect(score).toMatchObject({score:220,combo:0,shields:2,answered:3});
  });
});
