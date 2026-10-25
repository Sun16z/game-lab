export const ROUND_SECONDS = 90;
export const NORMALS_PER_BOSS = 5;
export const BOSS_HEALTH = 3;

export interface Question {
  a: number;
  b: number;
  key: string;
  answer: number;
  options: [number, number, number, number];
  correctIndex: number;
}

export interface BattleState {
  score: number;
  combo: number;
  longestCombo: number;
  correct: number;
  wrong: number;
  defeated: number;
  bossesDefeated: number;
  normalSinceBoss: number;
  bossHealth: number;
}

export function initialBattleState(): BattleState {
  return { score: 0, combo: 0, longestCombo: 0, correct: 0, wrong: 0, defeated: 0, bossesDefeated: 0, normalSinceBoss: 0, bossHealth: 0 };
}

export function answerQuestion(state: BattleState, correct: boolean): { state: BattleState; points: number; bossHit: boolean; bossDefeated: boolean; bossAppeared: boolean } {
  if (!correct) return { state: { ...state, combo: 0, wrong: state.wrong + 1 }, points: 0, bossHit: false, bossDefeated: false, bossAppeared: false };
  const combo = state.combo + 1;
  const bossHit = state.bossHealth > 0;
  const bonus = Math.min(150, Math.floor(combo / 3) * 25);
  let points = 100 + bonus + (bossHit ? 50 : 0);
  const next: BattleState = { ...state, combo, longestCombo: Math.max(state.longestCombo, combo), correct: state.correct + 1 };
  let bossDefeated = false;
  let bossAppeared = false;
  if (bossHit) {
    next.bossHealth -= 1;
    if (next.bossHealth === 0) {
      next.bossesDefeated += 1;
      next.defeated += 1;
      next.normalSinceBoss = 0;
      points += 250;
      bossDefeated = true;
    }
  } else {
    next.defeated += 1;
    next.normalSinceBoss += 1;
    if (next.normalSinceBoss >= NORMALS_PER_BOSS) {
      next.bossHealth = BOSS_HEALTH;
      bossAppeared = true;
    }
  }
  next.score += points;
  return { state: next, points, bossHit, bossDefeated, bossAppeared };
}

function seedNumber(seed: string): number {
  let hash = 2166136261;
  for (const char of seed) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function seededRandom(seed: string): () => number {
  let value = seedNumber(seed) || 1;
  return () => {
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    return (value >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: T[], random: () => number): T[] {
  for (let index = values.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [values[index], values[other]] = [values[other], values[index]];
  }
  return values;
}

export function validQuestionKey(key: string): boolean {
  return /^[2-9]x[2-9]$/.test(key);
}

export function createQuestionStream(seed: string, reviewKeys: readonly string[] = []): () => Question {
  const random = seededRandom(seed);
  const keys = Array.from({ length: 64 }, (_, index) => `${Math.floor(index / 8) + 2}x${index % 8 + 2}`);
  const review = [...new Set(reviewKeys.filter(validQuestionKey))].slice(0, 8);
  let deck: string[] = [];
  let cursor = 0;
  const refill = () => {
    deck = [...review, ...shuffle(keys.filter((key) => !review.includes(key)), random)];
    cursor = 0;
  };
  refill();
  return () => {
    if (cursor >= deck.length) refill();
    const key = deck[cursor++];
    const [a, b] = key.split("x").map(Number);
    const answer = a * b;
    const candidates = [a * (b + 1), b * (a + 1), a * (b - 1), b * (a - 1), answer + a, answer - b];
    for (let x = 2; x <= 9; x++) for (let y = 2; y <= 9; y++) candidates.push(x * y);
    const distractors = shuffle([...new Set(candidates.filter((candidate) => candidate > 0 && candidate !== answer))], random).slice(0, 3);
    const options = shuffle([answer, ...distractors], random) as [number, number, number, number];
    return { a, b, key, answer, options, correctIndex: options.indexOf(answer) };
  };
}
