import { describe, expect, it } from "vitest";
import { answerQuestion, createQuestionStream, initialBattleState } from "./rules";

describe("monster math rules", () => {
  it("covers all 64 multiplication pairs with four distinct answers", () => {
    const next = createQuestionStream("seed-1");
    const questions = Array.from({ length: 64 }, next);
    expect(new Set(questions.map((q) => q.key)).size).toBe(64);
    for (const question of questions) {
      expect(question.answer).toBe(question.a * question.b);
      expect(new Set(question.options).size).toBe(4);
      expect(question.options[question.correctIndex]).toBe(question.answer);
    }
  });
  it("uses the same questions for the same seed and reviews past misses first", () => {
    const a = createQuestionStream("seed-2", ["7x8", "3x4"]);
    const b = createQuestionStream("seed-2", ["7x8", "3x4"]);
    expect(Array.from({ length: 10 }, a)).toEqual(Array.from({ length: 10 }, b));
    expect(createQuestionStream("seed-2", ["7x8"])().key).toBe("7x8");
  });
  it("spawns a three-hit boss after five normal victories and resets combo on misses", () => {
    let state = initialBattleState();
    for (let i = 0; i < 5; i++) state = answerQuestion(state, true).state;
    expect(state).toMatchObject({ normalSinceBoss: 5, bossHealth: 3, defeated: 5 });
    state = answerQuestion(state, false).state;
    expect(state).toMatchObject({ combo: 0, bossHealth: 3, wrong: 1 });
    for (let i = 0; i < 2; i++) state = answerQuestion(state, true).state;
    const final = answerQuestion(state, true);
    expect(final).toMatchObject({ bossDefeated: true, state: { bossHealth: 0, bossesDefeated: 1, normalSinceBoss: 0, defeated: 6 } });
  });
});
