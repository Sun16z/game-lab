export type GameId = "G001" | "G002" | "G003" | "G004" | "G005";
export type RunState = "READY" | "PLAYING" | "PAUSED" | "RESULT" | "ERROR";

export interface GameDefinition {
  id: GameId;
  slug: string;
  title: string;
  summary: string;
  priority: "P0" | "P1" | "P2" | "P3";
  status: "planned" | "playable";
}

export interface GameRun {
  id: string;
  gameId: GameId;
  seed: string;
  state: RunState;
  startedAt?: string;
  endedAt?: string;
}

export function createRun(gameId: GameId, seed: string, id: string): GameRun {
  return { id, gameId, seed, state: "READY" };
}

export function transitionRun(run: GameRun, next: RunState, now: string): GameRun {
  const allowed: Record<RunState, RunState[]> = {
    READY: ["PLAYING", "ERROR"],
    PLAYING: ["PAUSED", "RESULT", "ERROR"],
    PAUSED: ["PLAYING", "RESULT", "ERROR"],
    RESULT: [],
    ERROR: []
  };
  if (!allowed[run.state].includes(next)) {
    throw new Error(`Invalid run transition: ${run.state} → ${next}`);
  }
  return {
    ...run,
    state: next,
    startedAt: next === "PLAYING" && !run.startedAt ? now : run.startedAt,
    endedAt: next === "RESULT" || next === "ERROR" ? now : run.endedAt
  };
}

export const games: readonly GameDefinition[] = [
  { id: "G001", slug: "perfect-stack", title: "完美疊塔", summary: "抓準時機放下方塊，挑戰最高層數。", priority: "P0", status: "playable" },
  { id: "G002", slug: "monster-math", title: "九九乘法怪獸塔", summary: "90秒乘法快問快答，用連擊打倒怪獸與Boss。", priority: "P1", status: "playable" },
  { id: "G003", slug: "color-lab", title: "顏色實驗室", summary: "用更少步數完成試管分類。", priority: "P1", status: "planned" },
  { id: "G004", slug: "math-runner", title: "算術跑酷王", summary: "選對答案跑道，延續連勝。", priority: "P2", status: "planned" },
  { id: "G005", slug: "snow-rush", title: "雪山極速90秒", summary: "熟悉雪道，突破自己的最佳路線。", priority: "P3", status: "planned" }
];
